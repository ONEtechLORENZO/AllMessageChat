<?php

namespace App\Services;

use App\Models\Account;
use App\Models\ChatListContact;
use App\Models\Contact;
use App\Models\Msg;
use Carbon\Carbon;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use RuntimeException;

class GmailService
{
    private const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
    private const TOKEN_URL = 'https://oauth2.googleapis.com/token';
    private const USERINFO_URL = 'https://openidconnect.googleapis.com/v1/userinfo';
    private const API_BASE = 'https://gmail.googleapis.com/gmail/v1/users/me';

    public function authorizationUrl(string $state): string
    {
        $query = http_build_query([
            'client_id' => (string) config('services.google.client_id'),
            'redirect_uri' => (string) config('services.google.redirect'),
            'response_type' => 'code',
            'scope' => implode(' ', $this->oauthScopes()),
            'access_type' => 'offline',
            'include_granted_scopes' => 'true',
            'prompt' => 'consent',
            'state' => $state,
        ]);

        return self::AUTH_URL . '?' . $query;
    }

    public function oauthScopes(): array
    {
        return [
            'openid',
            'email',
            'profile',
            'https://www.googleapis.com/auth/gmail.send',
            'https://www.googleapis.com/auth/gmail.modify',
        ];
    }

    public function exchangeCodeForTokens(string $code): array
    {
        $response = Http::asForm()
            ->acceptJson()
            ->post(self::TOKEN_URL, [
                'code' => $code,
                'client_id' => (string) config('services.google.client_id'),
                'client_secret' => (string) config('services.google.client_secret'),
                'redirect_uri' => (string) config('services.google.redirect'),
                'grant_type' => 'authorization_code',
            ]);

        if (! $response->successful()) {
            throw new RuntimeException('Google OAuth token exchange failed.');
        }

        return $response->json();
    }

    public function fetchUserProfile(string $accessToken): array
    {
        $response = Http::withToken($accessToken)
            ->acceptJson()
            ->get(self::USERINFO_URL);

        if (! $response->successful()) {
            throw new RuntimeException('Unable to load Google account profile.');
        }

        return $response->json();
    }

    public function connectAccount(int $userId, ?Account $existingAccount, array $profile, array $tokenPayload): Account
    {
        $email = strtolower(trim((string) ($profile['email'] ?? '')));
        if ($email === '') {
            throw new RuntimeException('Google profile response did not include an email address.');
        }

        $account = $existingAccount;
        if (! $account) {
            $account = Account::where('user_id', $userId)
                ->where('service', 'email')
                ->where(function ($query) use ($profile, $email) {
                    $query->where('google_provider_user_id', (string) ($profile['sub'] ?? ''))
                        ->orWhere('email', $email);
                })
                ->first();
        }

        if (! $account) {
            $account = new Account();
            $account->user_id = $userId;
            $account->company_name = (string) ($profile['name'] ?? $email);
        }

        $account->service = 'email';
        $account->service_engine = 'gmail_oauth';
        $account->status = 'Active';
        $account->email = $email;
        $account->display_name = (string) ($profile['name'] ?? $account->display_name ?: $email);
        $account->google_provider_user_id = (string) ($profile['sub'] ?? '');
        $account->oauth_access_token_encrypted = (string) ($tokenPayload['access_token'] ?? '');

        if (! empty($tokenPayload['refresh_token'])) {
            $account->oauth_refresh_token_encrypted = (string) $tokenPayload['refresh_token'];
        }

        if (! empty($tokenPayload['expires_in'])) {
            $account->oauth_token_expires_at = now()->addSeconds(max(((int) $tokenPayload['expires_in']) - 60, 60));
        }

        $account->oauth_scope = (string) ($tokenPayload['scope'] ?? implode(' ', $this->oauthScopes()));
        $account->connection_metadata = array_filter([
            'google_name' => $profile['name'] ?? null,
            'google_picture' => $profile['picture'] ?? null,
        ], static fn ($value) => $value !== null && $value !== '');
        $account->save();

        return $account;
    }

    public function validAccessToken(Account $account): string
    {
        if ($account->service !== 'email' || $account->service_engine !== 'gmail_oauth') {
            throw new RuntimeException('This account is not linked with Gmail OAuth.');
        }

        $accessToken = (string) ($account->oauth_access_token_encrypted ?? '');
        $expiresAt = $account->oauth_token_expires_at;

        if ($accessToken !== '' && $expiresAt && $expiresAt->gt(now()->addMinute())) {
            return $accessToken;
        }

        return $this->refreshAccessToken($account);
    }

    public function sendMessage(Account $account, array $payload): array
    {
        $this->guardConfigured();

        $subject = trim((string) ($payload['subject'] ?? '(no subject)'));
        $to = array_values(array_filter((array) ($payload['to'] ?? [])));
        $cc = array_values(array_filter((array) ($payload['cc'] ?? [])));
        $bcc = array_values(array_filter((array) ($payload['bcc'] ?? [])));
        $textBody = (string) ($payload['text_body'] ?? '');
        $htmlBody = (string) ($payload['html_body'] ?? '');

        if ($htmlBody === '' && $textBody === '') {
            throw new RuntimeException('Email body is required.');
        }

        if ($htmlBody === '') {
            $htmlBody = nl2br(e($textBody));
        }

        if ($textBody === '') {
            $textBody = trim(strip_tags(str_replace(['<br>', '<br/>', '<br />'], PHP_EOL, $htmlBody)));
        }

        $rawMessage = $this->buildMimeMessage(
            fromEmail: (string) $account->email,
            fromName: (string) ($account->display_name ?: $account->company_name ?: $account->email),
            to: $to,
            cc: $cc,
            bcc: $bcc,
            subject: $subject,
            textBody: $textBody,
            htmlBody: $htmlBody,
            inReplyTo: $payload['in_reply_to'] ?? null,
            referencesHeader: $payload['references_header'] ?? null,
        );

        $requestPayload = [
            'raw' => $this->base64UrlEncode($rawMessage),
        ];

        if (! empty($payload['thread_id'])) {
            $requestPayload['threadId'] = $payload['thread_id'];
        }

        $response = $this->api($account)
            ->post(self::API_BASE . '/messages/send', $requestPayload);

        if (! $response->successful()) {
            throw new RuntimeException('Gmail send failed.');
        }

        $gmailMessage = $this->fetchMessage($account, (string) $response->json('id'));
        $message = $this->upsertLocalMessage($account, $gmailMessage);

        return [
            'gmail' => $gmailMessage,
            'message' => $message,
        ];
    }

    public function syncAccount(Account $account, int $initialMaxResults = 50): int
    {
        if ($account->service !== 'email' || $account->service_engine !== 'gmail_oauth' || $account->status !== 'Active') {
            return 0;
        }

        $this->guardConfigured();

        $processed = [];
        $mailboxProfile = $this->mailboxProfile($account);
        $historyCursor = (string) ($account->sync_last_history_id ?? '');

        if ($historyCursor !== '') {
            try {
                $processed = $this->syncFromHistory($account, $historyCursor);
            } catch (\Throwable $e) {
                Log::warning('Falling back to full Gmail sync after history sync failure.', [
                    'account_id' => $account->id,
                    'message' => $e->getMessage(),
                ]);
                $processed = $this->performInitialSync($account, $initialMaxResults);
            }
        } else {
            $processed = $this->performInitialSync($account, $initialMaxResults);
        }

        $account->sync_last_history_id = (string) ($mailboxProfile['historyId'] ?? $account->sync_last_history_id);
        $account->sync_last_at = now();
        $account->status = 'Active';
        $account->save();
        $this->deduplicateAccountConversations($account);

        return count($processed);
    }

    public function syncAccountSafely(Account $account, int $initialMaxResults = 50): array
    {
        $lock = Cache::lock($this->syncLockKey($account->id), 55);

        if (! $lock->get()) {
            return [
                'processed' => 0,
                'locked' => true,
                'last_sync_at' => optional($account->sync_last_at)->toIso8601String(),
            ];
        }

        try {
            $processed = $this->syncAccount($account, $initialMaxResults);
            $account->refresh();

            return [
                'processed' => $processed,
                'locked' => false,
                'last_sync_at' => optional($account->sync_last_at)->toIso8601String(),
            ];
        } finally {
            $lock->release();
        }
    }

    public function syncLockKey(int $accountId): string
    {
        return 'gmail-sync-account:' . $accountId;
    }

    private function performInitialSync(Account $account, int $initialMaxResults): array
    {
        $messageIds = [];

        foreach (['INBOX', 'SENT'] as $label) {
            $pageToken = null;
            $remaining = $initialMaxResults;

            do {
                $query = [
                    'labelIds' => $label,
                    'maxResults' => min($remaining, 100),
                ];

                if ($pageToken) {
                    $query['pageToken'] = $pageToken;
                }

                $response = $this->api($account)->get(self::API_BASE . '/messages', $query);
                if (! $response->successful()) {
                    break;
                }

                foreach ((array) $response->json('messages', []) as $messageRef) {
                    $messageIds[] = (string) ($messageRef['id'] ?? '');
                    $remaining--;
                    if ($remaining <= 0) {
                        break;
                    }
                }

                $pageToken = $response->json('nextPageToken');
            } while ($pageToken && $remaining > 0);
        }

        $messageIds = array_values(array_unique(array_filter($messageIds)));
        foreach ($messageIds as $messageId) {
            $this->upsertLocalMessage($account, $this->fetchMessage($account, $messageId));
        }

        return $messageIds;
    }

    private function syncFromHistory(Account $account, string $historyCursor): array
    {
        $messageIds = [];
        $pageToken = null;
        $latestHistoryId = $historyCursor;

        do {
            $query = [
                'startHistoryId' => $historyCursor,
                'maxResults' => 100,
            ];

            if ($pageToken) {
                $query['pageToken'] = $pageToken;
            }

            $response = $this->api($account)->get(self::API_BASE . '/history', $query);
            if ($response->status() === 404) {
                throw new RuntimeException('Gmail history cursor is no longer valid.');
            }

            if (! $response->successful()) {
                throw new RuntimeException('Unable to synchronize Gmail history.');
            }

            $latestHistoryId = (string) ($response->json('historyId') ?? $latestHistoryId);

            foreach ((array) $response->json('history', []) as $historyItem) {
                foreach (['messagesAdded', 'labelsAdded', 'labelsRemoved'] as $collection) {
                    foreach ((array) Arr::get($historyItem, $collection, []) as $entry) {
                        $messageId = (string) Arr::get($entry, 'message.id', '');
                        if ($messageId !== '') {
                            $messageIds[] = $messageId;
                        }
                    }
                }
            }

            $pageToken = $response->json('nextPageToken');
        } while ($pageToken);

        $messageIds = array_values(array_unique($messageIds));
        foreach ($messageIds as $messageId) {
            $this->upsertLocalMessage($account, $this->fetchMessage($account, $messageId));
        }

        $account->sync_last_history_id = $latestHistoryId;

        return $messageIds;
    }

    private function upsertLocalMessage(Account $account, array $gmailMessage): ?Msg
    {
        $normalized = $this->normalizeMessage($account, $gmailMessage);
        if ($normalized === null) {
            return null;
        }

        $contact = $this->findOrCreateEmailContact(
            email: $normalized['contact_email'],
            userId: (int) $account->user_id,
            displayName: $normalized['contact_name'],
        );

        $conversation = $this->resolveConversation($account, $contact, $normalized);

        $message = Msg::where('account_id', $account->id)
            ->where('gmail_message_id', $normalized['gmail_message_id'])
            ->first();

        if (! $message) {
            $message = new Msg();
        }

        $message->service_id = $normalized['gmail_message_id'];
        $message->service = 'email';
        $message->account_id = $account->id;
        $message->chat_list_contact_id = $conversation->id;
        $message->msgable_id = $contact->id;
        $message->msgable_type = Contact::class;
        $message->message = $normalized['message'];
        $message->body_text = $normalized['body_text'];
        $message->body_html = $normalized['body_html'];
        $message->msg_mode = $normalized['direction'];
        $message->status = $normalized['status'];
        $message->msg_type = 'Text';
        $message->is_delivered = $normalized['direction'] === 'outgoing';
        $message->is_read = $normalized['is_read'];
        $message->email_subject = $normalized['subject'];
        $message->sender_email = $normalized['sender_email'];
        $message->recipient_to = $normalized['recipient_to'];
        $message->recipient_cc = $normalized['recipient_cc'];
        $message->recipient_bcc = $normalized['recipient_bcc'];
        $message->gmail_message_id = $normalized['gmail_message_id'];
        $message->gmail_thread_id = $normalized['gmail_thread_id'];
        $message->internet_message_id = $normalized['internet_message_id'];
        $message->in_reply_to = $normalized['in_reply_to'];
        $message->references_header = $normalized['references_header'];
        $message->sent_at = $normalized['sent_at'];
        $message->received_at = $normalized['received_at'];
        $message->created_at = $normalized['occurred_at'];
        $message->updated_at = $normalized['occurred_at'];
        $message->save();

        $conversation->account_id = $account->id;
        $conversation->channel = 'email';
        $conversation->gmail_thread_id = $normalized['gmail_thread_id'];
        $conversation->email_subject = $normalized['subject'];
        $conversation->email_subject_normalized = $normalized['normalized_subject'];
        $conversation->email_participants_key = $normalized['participants_key'];
        $conversation->email_address = $normalized['contact_email'];
        $conversation->last_msg_id = $message->id;
        $conversation->last_message_at = $normalized['occurred_at'];
        $conversation->unread = $normalized['direction'] === 'incoming' && ! $normalized['is_read'];
        $conversation->unread_count = $this->emailUnreadCount($conversation->id);
        $conversation->updated_at = $normalized['occurred_at'];
        $conversation->save();

        return $message;
    }

    private function normalizeMessage(Account $account, array $gmailMessage): ?array
    {
        $payload = (array) ($gmailMessage['payload'] ?? []);
        $headers = $this->headersMap((array) ($payload['headers'] ?? []));
        [$bodyText, $bodyHtml] = $this->extractBodies($payload);

        $sender = $this->parseMailbox((string) ($headers['from'] ?? ''));
        $to = $this->parseAddressList((string) ($headers['to'] ?? ''));
        $cc = $this->parseAddressList((string) ($headers['cc'] ?? ''));
        $bcc = $this->parseAddressList((string) ($headers['bcc'] ?? ''));

        $accountEmail = strtolower((string) $account->email);
        $direction = in_array('SENT', (array) ($gmailMessage['labelIds'] ?? []), true)
            || strtolower((string) ($sender['email'] ?? '')) === $accountEmail
            ? 'outgoing'
            : 'incoming';

        $participantEmails = array_values(array_unique(array_filter(array_merge(
            [$sender['email'] ?? ''],
            array_column($to, 'email'),
            array_column($cc, 'email'),
            array_column($bcc, 'email'),
        ))));

        $contactMailbox = $this->resolvePrimaryContactMailbox($direction, $sender, $to, $cc, $bcc, $accountEmail);
        if (! $contactMailbox['email']) {
            return null;
        }

        $subject = trim((string) ($headers['subject'] ?? '(no subject)'));
        $internalDate = isset($gmailMessage['internalDate'])
            ? Carbon::createFromTimestampMs((int) $gmailMessage['internalDate'])
            : now();
        $isRead = ! in_array('UNREAD', (array) ($gmailMessage['labelIds'] ?? []), true);

        return [
            'gmail_message_id' => (string) ($gmailMessage['id'] ?? ''),
            'gmail_thread_id' => (string) ($gmailMessage['threadId'] ?? ''),
            'subject' => $subject,
            'normalized_subject' => $this->normalizeSubject($subject),
            'message' => trim($bodyText ?: strip_tags($bodyHtml)),
            'body_text' => $bodyText,
            'body_html' => $bodyHtml,
            'direction' => $direction,
            'status' => $direction === 'incoming' ? 'Received' : 'Sent',
            'sender_email' => strtolower((string) ($sender['email'] ?? '')),
            'recipient_to' => $this->addressValues($to),
            'recipient_cc' => $this->addressValues($cc),
            'recipient_bcc' => $this->addressValues($bcc),
            'internet_message_id' => $this->trimHeaderValue($headers['message-id'] ?? ''),
            'in_reply_to' => $this->trimHeaderValue($headers['in-reply-to'] ?? ''),
            'references_header' => trim((string) ($headers['references'] ?? '')),
            'sent_at' => $direction === 'outgoing' ? $internalDate : null,
            'received_at' => $direction === 'incoming' ? $internalDate : null,
            'occurred_at' => $internalDate,
            'is_read' => $isRead,
            'contact_email' => strtolower((string) $contactMailbox['email']),
            'contact_name' => (string) ($contactMailbox['name'] ?? ''),
            'participants_key' => $this->participantsKey($participantEmails, $accountEmail),
        ];
    }

    private function resolveConversation(Account $account, Contact $contact, array $normalized): ChatListContact
    {
        $query = ChatListContact::where('user_id', $account->user_id)
            ->where('channel', 'email')
            ->where('account_id', $account->id);

        if ($normalized['gmail_thread_id'] !== '') {
            $matches = (clone $query)
                ->where('gmail_thread_id', $normalized['gmail_thread_id'])
                ->orderByDesc('last_message_at')
                ->orderByDesc('updated_at')
                ->orderBy('id')
                ->get();
            if ($matches->isNotEmpty()) {
                return $this->mergeConversationDuplicates($matches->first(), $matches->slice(1));
            }
        }

        $messageIds = array_filter(array_merge(
            [$normalized['in_reply_to']],
            preg_split('/\s+/', (string) $normalized['references_header']) ?: [],
        ));

        if ($messageIds !== []) {
            $linkedMessage = Msg::where('account_id', $account->id)
                ->whereIn('internet_message_id', $messageIds)
                ->whereNotNull('chat_list_contact_id')
                ->first();

            if ($linkedMessage?->chat_list_contact_id) {
                $conversation = ChatListContact::find($linkedMessage->chat_list_contact_id);
                if ($conversation) {
                    return $this->deduplicateConversationFamily($conversation, $account, $contact, $normalized);
                }
            }
        }

        $matches = (clone $query)
            ->where('contact_id', $contact->id)
            ->where('email_subject_normalized', $normalized['normalized_subject'])
            ->where('email_participants_key', $normalized['participants_key'])
            ->orderByDesc('last_message_at')
            ->orderByDesc('updated_at')
            ->orderBy('id')
            ->get();

        if ($matches->isNotEmpty()) {
            return $this->mergeConversationDuplicates($matches->first(), $matches->slice(1));
        }

        $conversation = new ChatListContact();
        $conversation->user_id = $account->user_id;
        $conversation->contact_id = $contact->id;
        $conversation->account_id = $account->id;
        $conversation->channel = 'email';
        $conversation->gmail_thread_id = $normalized['gmail_thread_id'];
        $conversation->email_subject = $normalized['subject'];
        $conversation->email_subject_normalized = $normalized['normalized_subject'];
        $conversation->email_participants_key = $normalized['participants_key'];
        $conversation->email_address = $normalized['contact_email'];
        $conversation->unread = false;
        $conversation->unread_count = 0;
        $conversation->save();

        return $conversation;
    }

    public function deduplicateAccountConversations(Account $account): int
    {
        if ($account->service !== 'email' || $account->service_engine !== 'gmail_oauth') {
            return 0;
        }

        $conversations = ChatListContact::query()
            ->where('user_id', $account->user_id)
            ->where('channel', 'email')
            ->where('account_id', $account->id)
            ->orderByDesc('last_message_at')
            ->orderByDesc('updated_at')
            ->orderBy('id')
            ->get();

        $duplicateGroups = [];

        foreach ($conversations as $conversation) {
            $key = $this->conversationDeduplicationKey($conversation);
            if ($key === null) {
                continue;
            }

            $duplicateGroups[$key] ??= [];
            $duplicateGroups[$key][] = $conversation;
        }

        $mergedCount = 0;

        foreach ($duplicateGroups as $group) {
            if (count($group) < 2) {
                continue;
            }

            $primary = array_shift($group);
            $mergedCount += $this->mergeConversationDuplicates($primary, collect($group)) ? count($group) : 0;
        }

        return $mergedCount;
    }

    private function deduplicateConversationFamily(ChatListContact $conversation, Account $account, Contact $contact, array $normalized): ChatListContact
    {
        $matches = ChatListContact::query()
            ->where('user_id', $account->user_id)
            ->where('channel', 'email')
            ->where('account_id', $account->id)
            ->where(function ($query) use ($conversation, $contact, $normalized) {
                if ($normalized['gmail_thread_id'] !== '') {
                    $query->where('gmail_thread_id', $normalized['gmail_thread_id']);
                } else {
                    $query->where('contact_id', $contact->id)
                        ->where('email_subject_normalized', $normalized['normalized_subject'])
                        ->where('email_participants_key', $normalized['participants_key']);
                }

                $query->orWhere('id', $conversation->id);
            })
            ->orderByDesc('last_message_at')
            ->orderByDesc('updated_at')
            ->orderBy('id')
            ->get()
            ->unique('id')
            ->values();

        return $this->mergeConversationDuplicates($matches->first() ?: $conversation, $matches->slice(1));
    }

    private function conversationDeduplicationKey(ChatListContact $conversation): ?string
    {
        if (! empty($conversation->gmail_thread_id)) {
            return 'thread:' . $conversation->gmail_thread_id;
        }

        if (
            $conversation->contact_id
            && ! empty($conversation->email_subject_normalized)
            && ! empty($conversation->email_participants_key)
        ) {
            return 'fallback:' . implode(':', [
                $conversation->contact_id,
                $conversation->email_subject_normalized,
                $conversation->email_participants_key,
            ]);
        }

        return null;
    }

    private function mergeConversationDuplicates(ChatListContact $primary, $duplicates): ChatListContact
    {
        $duplicates = collect($duplicates)
            ->filter(fn ($conversation) => $conversation && $conversation->id !== $primary->id)
            ->unique('id')
            ->values();

        if ($duplicates->isEmpty()) {
            return $primary;
        }

        $duplicateIds = $duplicates->pluck('id')->all();

        Msg::query()
            ->whereIn('chat_list_contact_id', $duplicateIds)
            ->update(['chat_list_contact_id' => $primary->id]);

        $latestMessage = Msg::query()
            ->where('chat_list_contact_id', $primary->id)
            ->where('service', 'email')
            ->orderByRaw('COALESCE(received_at, sent_at, created_at) desc')
            ->orderByDesc('id')
            ->first();

        $primary->contact_id = $primary->contact_id ?: $duplicates->pluck('contact_id')->filter()->first();
        $primary->gmail_thread_id = $primary->gmail_thread_id ?: $duplicates->pluck('gmail_thread_id')->filter()->first();
        $primary->email_subject = $latestMessage?->email_subject ?: ($primary->email_subject ?: $duplicates->pluck('email_subject')->filter()->first());
        $primary->email_subject_normalized = $primary->email_subject_normalized ?: $duplicates->pluck('email_subject_normalized')->filter()->first();
        $primary->email_participants_key = $primary->email_participants_key ?: $duplicates->pluck('email_participants_key')->filter()->first();
        $primary->email_address = $primary->email_address ?: $duplicates->pluck('email_address')->filter()->first();
        $primary->last_msg_id = $latestMessage?->id;
        $primary->last_message_at = $latestMessage?->received_at ?: $latestMessage?->sent_at ?: $latestMessage?->created_at ?: $primary->last_message_at;
        $primary->unread_count = $this->emailUnreadCount($primary->id);
        $primary->unread = $primary->unread_count > 0;
        $primary->updated_at = $primary->last_message_at ?: $primary->updated_at;
        $primary->save();

        ChatListContact::query()
            ->whereIn('id', $duplicateIds)
            ->delete();

        return $primary->fresh() ?: $primary;
    }

    private function findOrCreateEmailContact(string $email, int $userId, string $displayName = ''): Contact
    {
        $contact = Contact::where('email', $email)->first();
        if ($contact) {
            return $contact;
        }

        $names = preg_split('/\s+/', trim($displayName)) ?: [];

        $contact = new Contact();
        $contact->first_name = (string) ($names[0] ?? $email);
        $contact->last_name = trim(implode(' ', array_slice($names, 1)));
        $contact->email = $email;
        $contact->creater_id = $userId;
        $contact->save();

        return $contact;
    }

    private function fetchMessage(Account $account, string $gmailMessageId): array
    {
        $response = $this->api($account)->get(self::API_BASE . '/messages/' . $gmailMessageId, [
            'format' => 'full',
        ]);

        if (! $response->successful()) {
            throw new RuntimeException('Unable to fetch Gmail message payload.');
        }

        return $response->json();
    }

    private function mailboxProfile(Account $account): array
    {
        $response = $this->api($account)->get(self::API_BASE . '/profile');

        if (! $response->successful()) {
            throw new RuntimeException('Unable to load Gmail mailbox profile.');
        }

        return $response->json();
    }

    private function refreshAccessToken(Account $account): string
    {
        $refreshToken = (string) ($account->oauth_refresh_token_encrypted ?? '');
        if ($refreshToken === '') {
            throw new RuntimeException('Google refresh token is missing.');
        }

        $response = Http::asForm()
            ->acceptJson()
            ->post(self::TOKEN_URL, [
                'client_id' => (string) config('services.google.client_id'),
                'client_secret' => (string) config('services.google.client_secret'),
                'refresh_token' => $refreshToken,
                'grant_type' => 'refresh_token',
            ]);

        if (! $response->successful()) {
            throw new RuntimeException('Unable to refresh Google access token.');
        }

        $tokenPayload = $response->json();
        $account->oauth_access_token_encrypted = (string) ($tokenPayload['access_token'] ?? '');
        if (! empty($tokenPayload['expires_in'])) {
            $account->oauth_token_expires_at = now()->addSeconds(max(((int) $tokenPayload['expires_in']) - 60, 60));
        }
        if (! empty($tokenPayload['scope'])) {
            $account->oauth_scope = (string) $tokenPayload['scope'];
        }
        $account->save();

        return (string) $account->oauth_access_token_encrypted;
    }

    private function api(Account $account): PendingRequest
    {
        return Http::withToken($this->validAccessToken($account))
            ->acceptJson()
            ->timeout((int) config('services.google.timeout', 30));
    }

    private function buildMimeMessage(
        string $fromEmail,
        string $fromName,
        array $to,
        array $cc,
        array $bcc,
        string $subject,
        string $textBody,
        string $htmlBody,
        ?string $inReplyTo = null,
        ?string $referencesHeader = null,
    ): string {
        $boundary = 'om_' . Str::random(24);
        $headers = [
            'From: ' . $this->formatMailbox($fromEmail, $fromName),
            'To: ' . implode(', ', array_map(fn ($email) => $this->formatMailbox((string) $email), $to)),
        ];

        if ($cc !== []) {
            $headers[] = 'Cc: ' . implode(', ', array_map(fn ($email) => $this->formatMailbox((string) $email), $cc));
        }

        if ($bcc !== []) {
            $headers[] = 'Bcc: ' . implode(', ', array_map(fn ($email) => $this->formatMailbox((string) $email), $bcc));
        }

        $headers[] = 'Subject: ' . $subject;
        $headers[] = 'MIME-Version: 1.0';
        $headers[] = 'Content-Type: multipart/alternative; boundary="' . $boundary . '"';

        if ($inReplyTo) {
            $headers[] = 'In-Reply-To: ' . $inReplyTo;
        }

        if ($referencesHeader) {
            $headers[] = 'References: ' . $referencesHeader;
        }

        $parts = [
            '--' . $boundary,
            'Content-Type: text/plain; charset=UTF-8',
            'Content-Transfer-Encoding: 7bit',
            '',
            $textBody,
            '',
            '--' . $boundary,
            'Content-Type: text/html; charset=UTF-8',
            'Content-Transfer-Encoding: 7bit',
            '',
            $htmlBody,
            '',
            '--' . $boundary . '--',
        ];

        return implode("\r\n", array_merge($headers, ['', implode("\r\n", $parts)]));
    }

    private function formatMailbox(string $email, string $name = ''): string
    {
        $email = trim($email);
        $name = trim($name);

        return $name !== ''
            ? sprintf('"%s" <%s>', addcslashes($name, '"'), $email)
            : $email;
    }

    private function headersMap(array $headers): array
    {
        $map = [];
        foreach ($headers as $header) {
            $name = strtolower((string) ($header['name'] ?? ''));
            if ($name !== '') {
                $map[$name] = (string) ($header['value'] ?? '');
            }
        }

        return $map;
    }

    private function extractBodies(array $payload): array
    {
        $plain = '';
        $html = '';

        $walk = function (array $part) use (&$walk, &$plain, &$html) {
            $mimeType = strtolower((string) ($part['mimeType'] ?? ''));
            $bodyData = (string) Arr::get($part, 'body.data', '');

            if ($mimeType === 'text/plain' && $bodyData !== '' && $plain === '') {
                $plain = $this->base64UrlDecode($bodyData);
            }

            if ($mimeType === 'text/html' && $bodyData !== '' && $html === '') {
                $html = $this->base64UrlDecode($bodyData);
            }

            foreach ((array) ($part['parts'] ?? []) as $childPart) {
                $walk($childPart);
            }
        };

        $walk($payload);

        if ($plain === '' && isset($payload['body']['data'])) {
            $plain = $this->base64UrlDecode((string) $payload['body']['data']);
        }

        return [trim($plain), trim($html)];
    }

    private function parseMailbox(string $headerValue): array
    {
        $headerValue = trim($headerValue);
        if ($headerValue === '') {
            return ['name' => '', 'email' => ''];
        }

        if (preg_match('/^(.*)<([^>]+)>$/', $headerValue, $matches)) {
            return [
                'name' => trim(trim($matches[1]), '" '),
                'email' => strtolower(trim($matches[2])),
            ];
        }

        return [
            'name' => '',
            'email' => strtolower(trim($headerValue, '" ')),
        ];
    }

    private function parseAddressList(string $headerValue): array
    {
        $addresses = [];
        foreach (preg_split('/,(?=(?:[^"]*"[^"]*")*[^"]*$)/', $headerValue) ?: [] as $part) {
            $mailbox = $this->parseMailbox($part);
            if ($mailbox['email'] !== '') {
                $addresses[] = $mailbox;
            }
        }

        return $addresses;
    }

    private function addressValues(array $addresses): array
    {
        return array_values(array_filter(array_map(
            static fn (array $mailbox) => strtolower((string) ($mailbox['email'] ?? '')),
            $addresses
        )));
    }

    private function resolvePrimaryContactMailbox(
        string $direction,
        array $sender,
        array $to,
        array $cc,
        array $bcc,
        string $accountEmail,
    ): array {
        if ($direction === 'incoming' && ! empty($sender['email']) && strtolower($sender['email']) !== $accountEmail) {
            return $sender;
        }

        foreach ([$to, $cc, $bcc] as $group) {
            foreach ($group as $mailbox) {
                if (strtolower((string) ($mailbox['email'] ?? '')) !== $accountEmail) {
                    return $mailbox;
                }
            }
        }

        return $sender;
    }

    private function participantsKey(array $participants, string $accountEmail): string
    {
        $participants = array_values(array_filter(array_unique(array_map(
            static fn ($email) => strtolower(trim((string) $email)),
            $participants
        )), static fn ($email) => $email !== '' && $email !== strtolower($accountEmail)));
        sort($participants);

        return implode('|', $participants);
    }

    private function normalizeSubject(string $subject): string
    {
        $normalized = strtolower(trim($subject));
        $normalized = preg_replace('/^((re|fw|fwd)\s*:\s*)+/i', '', $normalized) ?: $normalized;

        return trim($normalized);
    }

    private function trimHeaderValue(?string $value): string
    {
        return trim((string) $value, " \t\n\r\0\x0B<>");
    }

    private function emailUnreadCount(int $conversationId): int
    {
        return Msg::where('chat_list_contact_id', $conversationId)
            ->where('service', 'email')
            ->where('msg_mode', 'incoming')
            ->where('is_read', false)
            ->count();
    }

    private function base64UrlEncode(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }

    private function base64UrlDecode(string $value): string
    {
        $remainder = strlen($value) % 4;
        if ($remainder > 0) {
            $value .= str_repeat('=', 4 - $remainder);
        }

        return (string) base64_decode(strtr($value, '-_', '+/'));
    }

    private function guardConfigured(): void
    {
        if (! config('services.google.client_id') || ! config('services.google.client_secret') || ! config('services.google.redirect')) {
            throw new RuntimeException('Google OAuth is not configured.');
        }
    }
}
