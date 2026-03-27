<?php

namespace App\Services;

use App\Http\Controllers\MsgController;
use App\Models\Account;
use App\Models\Contact;
use App\Models\FaceBookAppToken;
use App\Models\Msg;
use App\Models\Setting;
use App\Models\WhatsAppUsers;
use Illuminate\Support\Arr;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class MetaIntegrationService
{
    /**
     * OAuth and webhooks are separate protocols, so they intentionally
     * use different routes and different handlers.
     */
    public function supportedServices(): array
    {
        return ['facebook', 'instagram', 'product', 'fb_token'];
    }

    public function isConfigured(): bool
    {
        return (bool) (
            config('app.meta.app_id')
            && config('app.meta.app_secret')
            && config('app.meta.login_config_id')
            && config('app.meta.redirect_uri')
        );
    }

    public function authorizationUrl(string $service, string $state): string
    {
        $query = http_build_query(array_filter([
            'client_id' => config('app.meta.app_id'),
            'redirect_uri' => config('app.meta.redirect_uri'),
            'state' => $state,
            'response_type' => 'code',
            'config_id' => config('app.meta.login_config_id'),
            'scope' => implode(',', $this->permissionsFor($service)),
        ]));

        return sprintf(
            'https://www.facebook.com/%s/dialog/oauth?%s',
            config('app.meta.graph_version'),
            $query
        );
    }

    public function exchangeCodeForAccessToken(string $code): array
    {
        $response = Http::get($this->graphUrl('/oauth/access_token'), [
            'client_id' => config('app.meta.app_id'),
            'client_secret' => config('app.meta.app_secret'),
            'redirect_uri' => config('app.meta.redirect_uri'),
            'code' => $code,
        ])->throw()->json();

        if (! isset($response['access_token'])) {
            throw new RuntimeException('Meta did not return an access token.');
        }

        return is_array($response) ? $response : [];
    }

    public function exchangeLongLivedToken(string $token): ?array
    {
        $response = Http::get($this->graphUrl('/oauth/access_token'), [
            'grant_type' => 'fb_exchange_token',
            'client_id' => config('app.meta.app_id'),
            'client_secret' => config('app.meta.app_secret'),
            'fb_exchange_token' => $token,
        ]);

        if (! $response->successful()) {
            Log::warning('Meta long-lived token exchange failed.', [
                'status' => $response->status(),
            ]);

            return null;
        }

        $payload = $response->json();

        return is_array($payload) && isset($payload['access_token'])
            ? $payload
            : null;
    }

    public function fetchUserProfile(string $token): array
    {
        $response = Http::get($this->graphUrl('/me'), [
            'fields' => 'id,name',
            'access_token' => $token,
        ])->throw()->json();

        if (! is_array($response) || ! isset($response['id'])) {
            throw new RuntimeException('Meta profile response is invalid.');
        }

        return $response;
    }

    public function fetchPages(string $token): array
    {
        $response = Http::get($this->graphUrl('/me/accounts'), [
            'fields' => 'id,name,access_token,instagram_business_account{id,username,name}',
            'access_token' => $token,
        ])->throw()->json();

        $pages = [];

        foreach (($response['data'] ?? []) as $page) {
            $pageId = (string) ($page['id'] ?? '');
            if ($pageId === '') {
                continue;
            }

            $pages[$pageId] = array_filter([
                'id' => $pageId,
                'name' => (string) ($page['name'] ?? ''),
                'token' => (string) ($page['access_token'] ?? ''),
                'instagram' => ! empty($page['instagram_business_account'])
                    ? [
                        'id' => (string) ($page['instagram_business_account']['id'] ?? ''),
                        'name' => (string) ($page['instagram_business_account']['name'] ?? ''),
                        'username' => (string) ($page['instagram_business_account']['username'] ?? ''),
                    ]
                    : null,
            ], static fn ($value) => $value !== null && $value !== '');
        }

        return $pages;
    }

    public function persistSocialAccount(
        int $userId,
        string $service,
        array $profile,
        string $accessToken,
        array $tokenPayload = [],
        ?Account $existingAccount = null
    ): Account {
        $pages = $this->fetchPages($accessToken);

        $account = $existingAccount ?: new Account();
        $account->user_id = $userId;
        $account->service = $service;
        $account->service_engine = 'facebook';
        $account->company_name = $account->company_name ?: (string) ($profile['name'] ?? 'Meta Profile');
        $account->fb_token = $accessToken;
        $account->fb_user_id = (string) ($profile['id'] ?? '');
        $account->fb_meta_data = base64_encode(serialize($pages));
        $account->connection_metadata = $this->buildConnectionMetadata(
            is_array($account->connection_metadata) ? $account->connection_metadata : [],
            $profile,
            $pages,
            $tokenPayload
        );
        $account->status = $account->fb_phone_number_id && isset($pages[$account->fb_phone_number_id])
            ? 'Active'
            : 'Draft';

        if ($service === 'instagram') {
            $this->synchronizeInstagramConnection($account, $pages);
        } else {
            $this->applySelectedAssetData($account, $pages);
        }
        $account->save();
        $this->syncHistoricalChatsIfNeeded($account);

        return $account;
    }

    public function buildFacebookSetupPayload(Account $account, bool $refreshPagesIfMissing = false): array
    {
        $pages = $this->availablePagesForAccount($account, $refreshPagesIfMissing);
        $selectedPageId = (string) ($account->fb_phone_number_id ?? '');
        $selectedPage = $selectedPageId !== '' ? ($pages[$selectedPageId] ?? null) : null;
        $selectedPageName = $selectedPage['name'] ?? ($account->fb_page_name ?: null);
        $profileName = (string) (
            Arr::get($account->connection_metadata, 'meta.user.name')
            ?: $account->company_name
            ?: ''
        );

        $status = $this->facebookConnectionStatus($account, $pages, $selectedPageName);

        return [
            'service' => $account->service,
            'account_id' => $account->id,
            'account_name' => $profileName,
            'status' => $status,
            'status_label' => $this->facebookConnectionStatusLabel($status),
            'requires_action' => in_array($status, ['oauth_connected_pending_page', 'connection_error'], true),
            'page_id' => $selectedPageId !== '' ? $selectedPageId : null,
            'page_name' => $selectedPageName,
            'available_pages' => array_values(array_map(function (array $page) {
                return array_filter([
                    'id' => (string) ($page['id'] ?? ''),
                    'name' => (string) ($page['name'] ?? ''),
                    'instagram' => ! empty($page['instagram']) ? $page['instagram'] : null,
                ], static fn ($value) => $value !== null && $value !== '');
            }, $pages)),
        ];
    }

    public function saveFacebookPageSelection(Account $account, string $pageId): array
    {
        $pages = $this->availablePagesForAccount($account, true);

        if (! isset($pages[$pageId])) {
            throw new RuntimeException('The selected Facebook Page is not available for this Meta connection.');
        }

        $selectedPage = $pages[$pageId];
        $account->fb_phone_number_id = $pageId;
        $account->fb_page_name = (string) ($selectedPage['name'] ?? '');
        $account->status = 'Active';

        $this->applySelectedAssetData($account, $pages);

        $connectionMetadata = is_array($account->connection_metadata) ? $account->connection_metadata : [];
        $connectionMetadata['meta']['selected_page'] = [
            'id' => $pageId,
            'name' => $account->fb_page_name,
            'selected_at' => now()->toIso8601String(),
        ];
        $account->connection_metadata = $connectionMetadata;
        $account->save();
        $this->subscribeSelectedFacebookPage($account);
        $this->syncHistoricalChatsIfNeeded($account);

        return $this->buildFacebookSetupPayload($account);
    }

    public function buildInstagramSetupPayload(Account $account, bool $refreshPagesIfMissing = false): array
    {
        $pages = $this->availablePagesForAccount($account, $refreshPagesIfMissing);
        $this->synchronizeInstagramConnection($account, $pages, true);

        $selectedPageId = (string) ($account->meta_page_id ?: $account->fb_phone_number_id ?: '');
        $selectedPage = $selectedPageId !== '' ? ($pages[$selectedPageId] ?? null) : null;
        $linkedInstagramAccounts = $this->linkedInstagramAccountsForPage($selectedPage);
        $selectedInstagramId = (string) ($account->instagram_account_id ?: '');
        $selectedInstagramAccount = $selectedInstagramId !== ''
            ? collect($linkedInstagramAccounts)->firstWhere('id', $selectedInstagramId)
            : null;
        $profileName = (string) (
            Arr::get($account->connection_metadata, 'meta.user.name')
            ?: $account->company_name
            ?: ''
        );
        $status = $this->instagramConnectionStatus($account, $linkedInstagramAccounts);

        return [
            'service' => 'instagram',
            'account_id' => $account->id,
            'account_name' => $profileName,
            'oauth_connected' => ! empty($account->fb_token),
            'page_selected' => $selectedPageId !== '',
            'selected_page' => $selectedPageId !== ''
                ? array_filter([
                    'id' => $selectedPageId,
                    'name' => (string) ($account->meta_page_name ?: $account->fb_page_name ?: ''),
                ], static fn ($value) => $value !== null && $value !== '')
                : null,
            'available_pages' => array_values(array_map(function (array $page) {
                return [
                    'id' => (string) ($page['id'] ?? ''),
                    'name' => (string) ($page['name'] ?? ''),
                    'linked_instagram_accounts' => $this->linkedInstagramAccountsForPage($page),
                ];
            }, $pages)),
            'linked_instagram_accounts' => $linkedInstagramAccounts,
            'instagram_selected' => ! empty($selectedInstagramAccount),
            'selected_instagram_account' => $selectedInstagramAccount ?: null,
            'setup_complete' => $status === 'connected',
            'status' => $status,
            'status_label' => $this->instagramConnectionStatusLabel($status),
            'message' => $this->instagramConnectionMessage($status, $linkedInstagramAccounts),
        ];
    }

    public function listAvailablePagesForInstagram(Account $account): array
    {
        return $this->buildInstagramSetupPayload($account, true);
    }

    public function saveInstagramPageSelection(Account $account, string $pageId): array
    {
        $pages = $this->availablePagesForAccount($account, true);

        if (! isset($pages[$pageId])) {
            throw new RuntimeException('The selected Facebook Page is not available for this Meta connection.');
        }

        $selectedPage = $pages[$pageId];
        $account->meta_provider = 'instagram';
        $account->meta_page_id = $pageId;
        $account->meta_page_name = (string) ($selectedPage['name'] ?? '');
        $account->meta_page_token = (string) ($selectedPage['token'] ?? '');
        $account->fb_phone_number_id = $pageId;
        $account->fb_page_name = $account->meta_page_name;
        $account->page_token = $account->meta_page_token;
        $account->instagram_account_id = null;
        $account->instagram_username = null;
        $account->instagram_name = null;
        $account->fb_insta_app_id = null;
        $account->insta_user_name = null;

        $connectionMetadata = is_array($account->connection_metadata) ? $account->connection_metadata : [];
        $connectionMetadata['instagram']['selected_page'] = [
            'id' => $pageId,
            'name' => $account->meta_page_name,
            'selected_at' => now()->toIso8601String(),
        ];
        $account->connection_metadata = $connectionMetadata;

        $linkedAccounts = $this->linkedInstagramAccountsForPage($selectedPage);
        if (count($linkedAccounts) === 1) {
            $selectedInstagram = $linkedAccounts[0];
            $this->applyInstagramAccountSelection($account, $selectedInstagram);
            $this->setInstagramConnectionState($account, 'connected');
        } else {
            $this->setInstagramConnectionState($account, 'needs_instagram');
        }

        $this->storeInstagramMetaData($account, $pages);
        $account->save();
        $this->subscribeSelectedFacebookPage($account);
        $this->syncHistoricalChatsIfNeeded($account);

        return $this->buildInstagramSetupPayload($account);
    }

    public function finalizeInstagramConnection(Account $account, string $pageId, ?string $instagramAccountId = null): array
    {
        $pages = $this->availablePagesForAccount($account, true);

        if (! isset($pages[$pageId])) {
            throw new RuntimeException('The selected Facebook Page is not available for this Meta connection.');
        }

        $selectedPage = $pages[$pageId];
        $linkedAccounts = $this->linkedInstagramAccountsForPage($selectedPage);

        if ($linkedAccounts === []) {
            $account->meta_provider = 'instagram';
            $account->meta_page_id = $pageId;
            $account->meta_page_name = (string) ($selectedPage['name'] ?? '');
            $account->meta_page_token = (string) ($selectedPage['token'] ?? '');
            $account->fb_phone_number_id = $pageId;
            $account->fb_page_name = $account->meta_page_name;
            $account->page_token = $account->meta_page_token;
            $account->instagram_account_id = null;
            $account->instagram_username = null;
            $account->instagram_name = null;
            $account->fb_insta_app_id = null;
            $account->insta_user_name = null;
            $this->setInstagramConnectionState($account, 'needs_instagram');
            $this->storeInstagramMetaData($account, $pages);
            $account->save();

            return $this->buildInstagramSetupPayload($account);
        }

        if ($instagramAccountId === null && count($linkedAccounts) === 1) {
            $instagramAccountId = (string) ($linkedAccounts[0]['id'] ?? '');
        }

        $selectedInstagram = collect($linkedAccounts)->firstWhere('id', (string) $instagramAccountId);
        if (! $selectedInstagram) {
            throw new RuntimeException('The selected Instagram account is not available for this Facebook Page.');
        }

        $account->meta_provider = 'instagram';
        $account->meta_page_id = $pageId;
        $account->meta_page_name = (string) ($selectedPage['name'] ?? '');
        $account->meta_page_token = (string) ($selectedPage['token'] ?? '');
        $account->fb_phone_number_id = $pageId;
        $account->fb_page_name = $account->meta_page_name;
        $account->page_token = $account->meta_page_token;
        $this->applyInstagramAccountSelection($account, $selectedInstagram);
        $this->setInstagramConnectionState($account, 'connected');

        $connectionMetadata = is_array($account->connection_metadata) ? $account->connection_metadata : [];
        $connectionMetadata['instagram']['selected_page'] = [
            'id' => $pageId,
            'name' => $account->meta_page_name,
            'selected_at' => now()->toIso8601String(),
        ];
        $connectionMetadata['instagram']['selected_instagram_account'] = $selectedInstagram;
        $account->connection_metadata = $connectionMetadata;

        $this->storeInstagramMetaData($account, $pages);
        $account->save();
        $this->subscribeSelectedFacebookPage($account);
        $this->syncHistoricalChatsIfNeeded($account);

        return $this->buildInstagramSetupPayload($account);
    }

    public function getInstagramConnectionStatus(Account $account): array
    {
        return $this->buildInstagramSetupPayload($account, true);
    }

    public function availablePagesForAccount(Account $account, bool $refreshPagesIfMissing = false): array
    {
        $pages = $this->extractPagesFromAccount($account);

        if (! empty($pages) || ! $refreshPagesIfMissing || empty($account->fb_token)) {
            return $pages;
        }

        try {
            $pages = $this->fetchPages((string) $account->fb_token);
        } catch (\Throwable $e) {
            Log::warning('Meta page refresh failed.', [
                'account_id' => $account->id,
                'message' => $e->getMessage(),
            ]);

            return [];
        }

        $profile = [
            'id' => (string) ($account->fb_user_id ?? Arr::get($account->connection_metadata, 'meta.user.id', '')),
            'name' => (string) (Arr::get($account->connection_metadata, 'meta.user.name') ?: $account->company_name),
        ];

        $account->fb_meta_data = base64_encode(serialize($pages));
        $account->connection_metadata = $this->buildConnectionMetadata(
            is_array($account->connection_metadata) ? $account->connection_metadata : [],
            $profile,
            $pages,
            Arr::get($account->connection_metadata, 'meta.token', [])
        );
        if ($account->service === 'instagram') {
            $this->synchronizeInstagramConnection($account, $pages);
        } else {
            $this->applySelectedAssetData($account, $pages);
        }
        $account->save();

        return $pages;
    }

    public function persistProductConnection(string $metaUserId, string $token): void
    {
        $businessList = $this->fetchBusinesses($metaUserId, $token);
        $metaData = [
            'is_fb_connect' => $token,
            'fb_busness_list' => $businessList,
        ];

        foreach ($metaData as $key => $value) {
            $userTokenData = Setting::where('meta_key', $key)->first() ?: new Setting();
            $userTokenData->meta_key = $key;
            $userTokenData->meta_value = base64_encode(serialize($value));
            $userTokenData->save();
        }
    }

    public function persistCatalogToken(string $profileName, string $metaUserId, string $token): FaceBookAppToken
    {
        $businessList = $this->fetchBusinesses($metaUserId, $token);

        $fbToken = FaceBookAppToken::where('user_id', $metaUserId)->first() ?: new FaceBookAppToken();
        $fbToken->name = $profileName;
        $fbToken->user_id = $metaUserId;
        $fbToken->token = $token;
        $fbToken->business_name = $businessList;
        $fbToken->save();

        return $fbToken;
    }

    public function verifyWebhookSubscription(Request $request, bool $allowLegacyKeys = false)
    {
        [$mode, $token, $challenge] = $this->webhookVerificationValues($request, $allowLegacyKeys);

        if ($mode === 'subscribe' && hash_equals((string) config('app.meta.verify_token'), (string) $token)) {
            Log::info('Meta webhook verification succeeded.', [
                'path' => $request->path(),
                'legacy_query_keys' => $allowLegacyKeys,
            ]);

            return response((string) $challenge, 200)
                ->header('Content-Type', 'text/plain; charset=UTF-8');
        }

        Log::warning('Meta webhook verification failed.', [
            'path' => $request->path(),
            'mode' => $mode,
            'legacy_query_keys' => $allowLegacyKeys,
        ]);

        return response('Invalid verify token', 403);
    }

    public function handleWebhookPayload(Request $request, bool $legacyRoute = false): void
    {
        $payload = $request->all();
        $object = (string) ($payload['object'] ?? '');

        Log::info('Meta webhook event received.', [
            'path' => $request->path(),
            'legacy_route' => $legacyRoute,
            'object' => $object !== '' ? $object : null,
            'entry_count' => count($payload['entry'] ?? []),
            'summary' => $this->summarizeWebhookPayload($payload),
        ]);

        foreach (($payload['entry'] ?? []) as $entry) {
            foreach (($entry['messaging'] ?? []) as $event) {
                try {
                    $this->handleMetaMessagingEvent($object, $entry, (array) $event);
                } catch (\Throwable $e) {
                    Log::warning('Unable to process Meta messaging event.', [
                        'legacy_route' => $legacyRoute,
                        'object' => $object !== '' ? $object : null,
                        'entry_id' => $entry['id'] ?? null,
                        'message' => $e->getMessage(),
                    ]);
                }
            }
        }
    }

    public function fetchBusinesses(string $metaUserId, string $token): array
    {
        $response = Http::get($this->graphUrl("/{$metaUserId}/businesses"), [
            'access_token' => $token,
        ])->throw()->json();

        $businesses = [];

        foreach (($response['data'] ?? []) as $business) {
            if (! empty($business['id'])) {
                $businesses[(string) $business['id']] = (string) ($business['name'] ?? '');
            }
        }

        return $businesses;
    }

    private function permissionsFor(string $service): array
    {
        $basePermissions = ['email', 'public_profile'];

        return match ($service) {
            'instagram' => array_merge($basePermissions, [
                'pages_show_list',
                'pages_manage_metadata',
                'pages_read_engagement',
                'pages_manage_engagement',
                'instagram_basic',
                'instagram_manage_messages',
            ]),
            'facebook' => array_merge($basePermissions, [
                'pages_show_list',
                'pages_manage_metadata',
                'pages_read_engagement',
                'pages_messaging',
            ]),
            'product', 'fb_token' => array_merge($basePermissions, [
                'business_management',
                'pages_show_list',
                'pages_manage_metadata',
            ]),
            default => $basePermissions,
        };
    }

    private function graphUrl(string $path): string
    {
        return sprintf(
            'https://graph.facebook.com/%s%s',
            config('app.meta.graph_version'),
            $path
        );
    }

    private function buildConnectionMetadata(array $existing, array $profile, array $pages, array $tokenPayload): array
    {
        $existing['meta'] = [
            'connected_at' => now()->toIso8601String(),
            'graph_version' => config('app.meta.graph_version'),
            'user' => [
                'id' => (string) ($profile['id'] ?? ''),
                'name' => (string) ($profile['name'] ?? ''),
            ],
            'pages' => array_values(array_map(function (array $page) {
                return [
                    'id' => (string) ($page['id'] ?? ''),
                    'name' => (string) ($page['name'] ?? ''),
                    'instagram' => $page['instagram'] ?? null,
                ];
            }, $pages)),
            'token' => array_filter([
                'expires_in' => isset($tokenPayload['expires_in']) ? (int) $tokenPayload['expires_in'] : null,
                'token_type' => isset($tokenPayload['token_type']) ? (string) $tokenPayload['token_type'] : null,
            ], static fn ($value) => $value !== null && $value !== ''),
        ];

        return $existing;
    }

    private function applySelectedAssetData(Account $account, array $pages): void
    {
        $selectedPageId = (string) ($account->fb_phone_number_id ?? '');
        if ($selectedPageId === '' || ! isset($pages[$selectedPageId])) {
            return;
        }

        $selectedPage = $pages[$selectedPageId];
        $account->page_token = (string) ($selectedPage['token'] ?? $account->page_token);
        $account->fb_page_name = (string) ($selectedPage['name'] ?? $account->fb_page_name);

        if ($account->service === 'instagram' && ! empty($selectedPage['instagram'])) {
            $account->insta_user_name = (string) ($selectedPage['instagram']['username'] ?? $account->insta_user_name);
        }
    }

    private function synchronizeInstagramConnection(Account $account, array $pages, bool $save = false): void
    {
        if ($account->service !== 'instagram') {
            return;
        }

        $account->meta_provider = 'instagram';

        $selectedPageId = (string) ($account->meta_page_id ?: $account->fb_phone_number_id ?: '');
        $selectedPage = $selectedPageId !== '' ? ($pages[$selectedPageId] ?? null) : null;
        $linkedAccounts = $this->linkedInstagramAccountsForPage($selectedPage);
        $selectedInstagramId = (string) ($account->instagram_account_id ?: $account->fb_insta_app_id ?: '');

        if ($selectedPage) {
            $account->meta_page_id = $selectedPageId;
            $account->meta_page_name = (string) ($selectedPage['name'] ?? $account->meta_page_name ?? $account->fb_page_name);
            $account->meta_page_token = (string) ($selectedPage['token'] ?? $account->meta_page_token ?? $account->page_token);
            $account->fb_phone_number_id = $selectedPageId;
            $account->fb_page_name = $account->meta_page_name;
            $account->page_token = $account->meta_page_token;
        } else {
            $account->meta_page_id = $selectedPageId !== '' ? $selectedPageId : null;
            $account->meta_page_name = $account->meta_page_name ?: $account->fb_page_name;
            $account->meta_page_token = $account->meta_page_token ?: $account->page_token;
        }

        if ($linkedAccounts !== [] && ($selectedInstagramId === '' || ! collect($linkedAccounts)->contains('id', $selectedInstagramId))) {
            if (count($linkedAccounts) === 1) {
                $selectedInstagramId = (string) ($linkedAccounts[0]['id'] ?? '');
            }
        }

        $selectedInstagram = $selectedInstagramId !== ''
            ? collect($linkedAccounts)->firstWhere('id', $selectedInstagramId)
            : null;

        if ($selectedInstagram) {
            $this->applyInstagramAccountSelection($account, $selectedInstagram);
            $this->setInstagramConnectionState($account, 'connected');
        } else {
            $account->instagram_account_id = null;
            $account->instagram_username = null;
            $account->instagram_name = null;
            $account->fb_insta_app_id = null;
            $account->insta_user_name = null;

            if (empty($account->fb_token) && empty($account->fb_meta_data) && empty(Arr::get($account->connection_metadata, 'meta'))) {
                $this->setInstagramConnectionState($account, 'incomplete');
            } elseif ($selectedPageId === '') {
                $this->setInstagramConnectionState($account, 'needs_page');
            } else {
                $this->setInstagramConnectionState($account, 'needs_instagram');
            }
        }

        $this->storeInstagramMetaData($account, $pages);

        if ($save) {
            $account->save();
        }
    }

    private function linkedInstagramAccountsForPage(?array $page): array
    {
        if (! $page) {
            return [];
        }

        $linkedAccounts = [];

        if (! empty($page['instagram']) && is_array($page['instagram'])) {
            $linkedAccounts[] = array_filter([
                'id' => (string) ($page['instagram']['id'] ?? ''),
                'username' => (string) ($page['instagram']['username'] ?? ''),
                'name' => (string) ($page['instagram']['name'] ?? ''),
            ], static fn ($value) => $value !== null && $value !== '');
        }

        return array_values(array_filter($linkedAccounts, static function (array $account) {
            return ! empty($account['id']);
        }));
    }

    private function applyInstagramAccountSelection(Account $account, array $selectedInstagram): void
    {
        $account->instagram_account_id = (string) ($selectedInstagram['id'] ?? '');
        $account->instagram_username = (string) ($selectedInstagram['username'] ?? '');
        $account->instagram_name = (string) ($selectedInstagram['name'] ?? '');
        $account->fb_insta_app_id = $account->instagram_account_id;
        $account->insta_user_name = $account->instagram_username;
    }

    private function storeInstagramMetaData(Account $account, array $pages): void
    {
        if ($account->service !== 'instagram') {
            return;
        }

        $selectedInstagramAccount = $account->instagram_account_id
            ? array_filter([
                'id' => (string) $account->instagram_account_id,
                'username' => (string) ($account->instagram_username ?? ''),
                'name' => (string) ($account->instagram_name ?? ''),
            ], static fn ($value) => $value !== null && $value !== '')
            : null;

        $account->instagram_meta_data = [
            'pages' => array_values(array_map(function (array $page) {
                return [
                    'id' => (string) ($page['id'] ?? ''),
                    'name' => (string) ($page['name'] ?? ''),
                    'linked_instagram_accounts' => $this->linkedInstagramAccountsForPage($page),
                ];
            }, $pages)),
            'selected_page' => $account->meta_page_id ? [
                'id' => (string) $account->meta_page_id,
                'name' => (string) ($account->meta_page_name ?? ''),
            ] : null,
            'selected_instagram_account' => $selectedInstagramAccount,
        ];
    }

    private function setInstagramConnectionState(Account $account, string $status): void
    {
        $account->connection_status = $status;
        $account->setup_state = $status === 'connected' ? 'complete' : 'incomplete';
        $account->connection_error = match ($status) {
            'needs_instagram' => 'No Instagram Business account linked to this Facebook Page',
            'error' => $account->connection_error ?: 'Instagram connection is incomplete.',
            default => null,
        };
        $account->status = $status === 'connected' ? 'Active' : 'Draft';
    }

    public function syncInstagramMessages(Account $account, bool $force = false): void
    {
        if ($account->service !== 'instagram') {
            return;
        }

        $this->syncHistoricalChatsIfNeeded($account, $force);
    }

    public function syncInstagramConversationMessages(Account $account, Contact $contact, int $messageLimit = 50): void
    {
        if ($account->service !== 'instagram') {
            return;
        }

        $account->refresh();

        if (
            $account->status !== 'Active'
            || (string) ($account->connection_status ?? '') !== 'connected'
            || empty($account->instagram_account_id)
        ) {
            throw new RuntimeException('Instagram account is not fully connected.');
        }

        $recipientId = (string) ($contact->instagram_username ?? '');
        if ($recipientId === '') {
            throw new RuntimeException('Instagram contact is missing the Instagram account identifier.');
        }

        $pageId = (string) ($account->meta_page_id ?: $account->fb_phone_number_id ?: '');
        $pageToken = (string) ($account->meta_page_token ?: $account->page_token ?: '');

        if ($pageId === '') {
            throw new RuntimeException('Instagram connection is missing the selected Facebook Page.');
        }

        if ($pageToken === '') {
            $pageToken = (string) ((new WhatsAppUsers())->getFbPageAccessToken($account) ?: '');
        }

        if ($pageToken === '') {
            throw new RuntimeException('Instagram connection is missing the page access token.');
        }

        $conversationPayload = Http::timeout(20)
            ->retry(2, 250)
            ->get($this->graphUrl("/{$pageId}/conversations"), [
                'platform' => 'instagram',
                'user_id' => $recipientId,
                'fields' => 'id,updated_time,message_count,unread_count,participants{id,name,email}',
                'limit' => 1,
                'access_token' => $pageToken,
            ])
            ->throw()
            ->json();

        foreach ((array) ($conversationPayload['data'] ?? []) as $conversation) {
            $conversationId = (string) ($conversation['id'] ?? '');
            if ($conversationId === '') {
                continue;
            }

            $participants = [];
            foreach ((array) data_get($conversation, 'participants.data', []) as $participant) {
                $participantId = (string) ($participant['id'] ?? '');
                if ($participantId === '') {
                    continue;
                }

                $participants[$participantId] = (string) ($participant['name'] ?? '');
            }

            $messagesPayload = Http::timeout(20)
                ->retry(2, 250)
                ->get($this->graphUrl("/{$conversationId}/messages"), [
                    'fields' => 'id,message,created_time,from,to,attachments',
                    'limit' => $messageLimit,
                    'access_token' => $pageToken,
                ])
                ->throw()
                ->json();

            $messages = collect((array) ($messagesPayload['data'] ?? []))
                ->sortBy(fn (array $message) => (string) ($message['created_time'] ?? ''))
                ->values();

            foreach ($messages as $message) {
                $this->ingestHistoricalSocialMessage($account, $participants, (array) $message);
            }
        }

        $account->sync_last_at = now();
        $account->save();
    }

    public function syncHistoricalChatsIfNeeded(Account $account, bool $force = false): void
    {
        if (! in_array($account->service, ['facebook', 'instagram'], true)) {
            return;
        }

        $account->refresh();

        if ($account->status !== 'Active') {
            return;
        }

        if ($account->service === 'instagram') {
            $instagramAccountId = (string) ($account->instagram_account_id ?? '');
            if ($instagramAccountId === '' || (string) ($account->connection_status ?? '') !== 'connected') {
                return;
            }
        } elseif (empty($account->fb_phone_number_id)) {
            return;
        }

        if (! $force && $account->sync_last_at) {
            return;
        }

        try {
            $this->syncSocialAccountConversations($account, 25, 75);
            $account->sync_last_at = now();
            $account->save();
        } catch (\Throwable $e) {
            Log::warning('Historical social chat sync failed after connection.', [
                'account_id' => $account->id,
                'service' => $account->service,
                'message' => $e->getMessage(),
            ]);
        }
    }

    private function syncSocialAccountConversations(Account $account, int $conversationLimit = 25, int $messageLimit = 75): void
    {
        $service = (string) $account->service;
        $pageId = (string) (
            $service === 'instagram'
                ? ($account->meta_page_id ?: $account->fb_phone_number_id ?: '')
                : ($account->fb_phone_number_id ?: '')
        );
        $pageToken = (string) ($account->meta_page_token ?: $account->page_token ?: '');

        if ($pageId === '') {
            return;
        }

        if ($pageToken === '') {
            $pageToken = (string) ((new WhatsAppUsers())->getFbPageAccessToken($account) ?: '');
        }

        if ($pageToken === '') {
            throw new RuntimeException('Missing Meta page token.');
        }

        $query = [
            'fields' => 'id,updated_time,message_count,unread_count,participants{id,name,email}',
            'limit' => $conversationLimit,
        ];

        if ($service === 'facebook') {
            $query['platform'] = 'messenger';
        } elseif ($service === 'instagram') {
            $query['platform'] = 'instagram';
        }

        $conversationPayload = Http::timeout(20)
            ->retry(2, 250)
            ->get($this->graphUrl("/{$pageId}/conversations"), array_merge($query, [
                'access_token' => $pageToken,
            ]))
            ->throw()
            ->json();

        foreach ((array) ($conversationPayload['data'] ?? []) as $conversation) {
            $conversationId = (string) ($conversation['id'] ?? '');
            if ($conversationId === '') {
                continue;
            }

            $participants = [];
            foreach ((array) data_get($conversation, 'participants.data', []) as $participant) {
                $participantId = (string) ($participant['id'] ?? '');
                if ($participantId === '') {
                    continue;
                }

                $participants[$participantId] = (string) ($participant['name'] ?? '');
            }

            $messagesPayload = Http::timeout(20)
                ->retry(2, 250)
                ->get($this->graphUrl("/{$conversationId}/messages"), [
                    'fields' => 'id,message,created_time,from,to,attachments',
                    'limit' => $messageLimit,
                    'access_token' => $pageToken,
                ])
                ->throw()
                ->json();

            $messages = collect((array) ($messagesPayload['data'] ?? []))
                ->sortBy(fn (array $message) => (string) ($message['created_time'] ?? ''))
                ->values();

            foreach ($messages as $message) {
                $this->ingestHistoricalSocialMessage($account, $participants, (array) $message);
            }
        }
    }

    private function ingestHistoricalSocialMessage(Account $account, array $participants, array $message): void
    {
        $service = (string) $account->service;
        $assetId = (string) (
            $service === 'instagram'
                ? ($account->instagram_account_id ?: $account->meta_page_id ?: $account->fb_phone_number_id ?: '')
                : ($account->fb_phone_number_id ?: '')
        );
        $messageId = (string) ($message['id'] ?? '');
        $fromId = (string) data_get($message, 'from.id', '');
        $fromName = (string) data_get($message, 'from.name', '');

        if ($assetId === '' || $messageId === '' || $fromId === '') {
            return;
        }

        $isOutgoing = $fromId === $assetId || $fromId === (string) ($account->meta_page_id ?: '');
        $counterpartyId = $isOutgoing
            ? $this->extractHistoricalCounterpartyId($message, $assetId, $participants)
            : $fromId;

        if ($counterpartyId === '') {
            return;
        }

        $counterpartyName = $participants[$counterpartyId] ?? ($isOutgoing ? '' : $fromName);

        $payload = [
            'account' => $account->id,
            'service' => $service,
            'type' => $isOutgoing ? 'outgoing' : 'incoming',
            'status' => $isOutgoing ? 'Sent' : 'Received',
            'messageId' => $messageId,
            'sender' => $isOutgoing ? $assetId : $counterpartyId,
            'recipient' => $isOutgoing ? $counterpartyId : $assetId,
            'message' => (string) ($message['message'] ?? ''),
            'occurred_at' => (string) ($message['created_time'] ?? ''),
            'is_read' => $isOutgoing ? false : true,
        ];

        $attachment = collect((array) data_get($message, 'attachments.data', []))->first();
        if (is_array($attachment)) {
            $payload['attachment_type'] = (string) ($attachment['type'] ?? '');
            $payload['attachment'] = (string) data_get(
                $attachment,
                'image_data.url',
                data_get($attachment, 'video_data.url', data_get($attachment, 'file_url', data_get($attachment, 'payload.url', '')))
            );
        }

        $previousIsSent = $_REQUEST['is_sent'] ?? null;
        $previousFirstName = $_POST['first_name'] ?? null;
        $previousLastName = $_POST['last_name'] ?? null;

        $_REQUEST['is_sent'] = $isOutgoing ? 'sent' : 'received';
        $_POST['first_name'] = $counterpartyName;
        $_POST['last_name'] = '';

        try {
            app(MsgController::class)->fbInstaMsgHandler(new Request($payload));
        } finally {
            if ($previousIsSent === null) {
                unset($_REQUEST['is_sent']);
            } else {
                $_REQUEST['is_sent'] = $previousIsSent;
            }

            if ($previousFirstName === null) {
                unset($_POST['first_name']);
            } else {
                $_POST['first_name'] = $previousFirstName;
            }

            if ($previousLastName === null) {
                unset($_POST['last_name']);
            } else {
                $_POST['last_name'] = $previousLastName;
            }
        }
    }

    private function extractHistoricalCounterpartyId(array $message, string $assetId, array $participants): string
    {
        foreach ((array) data_get($message, 'to.data', []) as $recipient) {
            $recipientId = (string) ($recipient['id'] ?? '');
            if ($recipientId !== '' && $recipientId !== $assetId) {
                return $recipientId;
            }
        }

        foreach (array_keys($participants) as $participantId) {
            if ((string) $participantId !== $assetId) {
                return (string) $participantId;
            }
        }

        return '';
    }

    private function extractPagesFromAccount(Account $account): array
    {
        if (empty($account->fb_meta_data)) {
            return [];
        }

        $decoded = base64_decode((string) $account->fb_meta_data, true);
        if ($decoded === false) {
            return [];
        }

        $pages = @unserialize($decoded, ['allowed_classes' => false]);
        if (! is_array($pages)) {
            return [];
        }

        $normalized = [];
        foreach ($pages as $pageId => $page) {
            if (! is_array($page)) {
                continue;
            }

            $id = (string) ($page['id'] ?? $pageId);
            if ($id === '') {
                continue;
            }

            $normalized[$id] = array_filter([
                'id' => $id,
                'name' => (string) ($page['name'] ?? ''),
                'token' => (string) ($page['token'] ?? ''),
                'instagram' => ! empty($page['instagram']) && is_array($page['instagram'])
                    ? $page['instagram']
                    : null,
            ], static fn ($value) => $value !== null && $value !== '');
        }

        return $normalized;
    }

    private function facebookConnectionStatus(Account $account, array $pages, ?string $selectedPageName): string
    {
        $hasToken = ! empty($account->fb_token);
        $hasMeta = ! empty($account->fb_meta_data) || ! empty(Arr::get($account->connection_metadata, 'meta'));
        $selectedPageId = (string) ($account->fb_phone_number_id ?? '');

        if (! $hasToken && ! $hasMeta) {
            return 'not_connected';
        }

        if ($hasToken && $hasMeta) {
            if ($selectedPageId === '' && empty($selectedPageName)) {
                return 'oauth_connected_pending_page';
            }

            if ($selectedPageId !== '' && ! empty($selectedPageName)) {
                return empty($pages) || isset($pages[$selectedPageId])
                    ? 'connected'
                    : 'connection_error';
            }
        }

        return 'connection_error';
    }

    private function facebookConnectionStatusLabel(string $status): string
    {
        return match ($status) {
            'connected' => 'Connected',
            'oauth_connected_pending_page' => 'Needs setup',
            'connection_error' => 'Not connected',
            default => 'Not connected',
        };
    }

    private function instagramConnectionStatus(Account $account, array $linkedInstagramAccounts): string
    {
        if (! empty($account->connection_status) && in_array($account->connection_status, ['connected', 'needs_page', 'needs_instagram', 'incomplete', 'error'], true)) {
            return (string) $account->connection_status;
        }

        if (empty($account->fb_token) && empty($account->fb_meta_data) && empty(Arr::get($account->connection_metadata, 'meta'))) {
            return 'incomplete';
        }

        if (empty($account->meta_page_id) && empty($account->fb_phone_number_id)) {
            return 'needs_page';
        }

        if (! empty($account->instagram_account_id) && ! empty($account->instagram_username)) {
            return 'connected';
        }

        return $linkedInstagramAccounts === [] ? 'needs_instagram' : 'needs_instagram';
    }

    private function instagramConnectionStatusLabel(string $status): string
    {
        return match ($status) {
            'connected' => 'Connected',
            'needs_page', 'needs_instagram' => 'Needs setup',
            'error' => 'Not connected',
            default => 'Not connected',
        };
    }

    private function instagramConnectionMessage(string $status, array $linkedInstagramAccounts = []): string
    {
        return match ($status) {
            'needs_page' => 'Select a Facebook Page to continue',
            'needs_instagram' => $linkedInstagramAccounts === []
                ? 'No Instagram Business account linked to this Facebook Page'
                : 'Choose the linked Instagram account for this Facebook Page',
            'connected' => 'Ready to manage Instagram DMs',
            'error' => 'Connect Instagram again',
            default => 'Connect Meta account',
        };
    }

    private function webhookVerificationValues(Request $request, bool $allowLegacyKeys): array
    {
        $rawQuery = $this->rawQueryParameters($request);

        // Meta documents dotted keys, but PHP normalizes them to underscores
        // when populating $_GET, so inspect the raw query string first.
        $mode = $rawQuery['hub.mode'] ?? null;
        $token = $rawQuery['hub.verify_token'] ?? null;
        $challenge = $rawQuery['hub.challenge'] ?? null;

        $mode = $mode ?? $request->query('hub.mode') ?? $request->query('hub_mode');
        $token = $token ?? $request->query('hub.verify_token') ?? $request->query('hub_verify_token');
        $challenge = $challenge ?? $request->query('hub.challenge') ?? $request->query('hub_challenge');

        if ($allowLegacyKeys) {
            $mode = $mode ?? $request->query('hub_mode');
            $token = $token ?? $request->query('hub_verify_token');
            $challenge = $challenge ?? $request->query('hub_challenge');
        }

        return [$mode, $token, $challenge];
    }

    private function rawQueryParameters(Request $request): array
    {
        $queryString = (string) $request->server('QUERY_STRING', '');
        if ($queryString === '') {
            return [];
        }

        $parameters = [];
        foreach (explode('&', $queryString) as $pair) {
            if ($pair === '') {
                continue;
            }

            [$key, $value] = array_pad(explode('=', $pair, 2), 2, '');
            $parameters[urldecode($key)] = urldecode($value);
        }

        return $parameters;
    }

    private function summarizeWebhookPayload(array $payload): array
    {
        $summary = [];

        foreach (($payload['entry'] ?? []) as $entry) {
            foreach (($entry['changes'] ?? []) as $change) {
                $summary[] = array_filter([
                    'field' => $change['field'] ?? null,
                    'has_value' => array_key_exists('value', $change),
                ]);
            }

            if (! empty($entry['messaging'])) {
                $summary[] = ['field' => 'messaging', 'count' => count($entry['messaging'])];
            }
        }

        return $summary;
    }

    private function subscribeSelectedFacebookPage(Account $account): void
    {
        if (! in_array($account->service, ['facebook', 'instagram'], true) || empty($account->fb_phone_number_id)) {
            return;
        }

        try {
            (new WhatsAppUsers())->subscripe($account);
        } catch (\Throwable $e) {
            Log::warning('Facebook page webhook subscription failed.', [
                'account_id' => $account->id,
                'page_id' => $account->fb_phone_number_id,
                'message' => $e->getMessage(),
            ]);
        }
    }

    private function handleMetaMessagingEvent(string $object, array $entry, array $event): void
    {
        $account = $this->resolveMetaAccountForMessagingEvent($object, $entry, $event);

        if (! $account) {
            Log::info('Meta messaging event did not match any local account.', [
                'object' => $object !== '' ? $object : null,
                'entry_id' => $entry['id'] ?? null,
                'sender_id' => Arr::get($event, 'sender.id'),
                'recipient_id' => Arr::get($event, 'recipient.id'),
            ]);
            return;
        }

        if (! empty($event['message'])) {
            $this->storeMetaMessageEvent($account, $event);

            return;
        }

        if (! empty($event['delivery']['mids']) && is_array($event['delivery']['mids'])) {
            Msg::whereIn('service_id', $event['delivery']['mids'])
                ->update(['is_delivered' => true]);

            return;
        }

        if (! empty($event['read']['watermark'])) {
            $this->markMetaMessagesRead($account, $event);
            return;
        }

        Log::info('Ignoring unsupported Meta messaging event payload.', [
            'account_id' => $account->id,
            'service' => $account->service,
            'object' => $object !== '' ? $object : null,
            'event_keys' => array_keys($event),
        ]);
    }

    private function resolveMetaAccountForMessagingEvent(string $object, array $entry, array $event): ?Account
    {
        $candidateIds = array_filter([
            (string) Arr::get($entry, 'id', ''),
            (string) Arr::get($event, 'sender.id', ''),
            (string) Arr::get($event, 'recipient.id', ''),
        ]);

        if ($candidateIds === []) {
            return null;
        }

        if ($object === 'instagram') {
            return Account::query()
                ->where('service', 'instagram')
                ->where(function ($query) use ($candidateIds) {
                    $query->whereIn('instagram_account_id', $candidateIds)
                        ->orWhereIn('meta_page_id', $candidateIds);
                })
                ->orderByDesc('id')
                ->first();
        }

        return Account::query()
            ->where('service', 'facebook')
            ->whereIn('fb_phone_number_id', $candidateIds)
            ->orderByDesc('id')
            ->first();
    }

    private function storeMetaMessageEvent(Account $account, array $event): void
    {
        $service = $account->service === 'instagram' ? 'instagram' : 'facebook';
        $assetId = $service === 'instagram'
            ? (string) ($account->instagram_account_id ?: $account->meta_page_id ?: $account->fb_phone_number_id)
            : (string) $account->fb_phone_number_id;
        $senderId = (string) Arr::get($event, 'sender.id', '');
        $recipientId = (string) Arr::get($event, 'recipient.id', '');
        $isEcho = (bool) Arr::get($event, 'message.is_echo', false);
        $messageId = (string) Arr::get($event, 'message.mid', '');

        if ($assetId === '' || $messageId === '') {
            Log::warning('Skipping Meta message event because the asset context is incomplete.', [
                'account_id' => $account->id,
                'service' => $service,
                'asset_id' => $assetId !== '' ? $assetId : null,
                'message_id' => $messageId !== '' ? $messageId : null,
            ]);
            return;
        }

        $type = ($isEcho || $senderId === $assetId) ? 'outgoing' : 'incoming';
        $normalized = [
            'account' => $account->id,
            'service' => $service,
            'type' => $type,
            'status' => $type === 'incoming' ? 'Received' : 'Sent',
            'messageId' => $messageId,
            'sender' => $senderId,
            'recipient' => $recipientId,
            'message' => (string) Arr::get($event, 'message.text', ''),
            'occurred_at' => $this->normalizeOccurredAt(Arr::get($event, 'timestamp')),
        ];

        $attachment = Arr::first((array) Arr::get($event, 'message.attachments', []));
        if (is_array($attachment)) {
            $normalized['attachment_type'] = (string) ($attachment['type'] ?? '');
            $normalized['attachment'] = (string) Arr::get($attachment, 'payload.url', '');
        }

        app(MsgController::class)->fbInstaMsgHandler(new Request($normalized));
    }

    private function normalizeOccurredAt(mixed $value): ?string
    {
        if (is_numeric($value)) {
            return \Illuminate\Support\Carbon::createFromTimestampMs((int) $value)->toIso8601String();
        }

        return is_string($value) && $value !== '' ? $value : null;
    }

    private function markMetaMessagesRead(Account $account, array $event): void
    {
        $service = $account->service === 'instagram' ? 'instagram' : 'facebook';
        $contactServiceId = (string) Arr::get($event, 'sender.id', '');
        $watermark = $this->normalizeOccurredAt(Arr::get($event, 'read.watermark'));

        if ($contactServiceId === '' || ! $watermark) {
            return;
        }

        $contactField = $service === 'instagram' ? 'instagram_username' : 'facebook_username';

        $contact = Contact::query()
            ->where($contactField, $contactServiceId)
            ->where('creater_id', $account->user_id)
            ->first();

        if (! $contact) {
            return;
        }

        Msg::query()
            ->where('service', $service)
            ->where('account_id', $account->id)
            ->where('msg_mode', 'outgoing')
            ->where('msgable_id', $contact->id)
            ->where('msgable_type', Contact::class)
            ->where(function ($query) use ($watermark) {
                $query->where('sent_at', '<=', $watermark)
                    ->orWhere(function ($fallbackQuery) use ($watermark) {
                        $fallbackQuery->whereNull('sent_at')
                            ->where('created_at', '<=', $watermark);
                    });
            })
            ->update([
                'is_delivered' => true,
                'is_read' => true,
            ]);
    }
}
