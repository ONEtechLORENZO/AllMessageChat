<?php

namespace App\Console\Commands;

use App\Models\Contact;
use Illuminate\Console\Command;

class BackfillInstagramUserIds extends Command
{
    protected $signature = 'command:BackfillInstagramUserIds {--dry-run}';

    protected $description = 'Backfill contacts.instagram_user_id from numeric instagram_username values.';

    public function handle(): int
    {
        $migrated = 0;
        $skipped = 0;
        $dryRun = (bool) $this->option('dry-run');

        Contact::query()
            ->whereNull('instagram_user_id')
            ->whereNotNull('instagram_username')
            ->orderBy('id')
            ->chunkById(200, function ($contacts) use (&$migrated, &$skipped, $dryRun) {
                foreach ($contacts as $contact) {
                    $username = trim((string) $contact->instagram_username);

                    if ($username === '' || ! preg_match('/^\d+$/', $username)) {
                        $skipped++;
                        continue;
                    }

                    $migrated++;

                    if ($dryRun) {
                        continue;
                    }

                    $contact->instagram_user_id = $username;
                    $contact->save();
                }
            });

        $this->info(sprintf(
            'Instagram user id backfill complete. Migrated: %d, skipped: %d%s',
            $migrated,
            $skipped,
            $dryRun ? ' (dry run)' : ''
        ));

        return self::SUCCESS;
    }
}
