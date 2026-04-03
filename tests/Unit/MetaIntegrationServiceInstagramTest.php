<?php

namespace Tests\Unit;

use App\Models\Account;
use App\Services\MetaIntegrationService;
use Tests\TestCase;

class MetaIntegrationServiceInstagramTest extends TestCase
{
    public function test_instagram_setup_payload_uses_direct_login_shape_only(): void
    {
        $account = new Account();
        $account->service = 'instagram';
        $account->connection_model = 'instagram_login';
        $account->instagram_account_id = '17841400000000000';
        $account->instagram_app_scoped_user_id = '999000111';
        $account->instagram_username = 'ig_numeric_user';
        $account->instagram_name = 'IG Numeric User';
        $account->instagram_user_access_token_encrypted = 'token-value';
        $account->connection_status = 'connected';
        $account->setup_state = 'complete';
        $account->status = 'Active';
        $account->requires_reconnect = false;
        $account->connection_metadata = [
            'instagram_login' => [
                'account' => [
                    'app_scoped_user_id' => '999000111',
                    'instagram_account_id' => '17841400000000000',
                    'username' => 'ig_numeric_user',
                    'name' => 'IG Numeric User',
                ],
            ],
        ];

        $payload = app(MetaIntegrationService::class)->buildInstagramSetupPayload($account);

        $this->assertSame('instagram_login', $payload['connection_model']);
        $this->assertSame('connected', $payload['status']);
        $this->assertTrue($payload['setup_complete']);
        $this->assertNull($payload['selected_page']);
        $this->assertSame([], $payload['available_pages']);
        $this->assertSame('17841400000000000', $payload['selected_instagram_account']['id']);
        $this->assertSame('ig_numeric_user', $payload['selected_instagram_account']['username']);
    }

    public function test_instagram_accounts_do_not_expose_page_selection_candidates(): void
    {
        $account = new Account();
        $account->service = 'instagram';
        $account->connection_model = 'instagram_login';
        $account->fb_token = 'legacy-token-should-be-ignored';
        $account->fb_meta_data = base64_encode(serialize([
            '123' => [
                'id' => '123',
                'name' => 'Legacy Page',
                'token' => 'page-token',
            ],
        ]));

        $pages = app(MetaIntegrationService::class)->availablePagesForAccount($account, true);

        $this->assertSame([], $pages);
    }
}
