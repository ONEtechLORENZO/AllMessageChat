<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('chat_list_contacts', function (Blueprint $table) {
            $table->index(
                ['user_id', 'channel', 'account_id'],
                'chat_list_contacts_user_channel_account_index'
            );
            $table->index(
                ['user_id', 'channel', 'unread_count'],
                'chat_list_contacts_user_channel_unread_index'
            );
        });

        Schema::table('msgs', function (Blueprint $table) {
            $table->index(
                ['service', 'account_id', 'msgable_type', 'msgable_id', 'id'],
                'msgs_service_account_msgable_id_index'
            );
            $table->index(
                ['service', 'account_id', 'msgable_type', 'msgable_id', 'msg_mode', 'is_read'],
                'msgs_service_account_msgable_read_index'
            );
        });
    }

    public function down(): void
    {
        Schema::table('msgs', function (Blueprint $table) {
            $table->dropIndex('msgs_service_account_msgable_id_index');
            $table->dropIndex('msgs_service_account_msgable_read_index');
        });

        Schema::table('chat_list_contacts', function (Blueprint $table) {
            $table->dropIndex('chat_list_contacts_user_channel_account_index');
            $table->dropIndex('chat_list_contacts_user_channel_unread_index');
        });
    }
};
