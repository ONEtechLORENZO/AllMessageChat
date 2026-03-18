<?php

namespace Tests\Unit;

use App\Models\Campaign;
use App\Models\User;
use App\Support\Assistant\AssistantActionAuthorizer;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class AssistantActionAuthorizerTest extends TestCase
{
    public function test_it_normalizes_permission_failure_for_missing_user(): void
    {
        $result = app(AssistantActionAuthorizer::class)->authorize(null, 'update_record', 'campaigns');

        $this->assertFalse($result['ok']);
        $this->assertSame('permission_denied', $result['error_code']);
    }

    public function test_it_normalizes_workspace_ownership_failure(): void
    {
        $user = (new User())->forceFill(['id' => 10]);
        Cache::put('selected_company_10', 99);
        $campaign = (new Campaign())->forceFill(['id' => 1, 'company_id' => 77]);

        $result = app(AssistantActionAuthorizer::class)->authorize($user, 'delete_record', 'campaigns', $campaign);

        $this->assertFalse($result['ok']);
        $this->assertSame('ownership_failed', $result['error_code']);
    }
}
