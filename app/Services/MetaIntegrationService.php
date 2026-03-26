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
        $account->status = $account->fb_phone_number_id && isset($pages[$account->fb_phone_number_id])
            ? 'Active'
            : 'Draft';
        $account->fb_token = $accessToken;
        $account->fb_user_id = (string) ($profile['id'] ?? '');
        $account->fb_meta_data = base64_encode(serialize($pages));
        $account->connection_metadata = $this->buildConnectionMetadata(
            is_array($account->connection_metadata) ? $account->connection_metadata : [],
            $profile,
            $pages,
            $tokenPayload
        );

        $this->applySelectedAssetData($account, $pages);
        $account->save();

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

        return $this->buildFacebookSetupPayload($account);
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

        Log::info('Meta webhook event received.', [
            'path' => $request->path(),
            'legacy_route' => $legacyRoute,
            'object' => $payload['object'] ?? null,
            'entry_count' => count($payload['entry'] ?? []),
            'summary' => $this->summarizeWebhookPayload($payload),
        ]);

        foreach (($payload['entry'] ?? []) as $entry) {
            foreach (($entry['messaging'] ?? []) as $event) {
                try {
                    $this->handleFacebookMessagingEvent($entry, (array) $event);
                } catch (\Throwable $e) {
                    Log::warning('Unable to process Meta messaging event.', [
                        'legacy_route' => $legacyRoute,
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

    private function handleFacebookMessagingEvent(array $entry, array $event): void
    {
        $account = $this->resolveFacebookAccountForMessagingEvent($entry, $event);

        if (! $account) {
            return;
        }

        if (! empty($event['message'])) {
            $this->storeFacebookMessageEvent($account, $event);

            return;
        }

        if (! empty($event['delivery']['mids']) && is_array($event['delivery']['mids'])) {
            Msg::whereIn('service_id', $event['delivery']['mids'])
                ->update(['is_delivered' => true]);

            return;
        }

        if (! empty($event['read']['watermark'])) {
            $this->markFacebookMessagesRead($account, $event);
        }
    }

    private function resolveFacebookAccountForMessagingEvent(array $entry, array $event): ?Account
    {
        $candidateIds = array_filter([
            (string) Arr::get($entry, 'id', ''),
            (string) Arr::get($event, 'sender.id', ''),
            (string) Arr::get($event, 'recipient.id', ''),
        ]);

        if ($candidateIds === []) {
            return null;
        }

        return Account::query()
            ->where('service', 'facebook')
            ->whereIn('fb_phone_number_id', $candidateIds)
            ->orderByDesc('id')
            ->first();
    }

    private function storeFacebookMessageEvent(Account $account, array $event): void
    {
        $pageId = (string) $account->fb_phone_number_id;
        $senderId = (string) Arr::get($event, 'sender.id', '');
        $recipientId = (string) Arr::get($event, 'recipient.id', '');
        $isEcho = (bool) Arr::get($event, 'message.is_echo', false);
        $messageId = (string) Arr::get($event, 'message.mid', '');

        if ($messageId === '') {
            return;
        }

        $type = ($isEcho || $senderId === $pageId) ? 'outgoing' : 'incoming';
        $normalized = [
            'account' => $account->id,
            'service' => 'facebook',
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

    private function markFacebookMessagesRead(Account $account, array $event): void
    {
        $contactFacebookId = (string) Arr::get($event, 'sender.id', '');
        $watermark = $this->normalizeOccurredAt(Arr::get($event, 'read.watermark'));

        if ($contactFacebookId === '' || ! $watermark) {
            return;
        }

        $contact = Contact::query()
            ->where('facebook_username', $contactFacebookId)
            ->where('creater_id', $account->user_id)
            ->first();

        if (! $contact) {
            return;
        }

        Msg::query()
            ->where('service', 'facebook')
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
