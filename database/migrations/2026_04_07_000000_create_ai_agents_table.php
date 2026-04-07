<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_agents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('key', 31)->unique();
            $table->string('name', 120);
            $table->string('tone_preset_key', 50);
            $table->longText('system_instructions')->nullable();
            $table->string('model', 100);
            $table->string('locale', 10)->default('en');
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->index(['user_id', 'name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_agents');
    }
};
