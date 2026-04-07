<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private function indexExists(string $table, string $index): bool
    {
        $database = DB::getDatabaseName();

        return DB::table('information_schema.statistics')
            ->where('table_schema', $database)
            ->where('table_name', $table)
            ->where('index_name', $index)
            ->exists();
    }

    public function up(): void
    {
        Schema::table('contacts', function (Blueprint $table) {
            if (! Schema::hasColumn('contacts', 'instagram_user_id')) {
                $table->string('instagram_user_id')->nullable()->after('instagram_username');
            }
        });

        Schema::table('chat_list_contacts', function (Blueprint $table) {
            if (! Schema::hasColumn('chat_list_contacts', 'instagram_conversation_id')) {
                $table->string('instagram_conversation_id')->nullable()->after('channel');
            }
        });

        if (! $this->indexExists('contacts', 'contacts_creater_ig_user_idx')) {
            Schema::table('contacts', function (Blueprint $table) {
                $table->index(
                    ['creater_id', 'instagram_user_id'],
                    'contacts_creater_ig_user_idx'
                );
            });
        }

        if (! $this->indexExists('chat_list_contacts', 'chat_list_user_acct_ig_conv_idx')) {
            Schema::table('chat_list_contacts', function (Blueprint $table) {
                $table->index(
                    ['user_id', 'channel', 'account_id', 'instagram_conversation_id'],
                    'chat_list_user_acct_ig_conv_idx'
                );
            });
        }

        if (! $this->indexExists('msgs', 'msgs_service_acct_sid_idx')) {
            Schema::table('msgs', function (Blueprint $table) {
                $table->index(
                    ['service', 'account_id', 'service_id'],
                    'msgs_service_acct_sid_idx'
                );
            });
        }
    }

    public function down(): void
    {
        if ($this->indexExists('msgs', 'msgs_service_acct_sid_idx')) {
            Schema::table('msgs', function (Blueprint $table) {
                $table->dropIndex('msgs_service_acct_sid_idx');
            });
        }

        Schema::table('chat_list_contacts', function (Blueprint $table) {
            if (DB::table('information_schema.statistics')
                ->where('table_schema', DB::getDatabaseName())
                ->where('table_name', 'chat_list_contacts')
                ->where('index_name', 'chat_list_user_acct_ig_conv_idx')
                ->exists()) {
                $table->dropIndex('chat_list_user_acct_ig_conv_idx');
            }

            if (Schema::hasColumn('chat_list_contacts', 'instagram_conversation_id')) {
                $table->dropColumn('instagram_conversation_id');
            }
        });

        Schema::table('contacts', function (Blueprint $table) {
            if (DB::table('information_schema.statistics')
                ->where('table_schema', DB::getDatabaseName())
                ->where('table_name', 'contacts')
                ->where('index_name', 'contacts_creater_ig_user_idx')
                ->exists()) {
                $table->dropIndex('contacts_creater_ig_user_idx');
            }

            if (Schema::hasColumn('contacts', 'instagram_user_id')) {
                $table->dropColumn('instagram_user_id');
            }
        });
    }
};
