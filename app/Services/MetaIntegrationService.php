<?php

namespace App\Services;

use App\Http\Controllers\MsgController;
use App\Jobs\InitialInstagramHistorySyncJob;
use App\Models\Account;
use App\Models\ChatListContact;
use App\Models\Contact;
use App\Models\FaceBookAppToken;
use App\Models\Msg;
use App\Models\Setting;
use App\Models\WhatsAppUsers;
use Illuminate\Support\Arr;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use RuntimeException;

class MetaIntegrationService
{
    private function hasInstagramUserIdColumn(): bool
    {
        return Schema::hasColumn('contacts', 'instagram_user_id');
    }

    private function hasInstagramConversationIdColumn(): bool
    {
        return Schema::hasColumn('chat_list_contacts', 'instagram_conversation_id');
    }

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

    public function isInstagramLoginConfigured(): bool
    {
        return (bool) (
            config('app.meta.instagram.app_id')
            && config('app.meta.instagram.app_secret')
            && config('app.meta.instagram.redirect_uri')
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

    public function instagramLoginAuthorizationUrl(string $state): string
    {
        $query = http_build_query(array_filter([
            'client_id' => config('app.meta.instagram.app_id'),
            'redirect_uri' => config('app.meta.instagram.redirect_uri'),
            'response_type' => 'code',
            'scope' => implode(',', $this->instagramLoginPermissions()),
            'state' => $state,
            'enable_fb_login' => '0',
            'force_reauth' => 'true',
        ]));

        return sprintf('https://www.instagram.com/oauth/authorize?%s', $query);
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

    public function exchangeInstagramLoginCodeForAccessToken(string $code): array
    {
        $response = Http::asForm()
            ->post('https://api.instagram.com/oauth/access_token', [
                'client_id' => config('app.meta.instagram.app_id'),
                'client_secret' => config('app.meta.instagram.app_secret'),
                'grant_type' => 'authorization_code',
                'redirect_uri' => config('app.meta.instagram.redirect_uri'),
                'code' => $code,
            ])
            ->throw()
            ->json();

        $payload = $this->normalizeInstagramLoginTokenPayload($response);
        if (! isset($payload['access_token'])) {
            throw new RuntimeException('Instagram Login did not return an access token.');
        }

        return $payload;
    }

    public function exchangeInstagramLoginLongLivedToken(string $token): ?array
    {
        $response = Http::get($this->instagramGraphUrl('/access_token'), [
            'grant_type' => 'ig_exchange_token',
            'client_secret' => config('app.meta.instagram.app_secret'),
            'access_token' => $token,
        ]);

        if (! $response->successful()) {
            Log::warning('Instagram Login long-lived token exchange failed.', [
                'status' => $response->status(),
            ]);

            return null;
        }

        $payload = $response->json();

        return is_array($payload) && isset($payload['access_token'])
            ? $payload
            : null;
    }

    public function refreshInstagramLoginLongLivedToken(string $token): ?array
    {
        $response = Http::get($this->instagramGraphUrl('/refresh_access_token'), [
            'grant_type' => 'ig_refresh_token',
            'access_token' => $token,
        ]);

        if (! $response->successful()) {
            Log::warning('Instagram Login token refresh failed.', [
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

    public function fetchInstagramLoginProfile(string $token): array
    {
        $response = Http::get($this->instagramGraphUrl('/me'), [
            'fields' => 'id,user_id,username,name,account_type,profile_picture_url',
            'access_token' => $token,
        ])->throw()->json();

        $payload = $this->normalizeInstagramLoginProfilePayload($response);
        if (! isset($payload['user_id']) || ! isset($payload['username'])) {
            throw new RuntimeException('Instagram Login profile response is invalid.');
        }

        return $payload;
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
        if ($service === 'instagram') {
            throw new RuntimeException('Legacy Instagram Page-linked connections are no longer supported.');
        }

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

        $this->applySelectedAssetData($account, $pages);
        $account->save();
        $this->syncHistoricalChatsIfNeeded($account);

        return $account;
    }

    public function persistInstagramLoginConnection(
        int $userId,
        array $profile,
        string $accessToken,
        array $tokenPayload = [],
        ?Account $existingAccount = null
    ): Account {
        $account = $existingAccount ?: new Account();
        $account->user_id = $userId;
        $account->service = 'instagram';
        $account->service_engine = 'facebook';
        $account->company_name = $account->company_name ?: (string) ($profile['name'] ?? $profile['username'] ?? 'Instagram');
        $account->meta_provider = 'instagram';
        $account->connection_model = 'instagram_login';
        $account->requires_reconnect = false;
        $account->instagram_app_scoped_user_id = (string) ($profile['id'] ?? '');
        $account->instagram_account_id = (string) ($profile['user_id'] ?? '');
        $account->instagram_username = (string) ($profile['username'] ?? '');
        $account->instagram_name = (string) ($profile['name'] ?? $profile['username'] ?? '');
        $account->instagram_user_access_token_encrypted = $accessToken;
        $account->instagram_token_expires_at = $this->resolveInstagramTokenExpiry($tokenPayload);
        $account->instagram_token_last_refreshed_at = now();
        $account->instagram_refresh_metadata = array_filter([
            'token_type' => (string) ($tokenPayload['token_type'] ?? ''),
            'expires_in' => isset($tokenPayload['expires_in']) ? (int) $tokenPayload['expires_in'] : null,
            'granted_permissions' => Arr::wrap($tokenPayload['permissions'] ?? []),
            'refreshed_at' => now()->toIso8601String(),
        ], static fn ($value) => $value !== null && $value !== '' && $value !== []);
        $account->instagram_meta_data = [
            'profile' => $profile,
            'token' => array_filter([
                'token_type' => (string) ($tokenPayload['token_type'] ?? ''),
                'expires_in' => isset($tokenPayload['expires_in']) ? (int) $tokenPayload['expires_in'] : null,
                'permissions' => Arr::wrap($tokenPayload['permissions'] ?? []),
            ], static fn ($value) => $value !== null && $value !== '' && $value !== []),
            'connection_model' => 'instagram_login',
        ];
        $account->connection_metadata = $this->buildInstagramLoginConnectionMetadata(
            is_array($account->connection_metadata) ? $account->connection_metadata : [],
            $profile,
            $tokenPayload
        );
        $account->meta_page_id = null;
        $account->meta_page_name = null;
        $account->meta_page_token = null;
        $account->fb_phone_number_id = null;
        $account->fb_page_name = null;
        $account->page_token = null;
        $account->fb_token = null;
        $account->fb_meta_data = null;
        $account->fb_insta_app_id = (string) ($profile['user_id'] ?? '');
        $account->insta_user_name = (string) ($profile['username'] ?? '');
        $account->connection_error = null;
        $account->connection_status = 'connected';
        $account->setup_state = 'complete';
        $account->status = 'Active';
        $account->sync_last_at = null;
        $account->instagram_initial_sync_started_at = null;
        $account->instagram_initial_sync_completed_at = null;
        $account->instagram_initial_sync_error = null;
        $account->save();

        $this->subscribeInstagramLoginWebhook($account);

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
            'requires_reconnect' => (bool) ($account->requires_reconnect ?? false),
            'connection_error' => (string) ($account->connection_error ?? ''),
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
        return $this->buildInstagramLoginSetupPayload($account);
    }

    public function getInstagramConnectionStatus(Account $account): array
    {
        return $this->buildInstagramSetupPayload($account, true);
    }

    public function availablePagesForAccount(Account $account, bool $refreshPagesIfMissing = false): array
    {
        if ($account->service === 'instagram') {
            return [];
        }

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
        $this->applySelectedAssetData($account, $pages);
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

    private function instagramLoginPermissions(): array
    {
        return [
            'instagram_business_basic',
            'instagram_business_manage_messages',
        ];
    }

    private function graphUrl(string $path): string
    {
        return sprintf(
            'https://graph.facebook.com/%s%s',
            config('app.meta.graph_version'),
            $path
        );
    }

    private function instagramGraphUrl(string $path): string
    {
        return sprintf(
            'https://graph.instagram.com/%s%s',
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

    private function buildInstagramLoginConnectionMetadata(array $existing, array $profile, array $tokenPayload): array
    {
        $existing['instagram_login'] = [
            'connected_at' => now()->toIso8601String(),
            'graph_version' => config('app.meta.graph_version'),
            'account' => [
                'app_scoped_user_id' => (string) ($profile['id'] ?? ''),
                'instagram_account_id' => (string) ($profile['user_id'] ?? ''),
                'username' => (string) ($profile['username'] ?? ''),
                'name' => (string) ($profile['name'] ?? ''),
                'account_type' => (string) ($profile['account_type'] ?? ''),
                'profile_picture_url' => (string) ($profile['profile_picture_url'] ?? ''),
            ],
            'token' => array_filter([
                'expires_in' => isset($tokenPayload['expires_in']) ? (int) $tokenPayload['expires_in'] : null,
                'token_type' => isset($tokenPayload['token_type']) ? (string) $tokenPayload['token_type'] : null,
                'permissions' => Arr::wrap($tokenPayload['permissions'] ?? []),
            ], static fn ($value) => $value !== null && $value !== '' && $value !== []),
        ];

        return $existing;
    }

    private function normalizeInstagramLoginTokenPayload(array $payload): array
    {
        if (isset($payload['data'][0]) && is_array($payload['data'][0])) {
            return $payload['data'][0];
        }

        return $payload;
    }

    private function normalizeInstagramLoginProfilePayload(array $payload): array
    {
        if (isset($payload['data'][0]) && is_array($payload['data'][0])) {
            return $payload['data'][0];
        }

        return $payload;
    }

    private function resolveInstagramTokenExpiry(array $tokenPayload): ?Carbon
    {
        $expiresIn = (int) ($tokenPayload['expires_in'] ?? 0);
        if ($expiresIn <= 0) {
            return null;
        }

        return now()->addSeconds($expiresIn);
    }

    private function isInstagramLoginConnection(Account $account): bool
    {
        if ($account->service !== 'instagram') {
            return false;
        }

        if ((string) ($account->connection_model ?? '') === 'instagram_login') {
            return true;
        }

        if (! empty(Arr::get($account->connection_metadata, 'instagram_login.account.instagram_account_id'))
            || ! empty(Arr::get($account->connection_metadata, 'instagram_login.account.app_scoped_user_id'))
            || ! empty($account->instagram_user_access_token_encrypted)
        ) {
            return true;
        }

        return false;
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
    }

    private function buildInstagramLoginSetupPayload(Account $account): array
    {
        $this->hydrateInstagramLoginIdentity($account, true);

        $status = $this->instagramLoginConnectionStatus($account);
        $accountName = (string) (
            $account->instagram_name
            ?: $account->instagram_username
            ?: $account->company_name
            ?: ''
        );

        return [
            'service' => 'instagram',
            'provider' => 'instagram',
            'account_id' => $account->id,
            'account_name' => $accountName,
            'connection_model' => 'instagram_login',
            'oauth_connected' => ! empty($account->instagram_user_access_token_encrypted),
            'page_selected' => false,
            'selected_page' => null,
            'available_pages' => [],
            'instagram_selected' => ! empty($account->instagram_account_id),
            'selected_instagram_account' => ! empty($account->instagram_account_id)
                ? [
                    'id' => (string) $account->instagram_account_id,
                    'username' => (string) ($account->instagram_username ?? ''),
                    'name' => (string) ($account->instagram_name ?? ''),
                ]
                : null,
            'setup_complete' => $status === 'connected',
            'requires_reconnect' => (bool) ($account->requires_reconnect ?? false),
            'status' => $status,
            'status_label' => $this->instagramLoginConnectionStatusLabel($status),
            'message' => $this->instagramLoginConnectionMessage($account, $status),
        ];
    }

    private function instagramLoginConnectionStatus(Account $account): string
    {
        if ((string) ($account->requires_reconnect ?? false) === '1' || $account->requires_reconnect) {
            return 'error';
        }

        if (empty($account->instagram_user_access_token_encrypted)) {
            return 'incomplete';
        }

        if ((string) ($account->connection_status ?? '') === 'connected' && ! empty($account->instagram_account_id)) {
            return 'connected';
        }

        if (! empty($account->instagram_user_access_token_encrypted) && empty($account->instagram_account_id)) {
            return 'incomplete';
        }

        if (! empty($account->instagram_account_id)) {
            return 'connected';
        }

        return 'incomplete';
    }

    private function instagramLoginConnectionStatusLabel(string $status): string
    {
        return match ($status) {
            'connected' => 'Connected',
            'error' => 'Reconnect required',
            default => 'Needs setup',
        };
    }

    private function instagramLoginConnectionMessage(Account $account, string $status): string
    {
        if ((bool) ($account->requires_reconnect ?? false)) {
            return $account->connection_error ?: 'Reconnect Instagram to continue.';
        }

        return match ($status) {
            'connected' => 'Instagram connected',
            'error' => $account->connection_error ?: 'Reconnect Instagram to continue.',
            default => 'Complete Instagram Login authorization.',
        };
    }

    public function syncInstagramMessages(Account $account, bool $force = false): void
    {
        if ($account->service !== 'instagram') {
            return;
        }

        $this->hydrateInstagramLoginIdentity($account, true);
        $this->syncInstagramLoginConversations($account, 25, 75, $force);
    }

    public function dispatchInitialInstagramHistorySync(Account $account, bool $force = false): bool
    {
        $account->refresh();

        if (
            $account->service !== 'instagram'
            || $account->status !== 'Active'
            || (string) ($account->connection_status ?? '') !== 'connected'
            || empty($account->instagram_account_id)
            || empty($account->instagram_user_access_token_encrypted)
        ) {
            return false;
        }

        if (! $force) {
            if ($account->instagram_initial_sync_completed_at) {
                return false;
            }

            if ($account->instagram_initial_sync_started_at && empty($account->instagram_initial_sync_error)) {
                return false;
            }
        }

        $account->instagram_initial_sync_started_at = now();
        $account->instagram_initial_sync_error = null;
        $account->save();

        InitialInstagramHistorySyncJob::dispatch($account->id);

        return true;
    }

    public function startInitialInstagramHistorySyncSafely(Account $account, bool $force = false): void
    {
        try {
            $dispatched = $this->dispatchInitialInstagramHistorySync($account, $force);

            if ($dispatched) {
                Log::info('Initial Instagram history sync dispatched.', [
                    'account_id' => $account->id,
                    'force' => $force,
                    'queue_connection' => (string) config('queue.default'),
                ]);
            }
        } catch (\Throwable $e) {
            Log::warning('Initial Instagram history sync could not be started.', [
                'account_id' => $account->id,
                'force' => $force,
                'queue_connection' => (string) config('queue.default'),
                'message' => $e->getMessage(),
            ]);
        }
    }

    public function runInitialInstagramHistorySync(Account $account): void
    {
        $account->refresh();
        $this->hydrateInstagramLoginIdentity($account, true);

        if (
            $account->service !== 'instagram'
            || $account->status !== 'Active'
            || (string) ($account->connection_status ?? '') !== 'connected'
            || empty($account->instagram_account_id)
            || empty($account->instagram_user_access_token_encrypted)
        ) {
            return;
        }

        $account->instagram_initial_sync_started_at = $account->instagram_initial_sync_started_at ?: now();
        $account->instagram_initial_sync_error = null;
        $account->save();

        try {
            $token = $this->resolveInstagramUserAccessToken($account, false);
            if ($token === '') {
                throw new RuntimeException('Instagram Login connection is missing the Instagram User access token.');
            }

            $nextUrl = $this->instagramGraphUrl('/' . $account->instagram_account_id . '/conversations');
            $query = [
                'platform' => 'instagram',
                'access_token' => $token,
            ];

            while ($nextUrl !== '') {
                $conversationPayload = $this->fetchInstagramGraphPage($nextUrl, $query);
                $query = [];

                foreach ((array) ($conversationPayload['data'] ?? []) as $conversation) {
                    $conversationId = trim((string) ($conversation['id'] ?? ''));
                    if ($conversationId === '') {
                        continue;
                    }

                    $this->upsertInstagramConversationStub(
                        $account,
                        $conversationId,
                        (string) ($conversation['updated_time'] ?? ''),
                        (array) data_get($conversation, 'participants.data', [])
                    );

                    $this->importInstagramConversationHistory($account, $token, $conversationId);
                }

                $nextUrl = trim((string) data_get($conversationPayload, 'paging.next', ''));
            }

            $account->instagram_initial_sync_completed_at = now();
            $account->instagram_initial_sync_error = null;
            $account->sync_last_at = now();
            $account->save();
        } catch (\Throwable $e) {
            $account->instagram_initial_sync_error = $e->getMessage();
            $account->save();

            Log::warning('Initial Instagram history sync failed.', [
                'account_id' => $account->id,
                'message' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    public function syncInstagramConversationMessages(Account $account, Contact $contact, int $messageLimit = 50): void
    {
        if ($account->service !== 'instagram') {
            return;
        }

        $account->refresh();
        $this->hydrateInstagramLoginIdentity($account, true);

        if (
            $account->status !== 'Active'
            || (string) ($account->connection_status ?? '') !== 'connected'
            || empty($account->instagram_account_id)
        ) {
            throw new RuntimeException('Instagram account is not fully connected.');
        }

        $this->syncInstagramLoginConversationMessages($account, $contact, $messageLimit);
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
            if (
                empty($account->instagram_account_id)
                || empty($account->instagram_user_access_token_encrypted)
                || (string) ($account->connection_status ?? '') !== 'connected'
            ) {
                return;
            }

            $this->startInitialInstagramHistorySyncSafely($account);

            if (! $force && $account->sync_last_at) {
                return;
            }

            try {
                $this->syncInstagramLoginConversations($account, 25, 75, false);
                $account->sync_last_at = now();
                $account->save();
            } catch (\Throwable $e) {
                Log::warning('Historical Instagram Login sync failed after connection.', [
                    'account_id' => $account->id,
                    'message' => $e->getMessage(),
                ]);
            }

            return;
        }

        if (empty($account->fb_phone_number_id)) {
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
        $pageId = (string) ($account->fb_phone_number_id ?: '');
        $pageToken = (string) ($account->page_token ?: '');

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

        $query['platform'] = 'messenger';

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
                $this->ingestHistoricalSocialMessage($account, $participants, (array) $message, $conversationId);
            }
        }
    }

    private function syncInstagramLoginConversations(
        Account $account,
        int $conversationLimit = 25,
        int $messageLimit = 75,
        bool $force = false
    ): void {
        $account->refresh();

        if (
            $account->service !== 'instagram'
            || ! $this->isInstagramLoginConnection($account)
            || $account->status !== 'Active'
            || (string) ($account->connection_status ?? '') !== 'connected'
            || empty($account->instagram_account_id)
        ) {
            return;
        }

        $token = $this->resolveInstagramUserAccessToken($account, $force);
        if ($token === '') {
            throw new RuntimeException('Instagram Login connection is missing the Instagram User access token.');
        }

        $conversationPayload = $this->fetchInstagramConversations($account, $token, $conversationLimit);

        foreach ((array) ($conversationPayload['data'] ?? []) as $conversation) {
            $conversationId = (string) ($conversation['id'] ?? '');
            if ($conversationId === '') {
                continue;
            }

            $this->upsertInstagramConversationStub(
                $account,
                $conversationId,
                (string) ($conversation['updated_time'] ?? ''),
                (array) data_get($conversation, 'participants.data', [])
            );

            $messagesPayload = $this->fetchInstagramConversationMessages($token, $conversationId, $messageLimit);
            $participants = $this->mapConversationParticipants(
                (array) data_get($conversation, 'participants.data', data_get($messagesPayload, 'participants.data', []))
            );

            $messages = collect((array) ($messagesPayload['data'] ?? []))
                ->sortBy(fn (array $message) => (string) ($message['created_time'] ?? ''))
                ->values();

            foreach ($messages as $message) {
                $this->ingestHistoricalSocialMessage($account, $participants, (array) $message, $conversationId);
            }
        }

        $account->sync_last_at = now();
        $account->save();
    }

    private function syncInstagramLoginConversationMessages(Account $account, Contact $contact, int $messageLimit = 50): void
    {
        $token = $this->resolveInstagramUserAccessToken($account);
        if ($token === '') {
            throw new RuntimeException('Instagram Login connection is missing the Instagram User access token.');
        }

        $conversation = $account->chatThreads()
            ->where('channel', 'instagram')
            ->where('contact_id', $contact->id)
            ->when($this->hasInstagramConversationIdColumn(), function ($query) {
                $query->orderByRaw('CASE WHEN instagram_conversation_id IS NULL OR instagram_conversation_id = \'\' THEN 1 ELSE 0 END');
            })
            ->latest('last_message_at')
            ->latest('updated_at')
            ->first();

        $conversationId = $this->hasInstagramConversationIdColumn()
            ? trim((string) ($conversation->instagram_conversation_id ?? ''))
            : '';
        if ($conversationId === '') {
            $recipientId = $this->hasInstagramUserIdColumn()
                ? trim((string) ($contact->instagram_user_id ?? ''))
                : '';
            if ($recipientId === '' && preg_match('/^\d+$/', trim((string) ($contact->instagram_username ?? '')))) {
                $recipientId = trim((string) $contact->instagram_username);
            }

            if ($recipientId === '') {
                throw new RuntimeException('Instagram contact is missing the Instagram-scoped user identifier.');
            }

            $conversationPayload = Http::timeout(20)
                ->retry(2, 250)
                ->get($this->instagramGraphUrl('/' . $account->instagram_account_id . '/conversations'), [
                    'platform' => 'instagram',
                    'user_id' => $recipientId,
                    'access_token' => $token,
                ])
                ->throw()
                ->json();

            $conversationId = (string) data_get($conversationPayload, 'data.0.id', '');
            if ($conversationId === '') {
                $account->sync_last_at = now();
                $account->save();
                return;
            }

            if ($conversation && $this->hasInstagramConversationIdColumn()) {
                $conversation->instagram_conversation_id = $conversationId;
                $conversation->save();
            }
        }

        $messagesPayload = $this->fetchInstagramConversationMessages($token, $conversationId, $messageLimit);
        $participants = $this->mapConversationParticipants((array) data_get($messagesPayload, 'participants.data', []));
        $messages = collect((array) ($messagesPayload['data'] ?? []))
            ->sortBy(fn (array $message) => (string) ($message['created_time'] ?? ''))
            ->values();

        foreach ($messages as $message) {
            $this->ingestHistoricalSocialMessage($account, $participants, (array) $message, $conversationId);
        }

        $account->sync_last_at = now();
        $account->save();
    }

    public function fetchInstagramConversations(Account $account, string $token, int $limit = 25): array
    {
        $instagramAccountId = (string) ($account->instagram_account_id ?? '');
        if ($instagramAccountId === '') {
            throw new RuntimeException('Instagram Login connection is missing the Instagram account identifier.');
        }

        return Http::timeout(20)
            ->retry(2, 250)
            ->get($this->instagramGraphUrl("/{$instagramAccountId}/conversations"), [
                'platform' => 'instagram',
                'fields' => 'id,updated_time,participants{id,name,username}',
                'limit' => $limit,
                'access_token' => $token,
            ])
            ->throw()
            ->json();
    }

    public function fetchInstagramConversationMessages(string $token, string $conversationId, int $limit = 50): array
    {
        $conversationPayload = Http::timeout(20)
            ->retry(2, 250)
            ->get($this->instagramGraphUrl("/{$conversationId}"), [
                'fields' => sprintf('participants{id,name,username},messages.limit(%d)', max(1, $limit)),
                'access_token' => $token,
            ])
            ->throw()
            ->json();

        $messageIds = collect((array) data_get($conversationPayload, 'messages.data', []))
            ->pluck('id')
            ->filter(fn ($id) => is_string($id) && $id !== '')
            ->take($limit)
            ->values();

        $messages = [];
        foreach ($messageIds as $messageId) {
            $details = $this->fetchInstagramMessageDetails($token, (string) $messageId);
            if ($details !== []) {
                $messages[] = $details;
            }
        }

        return [
            'data' => $messages,
            'participants' => data_get($conversationPayload, 'participants', []),
        ];
    }

    private function fetchInstagramGraphPage(string $url, array $query = []): array
    {
        $response = Http::timeout(30)
            ->retry(2, 250)
            ->get($url, $query)
            ->throw()
            ->json();

        return is_array($response) ? $response : [];
    }

    private function importInstagramConversationHistory(Account $account, string $token, string $conversationId): void
    {
        $nextUrl = $this->instagramGraphUrl("/{$conversationId}");
        $query = [
            'fields' => 'messages{id,created_time}',
            'access_token' => $token,
        ];
        $isFirstPage = true;

        while ($nextUrl !== '') {
            $payload = $this->fetchInstagramGraphPage($nextUrl, $query);
            $query = [];

            $messageData = $isFirstPage
                ? (array) data_get($payload, 'messages.data', [])
                : (array) ($payload['data'] ?? []);
            $nextMessagesUrl = $isFirstPage
                ? trim((string) data_get($payload, 'messages.paging.next', ''))
                : trim((string) data_get($payload, 'paging.next', ''));

            foreach ($messageData as $messageSummary) {
                $messageId = trim((string) ($messageSummary['id'] ?? ''));
                if ($messageId === '') {
                    continue;
                }

                try {
                    $details = $this->fetchInstagramMessageDetails($token, $messageId, [
                        'account_id' => $account->id,
                        'conversation_id' => $conversationId,
                    ]);
                } catch (\Throwable $e) {
                    Log::info('Skipping Instagram message detail during initial import.', [
                        'account_id' => $account->id,
                        'conversation_id' => $conversationId,
                        'message_id' => $messageId,
                        'reason' => $e->getMessage(),
                    ]);

                    continue;
                }

                if ($details === []) {
                    $this->upsertInstagramConversationStub(
                        $account,
                        $conversationId,
                        (string) ($messageSummary['created_time'] ?? '')
                    );

                    continue;
                }

                $participants = $this->participantsFromInstagramMessageDetails($details);
                $this->ingestHistoricalSocialMessage($account, $participants, $details, $conversationId);
            }

            $nextUrl = $nextMessagesUrl;
            $isFirstPage = false;
        }
    }

    private function participantsFromInstagramMessageDetails(array $message): array
    {
        $participants = [];

        $fromId = trim((string) data_get($message, 'from.id', ''));
        if ($fromId !== '') {
            $participants[$fromId] = [
                'name' => (string) (
                    data_get($message, 'from.name')
                    ?: data_get($message, 'from.username')
                    ?: ''
                ),
                'username' => (string) data_get($message, 'from.username', ''),
            ];
        }

        foreach ((array) data_get($message, 'to.data', []) as $recipient) {
            $recipientId = trim((string) ($recipient['id'] ?? ''));
            if ($recipientId === '') {
                continue;
            }

            $participants[$recipientId] = [
                'name' => (string) (($recipient['name'] ?? $recipient['username'] ?? '')),
                'username' => (string) ($recipient['username'] ?? ''),
            ];
        }

        return $participants;
    }

    private function upsertInstagramConversationStub(Account $account, string $conversationId, ?string $updatedTime = null, array $participants = []): void
    {
        if (! $this->hasInstagramConversationIdColumn()) {
            return;
        }

        $contactId = $this->resolveInstagramConversationContactId($account, $participants);

        $conversation = ChatListContact::query()
            ->where('user_id', $account->user_id)
            ->where('channel', 'instagram')
            ->where('account_id', $account->id)
            ->where('instagram_conversation_id', $conversationId)
            ->first();

        if (! $conversation && $contactId) {
            $conversation = ChatListContact::query()
                ->where('user_id', $account->user_id)
                ->where('channel', 'instagram')
                ->where('contact_id', $contactId)
                ->where(function ($query) use ($account) {
                    $query->where('account_id', $account->id)
                        ->orWhereNull('account_id');
                })
                ->where(function ($query) {
                    $query->whereNull('instagram_conversation_id')
                        ->orWhere('instagram_conversation_id', '');
                })
                ->orderByRaw('CASE WHEN account_id IS NULL THEN 1 ELSE 0 END')
                ->orderByDesc('id')
                ->first();
        }

        if (! $conversation && $contactId) {
            $conversation = ChatListContact::query()
                ->where('user_id', $account->user_id)
                ->where('channel', 'instagram')
                ->where('contact_id', $contactId)
                ->orderByDesc('id')
                ->first();
        }

        if (! $conversation) {
            $conversation = new ChatListContact();
            $conversation->user_id = $account->user_id;
            $conversation->channel = 'instagram';
            $conversation->account_id = $account->id;
            $conversation->instagram_conversation_id = $conversationId;
        }

        if ($contactId) {
            $conversation->contact_id = $contactId;
        }

        $conversation->account_id = $account->id;
        $conversation->channel = 'instagram';
        $conversation->user_id = $account->user_id;

        if (! $conversation->instagram_conversation_id) {
            $conversation->instagram_conversation_id = $conversationId;
        }

        if ($updatedTime) {
            $conversation->last_message_at = $updatedTime;
        }

        $conversation->save();
    }

    private function resolveInstagramConversationContactId(Account $account, array $participants): ?int
    {
        if ($participants === []) {
            return null;
        }

        $assetIds = $this->instagramAssetIds($account);

        foreach ($participants as $participant) {
            $participantId = trim((string) ($participant['id'] ?? ''));
            if ($participantId === '' || in_array($participantId, $assetIds, true)) {
                continue;
            }

            $contact = app(MsgController::class)->upsertInstagramContactByRemoteId(
                $participantId,
                (int) $account->user_id,
                (string) ($participant['name'] ?? $participant['username'] ?? ''),
                (string) ($participant['username'] ?? '')
            );

            if (! $contact) {
                return null;
            }

            return (int) $contact->id;
        }

        return null;
    }

    public function syncInstagramConversationIndex(Account $account, int $conversationLimit = 50, int $messageLimit = 75): void
    {
        $account->refresh();

        if (
            $account->service !== 'instagram'
            || ! $this->isInstagramLoginConnection($account)
            || $account->status !== 'Active'
            || (string) ($account->connection_status ?? '') !== 'connected'
            || empty($account->instagram_account_id)
            || empty($account->instagram_user_access_token_encrypted)
        ) {
            return;
        }

        $token = $this->resolveInstagramUserAccessToken($account, false);
        if ($token === '') {
            throw new RuntimeException('Instagram Login connection is missing the Instagram User access token.');
        }

        $conversationPayload = $this->fetchInstagramConversations($account, $token, $conversationLimit);
        $localThreads = $account->chatThreads()
            ->where('channel', 'instagram')
            ->whereNotNull('instagram_conversation_id')
            ->get()
            ->keyBy(fn (ChatListContact $thread) => (string) $thread->instagram_conversation_id);

        foreach ((array) ($conversationPayload['data'] ?? []) as $conversation) {
            $conversationId = trim((string) ($conversation['id'] ?? ''));
            if ($conversationId === '') {
                continue;
            }

            $updatedTime = trim((string) ($conversation['updated_time'] ?? ''));
            $participants = (array) data_get($conversation, 'participants.data', []);

            $this->upsertInstagramConversationStub($account, $conversationId, $updatedTime, $participants);

            $localThread = $localThreads->get($conversationId);
            $localUpdatedAt = $localThread?->last_message_at ?: $localThread?->updated_at;
            $remoteUpdatedAt = $updatedTime !== '' ? Carbon::parse($updatedTime) : null;
            $shouldImport = ! $localThread;

            if (! $shouldImport && $remoteUpdatedAt) {
                $shouldImport = ! $localUpdatedAt || $remoteUpdatedAt->gt(Carbon::parse($localUpdatedAt));
            }

            if (! $shouldImport) {
                continue;
            }

            $this->importInstagramConversationHistory($account, $token, $conversationId);
        }

        $account->sync_last_at = now();
        $account->save();
    }

    public function syncInstagramConversationIndexSafely(Account $account, int $conversationLimit = 50, int $messageLimit = 75): void
    {
        try {
            $this->syncInstagramConversationIndex($account, $conversationLimit, $messageLimit);
        } catch (\Throwable $e) {
            $account->refresh();
            $account->instagram_initial_sync_error = $e->getMessage();
            $account->save();

            Log::warning('Instagram conversation index reconciliation failed.', [
                'account_id' => $account->id,
                'message' => $e->getMessage(),
            ]);
        }
    }

    public function sendInstagramMessage(Account $account, string $recipientId, $content, array $attachment = []): array
    {
        $account->refresh();
        $this->hydrateInstagramLoginIdentity($account, true);

        if ($account->service !== 'instagram') {
            throw new RuntimeException('Account is not an Instagram channel.');
        }

        if (
            ! $this->isInstagramLoginConnection($account)
            || (string) ($account->connection_status ?? '') !== 'connected'
            || empty($account->instagram_account_id)
            || empty($account->instagram_user_access_token_encrypted)
        ) {
            throw new RuntimeException('Instagram Login setup is incomplete. Reconnect Instagram to continue.');
        }

        $token = $this->resolveInstagramUserAccessToken($account);
        if ($token === '') {
            throw new RuntimeException('Instagram Login access token is unavailable.');
        }

        $messages = [];
        if (is_array($content) && isset($content['messages']) && is_array($content['messages'])) {
            $messages = array_values(array_filter($content['messages'], 'is_array'));
        } else {
            $messages[] = $attachment !== []
                ? [
                    'attachment' => [
                        'type' => (string) ($attachment['type'] ?? 'image'),
                        'payload' => [
                            'url' => (string) ($attachment['url'] ?? ''),
                        ],
                    ],
                ]
                : ['text' => (string) $content];
        }

        $result = [];
        $messageIds = [];

        foreach ($messages as $message) {
            $response = Http::asForm()->post(
                $this->instagramGraphUrl('/' . $account->instagram_account_id . '/messages'),
                [
                    'recipient' => json_encode(['id' => $recipientId]),
                    'message' => json_encode($message),
                    'access_token' => $token,
                ]
            );

            $payload = $response->throw()->json();
            $result = is_array($payload) ? $payload : [];

            if (isset($result['message_id'])) {
                $messageIds[] = $result['message_id'];
            } elseif (isset($result['id'])) {
                $messageIds[] = $result['id'];
            }
        }

        if ($messageIds !== []) {
            $result['message_ids'] = $messageIds;
            $result['message_id'] = end($messageIds);
        }

        return $result;
    }

    private function hydrateInstagramLoginIdentity(Account $account, bool $save = false): void
    {
        if (! $this->isInstagramLoginConnection($account)) {
            return;
        }

        $savedAccount = Arr::get($account->connection_metadata, 'instagram_login.account', []);
        if (! is_array($savedAccount) || $savedAccount === []) {
            return;
        }

        $changed = false;

        $appScopedUserId = (string) ($savedAccount['app_scoped_user_id'] ?? '');
        $instagramAccountId = (string) ($savedAccount['instagram_account_id'] ?? '');
        $instagramUsername = (string) ($savedAccount['username'] ?? '');
        $instagramName = (string) ($savedAccount['name'] ?? $instagramUsername);

        if ($account->instagram_app_scoped_user_id === null || $account->instagram_app_scoped_user_id === '') {
            if ($appScopedUserId !== '') {
                $account->instagram_app_scoped_user_id = $appScopedUserId;
                $changed = true;
            }
        }

        if ($account->instagram_account_id === null || $account->instagram_account_id === '') {
            if ($instagramAccountId !== '') {
                $account->instagram_account_id = $instagramAccountId;
                $changed = true;
            }
        }

        if ($account->instagram_username === null || $account->instagram_username === '') {
            if ($instagramUsername !== '') {
                $account->instagram_username = $instagramUsername;
                $changed = true;
            }
        }

        if ($account->instagram_name === null || $account->instagram_name === '') {
            if ($instagramName !== '') {
                $account->instagram_name = $instagramName;
                $changed = true;
            }
        }

        if (
            $account->instagram_account_id
            && $account->instagram_username
            && ((string) ($account->connection_status ?? '') !== 'connected'
                || (string) ($account->setup_state ?? '') !== 'complete'
                || ! empty($account->connection_error))
        ) {
            $account->connection_status = 'connected';
            $account->setup_state = 'complete';
            $account->connection_error = null;
            $account->status = 'Active';
            $changed = true;
        }

        if ($changed && $save) {
            $account->save();
        }
    }

    private function subscribeInstagramLoginWebhook(Account $account): void
    {
        // Instagram Login webhook subscriptions are configured in the Meta app
        // product dashboard, not per connected account via the Graph API.
    }

    private function resolveInstagramUserAccessToken(Account $account, bool $forceRefresh = false): string
    {
        $token = (string) ($account->instagram_user_access_token_encrypted ?? '');
        if ($token === '') {
            return '';
        }

        $expiresAt = $account->instagram_token_expires_at;
        $shouldRefresh = $forceRefresh;

        if ($expiresAt instanceof Carbon) {
            $shouldRefresh = $shouldRefresh || $expiresAt->lte(now()->addDays(7));
        }

        if (! $shouldRefresh) {
            return $token;
        }

        $refreshPayload = $this->refreshInstagramLoginLongLivedToken($token);
        if (! is_array($refreshPayload) || empty($refreshPayload['access_token'])) {
            return $token;
        }

        $account->instagram_user_access_token_encrypted = (string) $refreshPayload['access_token'];
        $account->instagram_token_expires_at = $this->resolveInstagramTokenExpiry($refreshPayload);
        $account->instagram_token_last_refreshed_at = now();
        $account->instagram_refresh_metadata = array_filter([
            'token_type' => (string) ($refreshPayload['token_type'] ?? ''),
            'expires_in' => isset($refreshPayload['expires_in']) ? (int) $refreshPayload['expires_in'] : null,
            'refreshed_at' => now()->toIso8601String(),
        ], static fn ($value) => $value !== null && $value !== '');
        $account->save();

        return (string) $account->instagram_user_access_token_encrypted;
    }

    private function mapConversationParticipants(array $participants): array
    {
        $mapped = [];

        foreach ($participants as $participant) {
            $participantId = (string) ($participant['id'] ?? '');
            if ($participantId === '') {
                continue;
            }

            $mapped[$participantId] = [
                'name' => (string) ($participant['name'] ?? $participant['username'] ?? ''),
                'username' => (string) ($participant['username'] ?? ''),
            ];
        }

        return $mapped;
    }

    private function ingestHistoricalSocialMessage(
        Account $account,
        array $participants,
        array $message,
        ?string $conversationId = null
    ): void
    {
        $service = (string) $account->service;
        $assetIds = $service === 'instagram'
            ? $this->instagramAssetIds($account)
            : array_values(array_filter([(string) ($account->fb_phone_number_id ?: '')]));
        $assetId = $assetIds[0] ?? '';
        $messageId = (string) ($message['id'] ?? '');
        $fromId = (string) data_get($message, 'from.id', '');
        $fromName = (string) data_get($message, 'from.name', '');

        if ($assetId === '' || $messageId === '' || $fromId === '') {
            return;
        }

        $isOutgoing = in_array($fromId, $assetIds, true);
        $counterpartyId = $isOutgoing
            ? $this->extractHistoricalCounterpartyId($message, $assetId, $participants)
            : $fromId;

        if ($counterpartyId === '') {
            return;
        }

        $participantProfile = $participants[$counterpartyId] ?? [];
        $counterpartyName = is_array($participantProfile)
            ? (string) ($participantProfile['name'] ?? '')
            : (string) $participantProfile;
        $counterpartyUsername = is_array($participantProfile)
            ? (string) ($participantProfile['username'] ?? '')
            : '';

        if ($counterpartyName === '' && ! $isOutgoing) {
            $counterpartyName = $fromName;
        }

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
            'instagram_user_id' => $service === 'instagram' ? $counterpartyId : null,
            'instagram_conversation_id' => $service === 'instagram' ? trim((string) ($conversationId ?? '')) : null,
            'instagram_username' => $service === 'instagram' ? $counterpartyUsername : null,
            'raw_payload' => $message,
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
        if ((bool) ($account->requires_reconnect ?? false)) {
            return 'connection_error';
        }

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

    public function isMetaAccessTokenInvalid($error): bool
    {
        $message = strtolower(trim(is_array($error) ? (string) ($error['message'] ?? '') : (string) $error));

        if ($message === '') {
            return false;
        }

        return str_contains($message, 'error validating access token')
            || str_contains($message, 'session has been invalidated')
            || str_contains($message, 'invalid oauth access token')
            || str_contains($message, 'access token has expired')
            || str_contains($message, 'the session has expired')
            || str_contains($message, 'user changed their password');
    }

    public function refreshFacebookPageAccessToken(Account $account): string
    {
        if ($account->service !== 'facebook' && $account->service_engine !== 'facebook') {
            return '';
        }

        return (string) ((new WhatsAppUsers())->getFbPageAccessToken($account, true) ?: '');
    }

    public function markFacebookReconnectRequired(Account $account, string $message = ''): void
    {
        $account->requires_reconnect = true;
        $account->connection_error = $message !== '' ? $message : 'Connect Facebook again to continue.';
        $account->fb_token = null;
        $account->page_token = null;
        $account->meta_page_token = null;
        $account->status = 'Draft';
        $account->save();
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
        if ($account->service !== 'facebook' || empty($account->fb_phone_number_id)) {
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
                        ->orWhereIn('instagram_app_scoped_user_id', $candidateIds);
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
        $instagramAssetIds = $this->instagramAssetIds($account);
        $assetId = $service === 'instagram'
            ? ($instagramAssetIds[0] ?? '')
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

        $type = ($isEcho || ($service === 'instagram'
            ? in_array($senderId, $instagramAssetIds, true)
            : $senderId === $assetId))
            ? 'outgoing'
            : 'incoming';
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
            'contact_name' => (string) (
                Arr::get($event, 'sender.name')
                ?: Arr::get($event, 'sender.username')
                ?: Arr::get($event, 'from.name')
                ?: ''
            ),
            'raw_payload' => $event,
        ];

        if ($service === 'instagram') {
            $normalized['instagram_user_id'] = $type === 'incoming' ? $senderId : $recipientId;
            $normalized['instagram_conversation_id'] = (string) Arr::get($event, 'conversation.id', '');
            $normalized['instagram_username'] = (string) (
                Arr::get($event, 'sender.username')
                ?: Arr::get($event, 'from.username')
                ?: ''
            );
        }

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

        if ($service === 'instagram' && $this->hasInstagramUserIdColumn()) {
            $contact = Contact::query()
                ->where('creater_id', $account->user_id)
                ->where(function ($query) use ($contactServiceId) {
                    $query->where('instagram_user_id', $contactServiceId)
                        ->orWhere(function ($fallbackQuery) use ($contactServiceId) {
                            $fallbackQuery->whereNull('instagram_user_id')
                                ->where('instagram_username', $contactServiceId);
                        });
                })
                ->first();
        } elseif ($service === 'instagram') {
            $contact = Contact::query()
                ->where('instagram_username', $contactServiceId)
                ->where('creater_id', $account->user_id)
                ->first();
        } else {
            $contact = Contact::query()
                ->where('facebook_username', $contactServiceId)
                ->where('creater_id', $account->user_id)
                ->first();
        }

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

    private function instagramAssetIds(Account $account): array
    {
        return array_values(array_filter([
            (string) ($account->instagram_account_id ?: ''),
            (string) ($account->instagram_app_scoped_user_id ?: ''),
        ]));
    }

    private function fetchInstagramMessageDetails(string $token, string $messageId, array $context = []): array
    {
        $payload = Http::timeout(20)
            ->retry(2, 250)
            ->get($this->instagramGraphUrl("/{$messageId}"), [
                'fields' => 'id,created_time,from,to,message',
                'access_token' => $token,
            ])
            ->throw()
            ->json();

        if (! is_array($payload) || ! isset($payload['id'])) {
            Log::warning('Instagram message details response was empty.', [
                'account_id' => $context['account_id'] ?? null,
                'conversation_id' => $context['conversation_id'] ?? null,
                'message_id' => $messageId,
            ]);

            return [];
        }

        return $payload;
    }
}
