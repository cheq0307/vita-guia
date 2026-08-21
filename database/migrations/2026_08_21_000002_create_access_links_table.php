<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('access_links', function (Blueprint $table) {
            $table->id();
            $table->foreignId('advisor_id')->constrained('users')->cascadeOnDelete();
            $table->string('token_hash', 64)->unique();
            $table->text('token');
            $table->string('recipient_name');
            $table->string('recipient_contact')->default('');
            $table->dateTime('expires_at');
            $table->unsignedInteger('max_opens')->nullable();
            $table->unsignedInteger('open_count')->default(0);
            $table->dateTime('first_opened_at')->nullable();
            $table->dateTime('last_opened_at')->nullable();
            $table->boolean('revoked')->default(false);
            $table->timestamps();
            $table->index(['advisor_id', 'created_at']);
            $table->index('expires_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('access_links');
    }
};
