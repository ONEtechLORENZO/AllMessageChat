<?php

namespace Tests\Unit;

use App\Models\Account;
use App\Models\User;
use App\Support\Assistant\TemplateAccountResolver;
use Illuminate\Support\Collection;
use Tests\TestCase;

class TemplateAccountResolverTest extends TestCase
{
    public function test_it_resolves_single_owned_account_automatically(): void
    {
        $user = (new User())->forceFill(['id' => 10]);
        $accounts = new Collection([
            (new Account())->forceFill(['id' => 5, 'company_name' => 'AESSEFIN', 'service' => 'whatsapp', 'user_id' => 10]),
        ]);

        $result = app(TemplateAccountResolver::class)->resolve($user, [], $accounts);

        $this->assertTrue($result['ok']);
        $this->assertSame('owned', $result['ownership_status']);
        $this->assertSame(5, $result['account']->id);
    }

    public function test_it_returns_missing_account_when_multiple_accounts_are_available(): void
    {
        $user = (new User())->forceFill(['id' => 10]);
        $accounts = new Collection([
            (new Account())->forceFill(['id' => 5, 'company_name' => 'AESSEFIN', 'service' => 'whatsapp', 'user_id' => 10]),
            (new Account())->forceFill(['id' => 6, 'company_name' => 'ACME', 'service' => 'whatsapp', 'user_id' => 10]),
        ]);

        $result = app(TemplateAccountResolver::class)->resolve($user, [], $accounts);

        $this->assertFalse($result['ok']);
        $this->assertSame('missing_fields', $result['error_code']);
        $this->assertContains('account_id', $result['missing_fields']);
    }

    public function test_it_rejects_non_owned_accounts(): void
    {
        $user = (new User())->forceFill(['id' => 10]);
        $accounts = new Collection([
            (new Account())->forceFill(['id' => 5, 'company_name' => 'AESSEFIN', 'service' => 'whatsapp', 'user_id' => 12]),
        ]);

        $result = app(TemplateAccountResolver::class)->resolve($user, ['account_id' => 5], $accounts);

        $this->assertFalse($result['ok']);
        $this->assertSame('ownership_failed', $result['error_code']);
    }
}
