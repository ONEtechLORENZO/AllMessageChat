<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('accounts', function (Blueprint $table) {
            $table->string('meta_provider')->nullable()->after('service_engine');
            $table->string('meta_page_id')->nullable()->after('meta_provider');
            $table->string('meta_page_name')->nullable()->after('meta_page_id');
            $table->text('meta_page_token')->nullable()->after('meta_page_name');
            $table->string('instagram_account_id')->nullable()->after('meta_page_token');
            $table->string('instagram_username')->nullable()->after('instagram_account_id');
            $table->string('instagram_name')->nullable()->after('instagram_username');
            $table->json('instagram_meta_data')->nullable()->after('instagram_name');
            $table->string('connection_status')->nullable()->after('instagram_meta_data');
            $table->string('setup_state')->nullable()->after('connection_status');
            $table->text('connection_error')->nullable()->after('setup_state');
        });

        DB::table('accounts')
            ->where('service', 'instagram')
            ->orderBy('id')
            ->chunkById(100, function ($accounts) {
                foreach ($accounts as $account) {
                    $pages = $this->extractPages($account->fb_meta_data);
                    $selectedPageId = (string) ($account->fb_phone_number_id ?? '');
                    $selectedPage = ($selectedPageId !== '' && isset($pages[$selectedPageId]))
                        ? $pages[$selectedPageId]
                        : null;
                    $linkedInstagram = $this->extractLinkedInstagram($selectedPage);

                    $metaPageId = $selectedPageId !== '' ? $selectedPageId : null;
                    $metaPageName = $selectedPage['name'] ?? ($account->fb_page_name ?: null);
                    $metaPageToken = $selectedPage['token'] ?? ($account->page_token ?: null);

                    $hasOAuth = ! empty($account->fb_token)
                        || ! empty($account->fb_meta_data)
                        || ! empty($account->connection_metadata);

                    $connectionStatus = 'incomplete';
                    $setupState = 'incomplete';
                    $connectionError = null;
                    $accountStatus = 'Draft';

                    $instagramAccountId = null;
                    $instagramUsername = null;
                    $instagramName = null;

                    if ($metaPageId) {
                        if ($linkedInstagram) {
                            $instagramAccountId = (string) ($linkedInstagram['id'] ?? $account->fb_insta_app_id ?: '');
                            $instagramUsername = (string) ($linkedInstagram['username'] ?? $account->insta_user_name ?: '');
                            $instagramName = (string) ($linkedInstagram['name'] ?? '');
                            $connectionStatus = 'connected';
                            $setupState = 'connected';
                            $accountStatus = 'Active';
                        } else {
                            $connectionStatus = 'needs_instagram';
                            $setupState = 'needs_instagram';
                            $connectionError = 'This Facebook Page does not have a linked Instagram Business account.';
                        }
                    } elseif ($hasOAuth) {
                        $connectionStatus = 'needs_page';
                        $setupState = 'needs_page';
                    }

                    $instagramMeta = [
                        'pages' => array_values(array_map(function (array $page) {
                            return array_filter([
                                'id' => (string) ($page['id'] ?? ''),
                                'name' => (string) ($page['name'] ?? ''),
                                'instagram' => $page['instagram'] ?? null,
                            ], static fn ($value) => $value !== null && $value !== '');
                        }, $pages)),
                        'selected_page' => $metaPageId ? [
                            'id' => $metaPageId,
                            'name' => $metaPageName,
                        ] : null,
                        'selected_instagram_account' => $instagramAccountId ? array_filter([
                            'id' => $instagramAccountId,
                            'username' => $instagramUsername,
                            'name' => $instagramName,
                        ], static fn ($value) => $value !== null && $value !== '') : null,
                    ];

                    DB::table('accounts')
                        ->where('id', $account->id)
                        ->update([
                            'meta_provider' => 'instagram',
                            'meta_page_id' => $metaPageId,
                            'meta_page_name' => $metaPageName,
                            'meta_page_token' => $metaPageToken,
                            'instagram_account_id' => $instagramAccountId,
                            'instagram_username' => $instagramUsername,
                            'instagram_name' => $instagramName,
                            'instagram_meta_data' => json_encode($instagramMeta),
                            'connection_status' => $connectionStatus,
                            'setup_state' => $setupState,
                            'connection_error' => $connectionError,
                            'status' => $accountStatus,
                        ]);
                }
            });
    }

    public function down(): void
    {
        Schema::table('accounts', function (Blueprint $table) {
            $table->dropColumn([
                'meta_provider',
                'meta_page_id',
                'meta_page_name',
                'meta_page_token',
                'instagram_account_id',
                'instagram_username',
                'instagram_name',
                'instagram_meta_data',
                'connection_status',
                'setup_state',
                'connection_error',
            ]);
        });
    }

    private function extractPages(?string $encodedPages): array
    {
        if (! $encodedPages) {
            return [];
        }

        $decoded = base64_decode($encodedPages, true);
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
                'instagram' => isset($page['instagram']) && is_array($page['instagram'])
                    ? $page['instagram']
                    : null,
            ], static fn ($value) => $value !== null && $value !== '');
        }

        return $normalized;
    }

    private function extractLinkedInstagram(?array $page): ?array
    {
        if (! $page || empty($page['instagram']) || ! is_array($page['instagram'])) {
            return null;
        }

        return array_filter([
            'id' => (string) ($page['instagram']['id'] ?? ''),
            'username' => (string) ($page['instagram']['username'] ?? ''),
            'name' => (string) ($page['instagram']['name'] ?? ''),
        ], static fn ($value) => $value !== null && $value !== '');
    }
};
