<?php

namespace Tests\Unit;

use App\Http\Controllers\MsgController;
use App\Jobs\InitialInstagramHistorySyncJob;
use App\Models\Account;
use App\Models\ChatListContact;
use App\Models\Contact;
use App\Models\Msg;
use App\Services\MetaIntegrationService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use ReflectionMethod;
use Tests\TestCase;

class InstagramIdentityPersistenceTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Config::set('database.default', 'sqlite');
        Config::set('database.connections.sqlite.database', ':memory:');
        DB::purge('sqlite');
        DB::reconnect('sqlite');

        $this->createSchema();
        Model::unsetEventDispatcher();
    }

    public function test_webhook_creates_and_reuses_contact_by_instagram_user_id_without_username(): void
    {
        $account = $this->createInstagramAccount();
        $controller = app(MsgController::class);

        $controller->fbInstaMsgHandler(new Request([
            'account' => $account->id,
            'service' => 'instagram',
            'type' => 'incoming',
            'status' => 'Received',
            'messageId' => 'mid-1',
            'sender' => '2001',
            'recipient' => '17841400000000000',
            'message' => 'hello',
            'instagram_user_id' => '2001',
            'occurred_at' => '2026-04-03T10:00:00+00:00',
        ]));

        $controller->fbInstaMsgHandler(new Request([
            'account' => $account->id,
            'service' => 'instagram',
            'type' => 'incoming',
            'status' => 'Received',
            'messageId' => 'mid-2',
            'sender' => '2001',
            'recipient' => '17841400000000000',
            'message' => 'hello again',
            'instagram_user_id' => '2001',
            'occurred_at' => '2026-04-03T10:05:00+00:00',
        ]));

        $this->assertSame(1, Contact::count());
        $this->assertSame(2, Msg::count());
        $this->assertSame(1, ChatListContact::count());

        $contact = Contact::query()->first();
        $this->assertSame('2001', $contact->instagram_user_id);
        $this->assertNull($contact->instagram_username);
    }

    public function test_sync_and_webhook_converge_on_one_thread_and_dedupe_remote_message_id(): void
    {
        $account = $this->createInstagramAccount();

        Http::fake(function (\Illuminate\Http\Client\Request $request) {
            $url = $request->url();

            if (str_contains($url, '/17841400000000000/conversations')) {
                return Http::response([
                    'data' => [[
                        'id' => 'conv-1',
                        'participants' => [
                            'data' => [
                                ['id' => '2001', 'name' => 'IG User', 'username' => ''],
                                ['id' => '17841400000000000', 'name' => 'Business'],
                            ],
                        ],
                    ]],
                ], 200);
            }

            if (str_contains($url, '/conv-1')) {
                return Http::response([
                    'participants' => [
                        'data' => [
                            ['id' => '2001', 'name' => 'IG User', 'username' => ''],
                            ['id' => '17841400000000000', 'name' => 'Business'],
                        ],
                    ],
                    'messages' => [
                        'data' => [
                            ['id' => 'mid-1'],
                        ],
                    ],
                ], 200);
            }

            if (str_contains($url, '/mid-1')) {
                return Http::response([
                    'id' => 'mid-1',
                    'created_time' => '2026-04-03T10:00:00+00:00',
                    'from' => ['id' => '2001', 'name' => 'IG User'],
                    'to' => ['data' => [['id' => '17841400000000000']]],
                    'message' => 'from sync',
                ], 200);
            }

            throw new \RuntimeException('Unexpected URL: ' . $url);
        });

        app(MetaIntegrationService::class)->syncInstagramMessages($account->fresh(), false);

        $this->assertSame(1, Contact::count());
        $this->assertSame(1, ChatListContact::count());
        $this->assertSame(1, Msg::count());

        $thread = ChatListContact::query()->first();
        $this->assertSame('conv-1', $thread->instagram_conversation_id);

        $this->invokePrivateMethod(
            app(MetaIntegrationService::class),
            'storeMetaMessageEvent',
            [
                $account->fresh(),
                [
                    'sender' => ['id' => '2001'],
                    'recipient' => ['id' => '17841400000000000'],
                    'timestamp' => 1775211000000,
                    'message' => [
                        'mid' => 'mid-2',
                        'text' => 'from webhook',
                    ],
                ],
            ]
        );

        $this->assertSame(1, Contact::count());
        $this->assertSame(1, ChatListContact::count());
        $this->assertSame(2, Msg::count());
        $this->assertSame(
            [$thread->id],
            Msg::query()->pluck('chat_list_contact_id')->unique()->values()->all()
        );

        $this->invokePrivateMethod(
            app(MetaIntegrationService::class),
            'storeMetaMessageEvent',
            [
                $account->fresh(),
                [
                    'sender' => ['id' => '2001'],
                    'recipient' => ['id' => '17841400000000000'],
                    'timestamp' => 1775211000000,
                    'message' => [
                        'mid' => 'mid-2',
                        'text' => 'duplicate webhook',
                    ],
                ],
            ]
        );

        $this->assertSame(2, Msg::count());
    }

    public function test_manual_refresh_uses_stored_instagram_conversation_id_first(): void
    {
        $account = $this->createInstagramAccount();
        $contact = new Contact();
        $contact->forceFill([
            'first_name' => 'IG',
            'last_name' => 'User',
            'creater_id' => $account->user_id,
            'instagram_user_id' => '2001',
        ]);
        $contact->save();

        $thread = new ChatListContact();
        $thread->forceFill([
            'user_id' => $account->user_id,
            'contact_id' => $contact->id,
            'channel' => 'instagram',
            'account_id' => $account->id,
            'instagram_conversation_id' => 'conv-77',
            'unread' => false,
            'unread_count' => 0,
        ]);
        $thread->save();

        $requestedUrls = [];

        Http::fake(function (\Illuminate\Http\Client\Request $request) use (&$requestedUrls) {
            $requestedUrls[] = $request->url();

            if (str_contains($request->url(), '/conv-77')) {
                return Http::response([
                    'participants' => [
                        'data' => [
                            ['id' => '2001', 'name' => 'IG User'],
                            ['id' => '17841400000000000', 'name' => 'Business'],
                        ],
                    ],
                    'messages' => [
                        'data' => [
                            ['id' => 'mid-77'],
                        ],
                    ],
                ], 200);
            }

            if (str_contains($request->url(), '/mid-77')) {
                return Http::response([
                    'id' => 'mid-77',
                    'created_time' => '2026-04-03T11:00:00+00:00',
                    'from' => ['id' => '2001', 'name' => 'IG User'],
                    'to' => ['data' => [['id' => '17841400000000000']]],
                    'message' => 'manual refresh',
                ], 200);
            }

            throw new \RuntimeException('Unexpected URL: ' . $request->url());
        });

        app(MetaIntegrationService::class)->syncInstagramConversationMessages($account->fresh(), $contact->fresh(), 50);

        $this->assertSame(1, ChatListContact::count());
        $this->assertSame(1, Msg::count());
        $this->assertSame($thread->id, Msg::query()->first()->chat_list_contact_id);
        $this->assertFalse(collect($requestedUrls)->contains(fn ($url) => str_contains($url, '/17841400000000000/conversations')));
    }

    public function test_initial_import_is_not_dispatched_during_fresh_connection_persist(): void
    {
        Bus::fake();

        $profile = [
            'id' => '999000111',
            'user_id' => '17841400000000000',
            'username' => 'ig-user',
            'name' => 'IG User',
        ];

        $account = app(MetaIntegrationService::class)->persistInstagramLoginConnection(
            1,
            $profile,
            'token-value',
            ['expires_in' => 3600],
        );

        Bus::assertNotDispatched(InitialInstagramHistorySyncJob::class);

        $account->refresh();
        $this->assertNull($account->instagram_initial_sync_started_at);
        $this->assertNull($account->instagram_initial_sync_completed_at);
        $this->assertNull($account->instagram_initial_sync_error);
    }

    public function test_initial_import_paginates_conversations_and_messages_without_duplicates(): void
    {
        $account = $this->createInstagramAccount();

        Http::fake(function (\Illuminate\Http\Client\Request $request) {
            $url = $request->url();

            if (str_contains($url, '/mid-1')) {
                return Http::response([
                    'id' => 'mid-1',
                    'created_time' => '2026-04-03T10:01:00+00:00',
                    'from' => ['id' => '2001', 'username' => ''],
                    'to' => ['data' => [['id' => '17841400000000000']]],
                    'message' => 'first',
                ], 200);
            }

            if (str_contains($url, '/mid-2')) {
                return Http::response([
                    'id' => 'mid-2',
                    'created_time' => '2026-04-03T10:02:00+00:00',
                    'from' => ['id' => '2001', 'username' => ''],
                    'to' => ['data' => [['id' => '17841400000000000']]],
                    'message' => 'second',
                ], 200);
            }

            if (str_contains($url, '/mid-3')) {
                return Http::response([
                    'id' => 'mid-3',
                    'created_time' => '2026-04-03T10:11:00+00:00',
                    'from' => ['id' => '2002', 'username' => ''],
                    'to' => ['data' => [['id' => '17841400000000000']]],
                    'message' => 'third',
                ], 200);
            }

            if (str_contains($url, '/17841400000000000/conversations-page-2')) {
                return Http::response([
                    'data' => [
                        ['id' => 'conv-2', 'updated_time' => '2026-04-03T10:10:00+00:00'],
                    ],
                ], 200);
            }

            if (str_contains($url, '/17841400000000000/conversations')) {
                return Http::response([
                    'data' => [
                        ['id' => 'conv-1', 'updated_time' => '2026-04-03T10:00:00+00:00'],
                    ],
                    'paging' => [
                        'next' => 'https://graph.instagram.com/v23.0/17841400000000000/conversations-page-2',
                    ],
                ], 200);
            }

            if (str_contains($url, '/conv-1/messages-page-2')) {
                return Http::response([
                    'data' => [
                        ['id' => 'mid-2', 'created_time' => '2026-04-03T10:02:00+00:00'],
                    ],
                ], 200);
            }

            if (str_contains($url, '/conv-1/messages')) {
                return Http::response([
                    'data' => [
                        ['id' => 'mid-2', 'created_time' => '2026-04-03T10:02:00+00:00'],
                    ],
                ], 200);
            }

            if (str_contains($url, '/conv-2')) {
                return Http::response([
                    'messages' => [
                        'data' => [
                            ['id' => 'mid-3', 'created_time' => '2026-04-03T10:11:00+00:00'],
                        ],
                    ],
                ], 200);
            }

            if (preg_match('#/conv-1(?:\\?|$)#', $url) === 1) {
                return Http::response([
                    'messages' => [
                        'data' => [
                            ['id' => 'mid-1', 'created_time' => '2026-04-03T10:01:00+00:00'],
                        ],
                        'paging' => [
                            'next' => 'https://graph.instagram.com/v23.0/conv-1/messages-page-2',
                        ],
                    ],
                ], 200);
            }

            throw new \RuntimeException('Unexpected URL: ' . $url);
        });

        app(MetaIntegrationService::class)->runInitialInstagramHistorySync($account->fresh());
        app(MetaIntegrationService::class)->runInitialInstagramHistorySync($account->fresh());

        $this->assertSame(2, Contact::count());
        $this->assertSame(2, ChatListContact::query()->whereNotNull('instagram_conversation_id')->count());
        $this->assertSame(3, Msg::count());
        $this->assertSame('completed', $this->instagramSyncStatus($account->fresh()));
    }

    public function test_initial_import_continues_when_old_message_detail_fetch_fails(): void
    {
        $account = $this->createInstagramAccount();

        Http::fake(function (\Illuminate\Http\Client\Request $request) {
            $url = $request->url();

            if (str_contains($url, '/mid-old')) {
                return Http::response([
                    'error' => ['message' => 'Message has been deleted'],
                ], 400);
            }

            if (str_contains($url, '/mid-new')) {
                return Http::response([
                    'id' => 'mid-new',
                    'created_time' => '2026-04-03T10:01:00+00:00',
                    'from' => ['id' => '2001'],
                    'to' => ['data' => [['id' => '17841400000000000']]],
                    'message' => 'available',
                ], 200);
            }

            if (str_contains($url, '/17841400000000000/conversations')) {
                return Http::response([
                    'data' => [
                        ['id' => 'conv-1', 'updated_time' => '2026-04-03T10:00:00+00:00'],
                    ],
                ], 200);
            }

            if (preg_match('#/conv-1(?:\\?|$)#', $url) === 1) {
                return Http::response([
                    'messages' => [
                        'data' => [
                            ['id' => 'mid-old', 'created_time' => '2026-04-03T09:59:00+00:00'],
                            ['id' => 'mid-new', 'created_time' => '2026-04-03T10:01:00+00:00'],
                        ],
                    ],
                ], 200);
            }

            throw new \RuntimeException('Unexpected URL: ' . $url);
        });

        app(MetaIntegrationService::class)->runInitialInstagramHistorySync($account->fresh());

        $this->assertSame(1, Msg::count());
        $this->assertSame('mid-new', Msg::query()->first()->service_id);
        $this->assertSame('completed', $this->instagramSyncStatus($account->fresh()));
    }

    public function test_fetch_instagram_conversations_includes_platform_instagram(): void
    {
        $account = $this->createInstagramAccount();
        $captured = [];

        Http::fake(function (\Illuminate\Http\Client\Request $request) use (&$captured) {
            $captured[] = [
                'url' => $request->url(),
                'data' => $request->data(),
            ];

            return Http::response(['data' => []], 200);
        });

        app(MetaIntegrationService::class)->fetchInstagramConversations($account, 'token-value', 25);

        $this->assertSame('instagram', data_get($captured, '0.data.platform'));
    }

    public function test_fallback_conversation_lookup_by_user_id_includes_platform_instagram(): void
    {
        $account = $this->createInstagramAccount();
        $contact = new Contact();
        $contact->forceFill([
            'first_name' => 'IG',
            'last_name' => 'User',
            'creater_id' => $account->user_id,
            'instagram_user_id' => '2001',
        ]);
        $contact->save();

        $captured = [];

        Http::fake(function (\Illuminate\Http\Client\Request $request) use (&$captured) {
            $captured[] = [
                'url' => $request->url(),
                'data' => $request->data(),
            ];

            if (str_contains($request->url(), '/17841400000000000/conversations')) {
                return Http::response(['data' => []], 200);
            }

            throw new \RuntimeException('Unexpected URL: ' . $request->url());
        });

        app(MetaIntegrationService::class)->syncInstagramConversationMessages($account->fresh(), $contact->fresh(), 50);

        $conversationRequest = collect($captured)->first(fn ($request) => str_contains($request['url'], '/17841400000000000/conversations'));
        $this->assertNotNull($conversationRequest);
        $this->assertSame('instagram', data_get($conversationRequest, 'data.platform'));
        $this->assertSame('2001', data_get($conversationRequest, 'data.user_id'));
    }

    public function test_failed_initial_sync_can_retry_when_error_exists(): void
    {
        Bus::fake();

        $account = $this->createInstagramAccount();
        $account->instagram_initial_sync_started_at = now()->subMinute();
        $account->instagram_initial_sync_error = 'previous failure';
        $account->save();

        $result = app(MetaIntegrationService::class)->dispatchInitialInstagramHistorySync($account->fresh());

        $this->assertTrue($result);
        Bus::assertDispatched(InitialInstagramHistorySyncJob::class, function ($job) use ($account) {
            return $job->accountId === $account->id;
        });

        $account->refresh();
        $this->assertNull($account->instagram_initial_sync_error);
        $this->assertNotNull($account->instagram_initial_sync_started_at);
    }

    public function test_empty_message_details_do_not_prevent_thread_stub_import(): void
    {
        $account = $this->createInstagramAccount();

        Http::fake(function (\Illuminate\Http\Client\Request $request) {
            $url = $request->url();

            if (str_contains($url, '/mid-empty')) {
                return Http::response([], 200);
            }

            if (str_contains($url, '/17841400000000000/conversations')) {
                return Http::response([
                    'data' => [[
                        'id' => 'conv-empty',
                        'updated_time' => '2026-04-03T10:00:00+00:00',
                        'participants' => [
                            'data' => [
                                ['id' => '2001', 'name' => 'IG User', 'username' => ''],
                                ['id' => '17841400000000000', 'name' => 'Business'],
                            ],
                        ],
                    ]],
                ], 200);
            }

            if (preg_match('#/conv-empty(?:\\?|$)#', $url) === 1) {
                return Http::response([
                    'messages' => [
                        'data' => [
                            ['id' => 'mid-empty', 'created_time' => '2026-04-03T10:00:00+00:00'],
                        ],
                    ],
                ], 200);
            }

            throw new \RuntimeException('Unexpected URL: ' . $url);
        });

        app(MetaIntegrationService::class)->runInitialInstagramHistorySync($account->fresh());

        $thread = ChatListContact::query()->where('instagram_conversation_id', 'conv-empty')->first();
        $this->assertNotNull($thread);
        $this->assertNotNull($thread->contact_id);
        $this->assertSame(1, Contact::count());
        $this->assertSame(0, Msg::count());
        $this->assertSame('completed', $this->instagramSyncStatus($account->fresh()));
    }

    public function test_page_open_reconciliation_imports_new_remote_conversations_and_skips_unchanged(): void
    {
        $account = $this->createInstagramAccount();
        $existingContact = new Contact();
        $existingContact->forceFill([
            'first_name' => 'Existing',
            'last_name' => 'User',
            'creater_id' => $account->user_id,
            'instagram_user_id' => '2001',
        ]);
        $existingContact->save();

        $existingThread = new ChatListContact();
        $existingThread->forceFill([
            'user_id' => $account->user_id,
            'contact_id' => $existingContact->id,
            'channel' => 'instagram',
            'account_id' => $account->id,
            'instagram_conversation_id' => 'conv-1',
            'last_message_at' => '2026-04-03T10:00:00+00:00',
            'unread' => false,
            'unread_count' => 0,
        ]);
        $existingThread->save();

        $requestedUrls = [];

        Http::fake(function (\Illuminate\Http\Client\Request $request) use (&$requestedUrls) {
            $requestedUrls[] = $request->url();
            $url = $request->url();

            if (str_contains($url, '/17841400000000000/conversations')) {
                return Http::response([
                    'data' => [
                        [
                            'id' => 'conv-1',
                            'updated_time' => '2026-04-03T10:00:00+00:00',
                            'participants' => [
                                'data' => [
                                    ['id' => '2001', 'name' => 'Existing User', 'username' => ''],
                                    ['id' => '17841400000000000', 'name' => 'Business'],
                                ],
                            ],
                        ],
                        [
                            'id' => 'conv-2',
                            'updated_time' => '2026-04-03T11:00:00+00:00',
                            'participants' => [
                                'data' => [
                                    ['id' => '2002', 'name' => 'New User', 'username' => 'newuser'],
                                    ['id' => '17841400000000000', 'name' => 'Business'],
                                ],
                            ],
                        ],
                    ],
                ], 200);
            }

            if (str_contains($url, '/mid-2')) {
                return Http::response([
                    'id' => 'mid-2',
                    'created_time' => '2026-04-03T11:00:00+00:00',
                    'from' => ['id' => '2002', 'username' => 'newuser'],
                    'to' => ['data' => [['id' => '17841400000000000']]],
                    'message' => 'new conversation',
                ], 200);
            }

            if (preg_match('#/conv-2(?:\\?|$)#', $url) === 1) {
                return Http::response([
                    'messages' => [
                        'data' => [
                            ['id' => 'mid-2', 'created_time' => '2026-04-03T11:00:00+00:00'],
                        ],
                    ],
                ], 200);
            }

            if (preg_match('#/conv-1(?:\\?|$)#', $url) === 1) {
                throw new \RuntimeException('conv-1 should be skipped when unchanged');
            }

            throw new \RuntimeException('Unexpected URL: ' . $url);
        });

        app(MetaIntegrationService::class)->syncInstagramConversationIndex($account->fresh());

        $this->assertSame(2, ChatListContact::query()->whereNotNull('instagram_conversation_id')->count());
        $this->assertSame(1, Msg::count());
        $this->assertTrue(collect($requestedUrls)->contains(fn ($url) => str_contains($url, '/conv-2')));
        $this->assertFalse(collect($requestedUrls)->contains(fn ($url) => preg_match('#/conv-1(?:\\?|$)#', $url) === 1));
    }

    private function createInstagramAccount(): Account
    {
        $account = new Account();
        $account->forceFill([
            'user_id' => 1,
            'service' => 'instagram',
            'status' => 'Active',
            'connection_model' => 'instagram_login',
            'connection_status' => 'connected',
            'instagram_account_id' => '17841400000000000',
            'instagram_app_scoped_user_id' => '999000111',
            'instagram_user_access_token_encrypted' => 'token-value',
        ]);
        $account->save();

        return $account->fresh();
    }

    private function invokePrivateMethod(object $instance, string $method, array $arguments = []): mixed
    {
        $reflection = new ReflectionMethod($instance, $method);
        $reflection->setAccessible(true);

        return $reflection->invokeArgs($instance, $arguments);
    }

    private function instagramSyncStatus(Account $account): string
    {
        if ($account->instagram_initial_sync_completed_at) {
            return 'completed';
        }

        if ($account->instagram_initial_sync_error) {
            return 'error';
        }

        if ($account->instagram_initial_sync_started_at) {
            return 'running';
        }

        return 'idle';
    }

    private function createSchema(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
        });

        Schema::create('accounts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('service')->nullable();
            $table->string('service_engine')->nullable();
            $table->string('status')->nullable();
            $table->string('company_name')->nullable();
            $table->string('meta_provider')->nullable();
            $table->string('connection_model')->nullable();
            $table->string('connection_status')->nullable();
            $table->string('instagram_account_id')->nullable();
            $table->string('instagram_app_scoped_user_id')->nullable();
            $table->string('instagram_username')->nullable();
            $table->string('instagram_name')->nullable();
            $table->text('instagram_user_access_token_encrypted')->nullable();
            $table->timestamp('instagram_token_expires_at')->nullable();
            $table->timestamp('instagram_token_last_refreshed_at')->nullable();
            $table->text('instagram_refresh_metadata')->nullable();
            $table->text('instagram_meta_data')->nullable();
            $table->text('meta_page_id')->nullable();
            $table->text('meta_page_name')->nullable();
            $table->text('meta_page_token')->nullable();
            $table->text('fb_phone_number_id')->nullable();
            $table->text('fb_page_name')->nullable();
            $table->text('page_token')->nullable();
            $table->text('fb_token')->nullable();
            $table->text('fb_meta_data')->nullable();
            $table->text('fb_insta_app_id')->nullable();
            $table->text('insta_user_name')->nullable();
            $table->text('connection_error')->nullable();
            $table->text('setup_state')->nullable();
            $table->timestamp('instagram_initial_sync_started_at')->nullable();
            $table->timestamp('instagram_initial_sync_completed_at')->nullable();
            $table->text('instagram_initial_sync_error')->nullable();
            $table->timestamp('sync_last_at')->nullable();
            $table->text('connection_metadata')->nullable();
            $table->boolean('requires_reconnect')->default(false);
            $table->timestamps();
        });

        Schema::create('contacts', function (Blueprint $table) {
            $table->id();
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->unsignedBigInteger('creater_id')->nullable();
            $table->string('phone_number')->nullable();
            $table->string('facebook_username')->nullable();
            $table->string('instagram_username')->nullable();
            $table->string('instagram_user_id')->nullable();
            $table->string('email')->nullable();
            $table->timestamps();
        });

        Schema::create('chat_list_contacts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('contact_id')->nullable();
            $table->string('channel')->nullable();
            $table->boolean('is_archive')->nullable();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->boolean('unread')->nullable();
            $table->unsignedBigInteger('account_id')->nullable();
            $table->unsignedBigInteger('last_msg_id')->nullable();
            $table->unsignedInteger('unread_count')->default(0);
            $table->timestamp('last_message_at')->nullable();
            $table->string('instagram_conversation_id')->nullable();
            $table->timestamps();
        });

        Schema::create('msgs', function (Blueprint $table) {
            $table->id();
            $table->text('service_id');
            $table->string('service');
            $table->unsignedBigInteger('account_id')->nullable();
            $table->text('message')->nullable();
            $table->unsignedBigInteger('msgable_id')->nullable();
            $table->string('msgable_type')->nullable();
            $table->string('msg_mode')->nullable();
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->string('template_id')->nullable();
            $table->string('status')->nullable();
            $table->boolean('is_delivered')->default(false);
            $table->boolean('is_read')->default(false);
            $table->unsignedBigInteger('chat_list_contact_id')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('received_at')->nullable();
            $table->string('msg_type')->nullable();
            $table->text('file_path')->nullable();
            $table->text('error_response')->nullable();
            $table->timestamps();
        });

        Schema::create('tags', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
        });

        Schema::create('taggables', function (Blueprint $table) {
            $table->unsignedBigInteger('tag_id')->nullable();
            $table->unsignedBigInteger('taggable_id')->nullable();
            $table->string('taggable_type')->nullable();
        });

        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
        });

        Schema::create('categorables', function (Blueprint $table) {
            $table->unsignedBigInteger('category_id')->nullable();
            $table->unsignedBigInteger('categorable_id')->nullable();
            $table->string('categorable_type')->nullable();
        });

        Schema::create('phones', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('phoneable_id')->nullable();
            $table->string('phoneable_type')->nullable();
            $table->string('phone_number')->nullable();
            $table->timestamps();
        });

        Schema::create('emails', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('emailable_id')->nullable();
            $table->string('emailable_type')->nullable();
            $table->string('email')->nullable();
            $table->timestamps();
        });

        DB::table('users')->insert(['id' => 1]);
    }
}
