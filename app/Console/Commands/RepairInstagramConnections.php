<?php

namespace App\Console\Commands;

use App\Models\Account;
use Illuminate\Console\Command;

class RepairInstagramConnections extends Command
{
    protected $signature = 'command:RepairInstagramConnections {--account_id=}';

    protected $description = 'Normalize Instagram accounts into legacy page-linked or Instagram Login connection models.';

    public function handle(): int
    {
        $query = Account::query()->where('service', 'instagram');

        if ($this->option('account_id')) {
            $query->where('id', (int) $this->option('account_id'));
        }

        $accounts = $query->get();
        $updated = 0;

        foreach ($accounts as $account) {
            $isInstagramLogin = (string) ($account->connection_model ?? '') === 'instagram_login';

            if ($isInstagramLogin) {
                $account->meta_provider = 'instagram';
                $account->requires_reconnect = false;

                if (
                    ! empty($account->instagram_account_id)
                    && ! empty($account->instagram_user_access_token_encrypted)
                ) {
                    $account->connection_status = 'connected';
                    $account->setup_state = 'complete';
                    $account->status = 'Active';
                    $account->connection_error = null;
                } else {
                    $account->connection_status = 'error';
                    $account->setup_state = 'incomplete';
                    $account->status = 'Draft';
                    $account->connection_error = 'Reconnect Instagram to finish upgrading this channel.';
                }

                $account->save();
                $updated++;

                continue;
            }

            $account->meta_provider = 'instagram';
            $account->connection_model = 'legacy_page_linked';
            $account->requires_reconnect = true;
            $account->instagram_user_access_token_encrypted = null;
            $account->instagram_token_expires_at = null;
            $account->instagram_token_last_refreshed_at = null;
            $account->instagram_refresh_metadata = null;
            $account->instagram_app_scoped_user_id = null;

            if (! empty($account->instagram_account_id)) {
                $account->connection_status = 'connected';
                $account->setup_state = 'complete';
                $account->status = 'Active';
                $account->connection_error = null;
            } else {
                $account->connection_status = 'needs_instagram';
                $account->setup_state = 'incomplete';
                $account->status = 'Draft';
                $account->connection_error = 'Legacy page-linked Instagram connection. Reconnect to upgrade.';
            }

            $account->save();
            $updated++;
        }

        $this->info(sprintf('Instagram connections normalized: %d', $updated));

        return self::SUCCESS;
    }
}
