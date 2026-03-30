<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Services\MetaIntegrationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Str;

class MetaIntegrationController extends Controller
{
    private const OAUTH_SESSION_KEY = 'meta_oauth_context';
    private const OAUTH_CACHE_PREFIX = 'meta_oauth_state:';

    public function connectInstagram(Request $request, MetaIntegrationService $metaIntegrationService)
    {
        if (! $metaIntegrationService->isInstagramLoginConfigured()) {
            return Redirect::route('account_registration', [
                'error' => 'Instagram Login is not configured yet.',
            ]);
        }

        $accountId = $request->integer('account_id') ?: null;
        if ($accountId) {
            $account = Account::where('id', $accountId)
                ->where('user_id', $request->user()->id)
                ->where('service', 'instagram')
                ->first();

            if (! $account) {
                abort(404);
            }
        }

        $state = Str::random(40);
        $context = [
            'state' => $state,
            'service' => 'instagram',
            'flow' => 'instagram_login',
            'user_id' => $request->user()->id,
            'account_id' => $accountId,
        ];

        session([
            self::OAUTH_SESSION_KEY => $context,
            'service' => 'instagram',
        ]);

        Cache::put($this->cacheKey($state), $context, now()->addMinutes(15));

        return redirect()->away($metaIntegrationService->instagramLoginAuthorizationUrl($state));
    }

    public function connect(Request $request, string $service, MetaIntegrationService $metaIntegrationService)
    {
        if ($service === 'instagram') {
            return $this->connectInstagram($request, $metaIntegrationService);
        }

        if (! in_array($service, $metaIntegrationService->supportedServices(), true)) {
            abort(404);
        }

        if (! $metaIntegrationService->isConfigured()) {
            return Redirect::route('account_registration', [
                'error' => 'Meta connection is not configured yet.',
            ]);
        }

        $accountId = $request->integer('account_id') ?: null;
        if ($accountId) {
            $account = Account::where('id', $accountId)
                ->where('user_id', $request->user()->id)
                ->first();

            if (! $account) {
                abort(404);
            }
        }

        $state = Str::random(40);
        $context = [
            'state' => $state,
            'service' => $service,
            'user_id' => $request->user()->id,
            'account_id' => $accountId,
        ];

        session([
            self::OAUTH_SESSION_KEY => $context,
            'service' => $service,
        ]);

        Cache::put($this->cacheKey($state), $context, now()->addMinutes(15));

        return redirect()->away($metaIntegrationService->authorizationUrl($service, $state));
    }

    public function handleInstagramOauthCallback(Request $request, MetaIntegrationService $metaIntegrationService)
    {
        $state = (string) $request->input('state');
        $oauthContext = session(self::OAUTH_SESSION_KEY);

        if (! is_array($oauthContext) && $state !== '') {
            $oauthContext = Cache::get($this->cacheKey($state));
        }

        if (! is_array($oauthContext) || (string) ($oauthContext['flow'] ?? '') !== 'instagram_login') {
            return Redirect::route('account_registration', [
                'error' => 'Instagram connection session expired. Please try again.',
            ]);
        }

        $userId = (int) ($oauthContext['user_id'] ?? 0);
        $accountId = isset($oauthContext['account_id']) ? (int) $oauthContext['account_id'] : null;

        if ($request->filled('error') || $request->filled('error_description')) {
            $this->clearOauthState((string) ($oauthContext['state'] ?? $state));
            $this->restoreUserSession($request, $userId);

            Log::info('Instagram Login callback returned an error.', [
                'user_id' => $userId,
                'account_id' => $accountId,
                'error' => $request->input('error'),
            ]);

            return Redirect::route('account_registration', [
                'error' => $request->input('error_description', 'Instagram connection was cancelled.'),
            ]);
        }

        if ($state !== (string) ($oauthContext['state'] ?? '')) {
            $this->clearOauthState((string) ($oauthContext['state'] ?? $state));

            return Redirect::route('account_registration', [
                'error' => 'Invalid Instagram connection state.',
            ]);
        }

        if (! $request->filled('code')) {
            $this->clearOauthState($state);

            return Redirect::route('account_registration', [
                'error' => 'Instagram did not return an authorization code.',
            ]);
        }

        $this->restoreUserSession($request, $userId);

        $existingAccount = null;
        if ($accountId) {
            $existingAccount = Account::where('id', $accountId)
                ->where('user_id', $userId)
                ->where('service', 'instagram')
                ->first();
        }

        Log::info('Instagram Login callback started.', [
            'user_id' => $userId,
            'account_id' => $accountId,
        ]);

        try {
            $tokenPayload = $metaIntegrationService->exchangeInstagramLoginCodeForAccessToken((string) $request->input('code'));
            $token = (string) ($tokenPayload['access_token'] ?? '');

            $longLivedTokenPayload = $metaIntegrationService->exchangeInstagramLoginLongLivedToken($token);
            if (is_array($longLivedTokenPayload) && isset($longLivedTokenPayload['access_token'])) {
                $tokenPayload = $longLivedTokenPayload;
                $token = (string) $longLivedTokenPayload['access_token'];
            }

            $profile = $metaIntegrationService->fetchInstagramLoginProfile($token);
            $account = $metaIntegrationService->persistInstagramLoginConnection(
                $userId,
                $profile,
                $token,
                $tokenPayload,
                $existingAccount
            );

            $this->clearOauthState($state);

            return Redirect::route('account_view', $account->id);
        } catch (\Throwable $e) {
            $this->clearOauthState($state);

            Log::warning('Instagram Login connect failed.', [
                'user_id' => $userId,
                'account_id' => $accountId,
                'message' => $e->getMessage(),
            ]);

            return Redirect::route('account_registration', [
                'error' => 'Unable to connect Instagram right now. Please try again.',
            ]);
        }
    }

    public function handleOauthCallback(Request $request, MetaIntegrationService $metaIntegrationService)
    {
        $state = (string) $request->input('state');
        $oauthContext = session(self::OAUTH_SESSION_KEY);

        if (! is_array($oauthContext) && $state !== '') {
            $oauthContext = Cache::get($this->cacheKey($state));
        }

        if (! is_array($oauthContext)) {
            return Redirect::route('account_registration', [
                'error' => 'Meta connection session expired. Please try again.',
            ]);
        }

        $service = (string) ($oauthContext['service'] ?? '');
        $userId = (int) ($oauthContext['user_id'] ?? 0);
        $accountId = isset($oauthContext['account_id']) ? (int) $oauthContext['account_id'] : null;

        if ($request->filled('error') || $request->filled('error_description')) {
            $this->clearOauthState((string) ($oauthContext['state'] ?? $state));
            $this->restoreUserSession($request, $userId);

            Log::info('Meta OAuth callback returned an error.', [
                'service' => $service,
                'user_id' => $userId,
                'account_id' => $accountId,
                'error' => $request->input('error'),
            ]);

            return Redirect::route('account_registration', [
                'error' => $request->input('error_description', 'Meta connection was cancelled.'),
            ]);
        }

        if ($state !== (string) ($oauthContext['state'] ?? '')) {
            $this->clearOauthState((string) ($oauthContext['state'] ?? $state));

            return Redirect::route('account_registration', [
                'error' => 'Invalid Meta connection state.',
            ]);
        }

        if (! $request->filled('code')) {
            $this->clearOauthState($state);

            return Redirect::route('account_registration', [
                'error' => 'Meta did not return an authorization code.',
            ]);
        }

        $this->restoreUserSession($request, $userId);

        $existingAccount = null;
        if ($accountId) {
            $existingAccount = Account::where('id', $accountId)
                ->where('user_id', $userId)
                ->first();
        }

        Log::info('Meta OAuth callback started.', [
            'service' => $service,
            'user_id' => $userId,
            'account_id' => $accountId,
        ]);

        try {
            $tokenPayload = $metaIntegrationService->exchangeCodeForAccessToken((string) $request->input('code'));
            $token = (string) ($tokenPayload['access_token'] ?? '');

            $longLivedTokenPayload = $metaIntegrationService->exchangeLongLivedToken($token);
            if (is_array($longLivedTokenPayload) && isset($longLivedTokenPayload['access_token'])) {
                $tokenPayload = $longLivedTokenPayload;
                $token = (string) $longLivedTokenPayload['access_token'];
            }

            $profile = $metaIntegrationService->fetchUserProfile($token);

            Log::info('Meta token exchange succeeded.', [
                'service' => $service,
                'user_id' => $userId,
                'account_id' => $accountId,
                'meta_user_id' => (string) ($profile['id'] ?? ''),
            ]);

            $this->clearOauthState($state);

            return $this->finalizeConnection(
                $metaIntegrationService,
                $service,
                $userId,
                $profile,
                $token,
                $tokenPayload,
                $existingAccount
            );
        } catch (\Throwable $e) {
            $this->clearOauthState($state);

            Log::warning('Meta connect failed.', [
                'service' => $service,
                'user_id' => $userId,
                'account_id' => $accountId,
                'message' => $e->getMessage(),
            ]);

            return Redirect::route('account_registration', [
                'error' => 'Unable to connect Meta right now. Please try again.',
            ]);
        }
    }

    public function verifyWebhook(Request $request, MetaIntegrationService $metaIntegrationService)
    {
        return $metaIntegrationService->verifyWebhookSubscription($request);
    }

    public function receiveWebhook(Request $request, MetaIntegrationService $metaIntegrationService)
    {
        $metaIntegrationService->handleWebhookPayload($request);

        return response()->json(['status' => 'ok'], 200);
    }

    public function verifyInstagramWebhook(Request $request, MetaIntegrationService $metaIntegrationService)
    {
        return $metaIntegrationService->verifyWebhookSubscription($request);
    }

    public function receiveInstagramWebhook(Request $request, MetaIntegrationService $metaIntegrationService)
    {
        $metaIntegrationService->handleWebhookPayload($request);

        return response()->json(['status' => 'ok'], 200);
    }

    public function verifyLegacyInstagramWebhook(Request $request, MetaIntegrationService $metaIntegrationService)
    {
        return $metaIntegrationService->verifyWebhookSubscription($request, true);
    }

    public function receiveLegacyInstagramWebhook(Request $request, MetaIntegrationService $metaIntegrationService)
    {
        $metaIntegrationService->handleWebhookPayload($request, true);

        return response()->json(['status' => 'ok'], 200);
    }

    public function facebookSetupState(Request $request, Account $account, MetaIntegrationService $metaIntegrationService)
    {
        $this->authorizeOwnedAccount($request, $account);

        if ($account->service !== 'facebook') {
            abort(404);
        }

        return response()->json(
            $metaIntegrationService->buildFacebookSetupPayload($account, true)
        );
    }

    public function saveFacebookPage(Request $request, Account $account, MetaIntegrationService $metaIntegrationService)
    {
        $this->authorizeOwnedAccount($request, $account);

        if ($account->service !== 'facebook') {
            abort(404);
        }

        $validated = $request->validate([
            'page_id' => ['required', 'string'],
        ]);

        try {
            $payload = $metaIntegrationService->saveFacebookPageSelection(
                $account,
                (string) $validated['page_id']
            );
        } catch (\Throwable $e) {
            Log::warning('Saving Facebook Page selection failed.', [
                'account_id' => $account->id,
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Unable to save the selected Facebook Page.',
            ], 422);
        }

        return response()->json([
            'account' => [
                'id' => $account->id,
                'status' => $account->status,
                'fb_page_name' => $account->fb_page_name,
                'fb_phone_number_id' => $account->fb_phone_number_id,
            ],
            'setup' => $payload,
        ]);
    }

    public function instagramStatus(Request $request, Account $account, MetaIntegrationService $metaIntegrationService)
    {
        $this->authorizeOwnedAccount($request, $account);

        if ($account->service !== 'instagram') {
            abort(404);
        }

        return response()->json(
            $metaIntegrationService->getInstagramConnectionStatus($account)
        );
    }

    public function instagramPages(Request $request, Account $account, MetaIntegrationService $metaIntegrationService)
    {
        $this->authorizeOwnedAccount($request, $account);

        if ($account->service !== 'instagram') {
            abort(404);
        }

        $payload = $metaIntegrationService->listAvailablePagesForInstagram($account);

        return response()->json([
            'available_pages' => $payload['available_pages'],
            'selected_page' => $payload['selected_page'],
            'linked_instagram_accounts' => $payload['linked_instagram_accounts'],
            'status' => $payload['status'],
            'message' => $payload['message'],
        ]);
    }

    public function selectInstagramPage(Request $request, Account $account, MetaIntegrationService $metaIntegrationService)
    {
        $this->authorizeOwnedAccount($request, $account);

        if ($account->service !== 'instagram') {
            abort(404);
        }

        $validated = $request->validate([
            'page_id' => ['required', 'string'],
        ]);

        try {
            $payload = $metaIntegrationService->saveInstagramPageSelection(
                $account,
                (string) $validated['page_id']
            );
        } catch (\Throwable $e) {
            Log::warning('Saving Instagram page selection failed.', [
                'account_id' => $account->id,
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Unable to save the selected Facebook Page for Instagram.',
            ], 422);
        }

        return response()->json([
            'account' => [
                'id' => $account->id,
                'status' => $account->status,
                'meta_page_id' => $account->meta_page_id,
                'meta_page_name' => $account->meta_page_name,
                'instagram_account_id' => $account->instagram_account_id,
                'instagram_username' => $account->instagram_username,
            ],
            'setup' => $payload,
        ]);
    }

    public function finalizeInstagram(Request $request, Account $account, MetaIntegrationService $metaIntegrationService)
    {
        $this->authorizeOwnedAccount($request, $account);

        if ($account->service !== 'instagram') {
            abort(404);
        }

        $validated = $request->validate([
            'page_id' => ['required', 'string'],
            'instagram_account_id' => ['nullable', 'string'],
        ]);

        try {
            $payload = $metaIntegrationService->finalizeInstagramConnection(
                $account,
                (string) $validated['page_id'],
                $validated['instagram_account_id'] ?? null
            );
        } catch (\Throwable $e) {
            Log::warning('Finalizing Instagram connection failed.', [
                'account_id' => $account->id,
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Unable to finalize the Instagram connection.',
            ], 422);
        }

        return response()->json([
            'account' => [
                'id' => $account->id,
                'status' => $account->status,
                'meta_page_id' => $account->meta_page_id,
                'meta_page_name' => $account->meta_page_name,
                'instagram_account_id' => $account->instagram_account_id,
                'instagram_username' => $account->instagram_username,
                'instagram_name' => $account->instagram_name,
            ],
            'setup' => $payload,
        ]);
    }

    private function finalizeConnection(
        MetaIntegrationService $metaIntegrationService,
        string $service,
        int $userId,
        array $profile,
        string $token,
        array $tokenPayload,
        ?Account $existingAccount
    ) {
        if ($service === 'product') {
            $metaIntegrationService->persistProductConnection((string) ($profile['id'] ?? ''), $token);

            return Redirect::route('wallet_subscription', ['tab' => 'settings']);
        }

        if ($service === 'fb_token') {
            $fbToken = $metaIntegrationService->persistCatalogToken(
                (string) ($profile['name'] ?? 'Meta Profile'),
                (string) ($profile['id'] ?? ''),
                $token
            );

            return Redirect::route('listCatalog', ['fbToken' => $fbToken->id]);
        }

        if (! in_array($service, ['facebook', 'instagram'], true)) {
            return Redirect::route('account_registration', [
                'error' => 'Unsupported Meta service.',
            ]);
        }

        $account = $metaIntegrationService->persistSocialAccount(
            $userId,
            $service,
            $profile,
            $token,
            $tokenPayload,
            $existingAccount
        );

        if ($service === 'instagram') {
            $setup = $metaIntegrationService->buildInstagramSetupPayload($account, true);
            if ($setup['setup_complete']) {
                return Redirect::route('account_view', $account->id);
            }

            return Redirect::route('edit_account', [
                'id' => $account->id,
                'completion' => 'instagram-setup',
            ]);
        }

        $setup = $metaIntegrationService->buildFacebookSetupPayload($account);

        if ($setup['status'] === 'connected') {
            return Redirect::route('account_view', $account->id);
        }

        return Redirect::route('edit_account', [
            'id' => $account->id,
            'completion' => 'facebook-page',
        ]);
    }

    private function cacheKey(string $state): string
    {
        return self::OAUTH_CACHE_PREFIX . $state;
    }

    private function clearOauthState(string $state): void
    {
        session()->forget(self::OAUTH_SESSION_KEY);

        if ($state !== '') {
            Cache::forget($this->cacheKey($state));
        }
    }

    private function restoreUserSession(Request $request, int $userId): void
    {
        if ($userId <= 0) {
            return;
        }

        $currentUser = $request->user();
        if (! $currentUser || (int) $currentUser->id !== $userId) {
            Auth::loginUsingId($userId);
            $request->session()->regenerate();
        }
    }

    private function authorizeOwnedAccount(Request $request, Account $account): void
    {
        if ((int) $account->user_id !== (int) optional($request->user())->id) {
            abort(404);
        }
    }
}
