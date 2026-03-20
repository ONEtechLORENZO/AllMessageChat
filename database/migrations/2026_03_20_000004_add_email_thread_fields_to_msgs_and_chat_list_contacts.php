<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('msgs', function (Blueprint $table) {
            $table->foreignId('chat_list_contact_id')->nullable()->after('account_id')->constrained('chat_list_contacts')->nullOnDelete();
            $table->string('sender_email')->nullable()->after('email_subject');
            $table->json('recipient_to')->nullable()->after('sender_email');
            $table->json('recipient_cc')->nullable()->after('recipient_to');
            $table->json('recipient_bcc')->nullable()->after('recipient_cc');
            $table->longText('body_text')->nullable()->after('recipient_bcc');
            $table->longText('body_html')->nullable()->after('body_text');
            $table->string('gmail_message_id')->nullable()->after('body_html');
            $table->string('gmail_thread_id')->nullable()->after('gmail_message_id');
            $table->string('internet_message_id')->nullable()->after('gmail_thread_id');
            $table->string('in_reply_to')->nullable()->after('internet_message_id');
            $table->longText('references_header')->nullable()->after('in_reply_to');
            $table->timestamp('sent_at')->nullable()->after('references_header');
            $table->timestamp('received_at')->nullable()->after('sent_at');

            $table->index(['account_id', 'gmail_thread_id'], 'msgs_account_thread_index');
            $table->index(['account_id', 'gmail_message_id'], 'msgs_account_gmail_message_index');
            $table->index(['chat_list_contact_id', 'created_at'], 'msgs_chat_list_contact_created_at_index');
        });

        Schema::table('chat_list_contacts', function (Blueprint $table) {
            $table->foreignId('account_id')->nullable()->after('contact_id')->constrained('accounts')->nullOnDelete();
            $table->string('gmail_thread_id')->nullable()->after('channel');
            $table->string('email_subject')->nullable()->after('gmail_thread_id');
            $table->string('email_subject_normalized')->nullable()->after('email_subject');
            $table->string('email_participants_key')->nullable()->after('email_subject_normalized');
            $table->string('email_address')->nullable()->after('email_participants_key');
            $table->foreignId('last_msg_id')->nullable()->after('email_address')->constrained('msgs')->nullOnDelete();
            $table->integer('unread_count')->default(0)->after('unread');
            $table->timestamp('last_message_at')->nullable()->after('unread_count');

            $table->index(['user_id', 'channel', 'gmail_thread_id'], 'chat_list_contacts_user_channel_thread_index');
            $table->index(['user_id', 'channel', 'last_message_at'], 'chat_list_contacts_user_channel_last_message_index');
        });
    }

    public function down(): void
    {
        Schema::table('chat_list_contacts', function (Blueprint $table) {
            $table->dropIndex('chat_list_contacts_user_channel_thread_index');
            $table->dropIndex('chat_list_contacts_user_channel_last_message_index');
            $table->dropConstrainedForeignId('last_msg_id');
            $table->dropConstrainedForeignId('account_id');
            $table->dropColumn([
                'gmail_thread_id',
                'email_subject',
                'email_subject_normalized',
                'email_participants_key',
                'email_address',
                'unread_count',
                'last_message_at',
            ]);
        });

        Schema::table('msgs', function (Blueprint $table) {
            $table->dropIndex('msgs_account_thread_index');
            $table->dropIndex('msgs_account_gmail_message_index');
            $table->dropIndex('msgs_chat_list_contact_created_at_index');
            $table->dropConstrainedForeignId('chat_list_contact_id');
            $table->dropColumn([
                'sender_email',
                'recipient_to',
                'recipient_cc',
                'recipient_bcc',
                'body_text',
                'body_html',
                'gmail_message_id',
                'gmail_thread_id',
                'internet_message_id',
                'in_reply_to',
                'references_header',
                'sent_at',
                'received_at',
            ]);
        });
    }
};
