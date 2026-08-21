<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('client_access_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('access_link_id')->constrained()->cascadeOnDelete();
            $table->string('token_hash', 64)->unique();
            $table->text('token');
            $table->string('client_id_hash', 64);
            $table->enum('platform', ['android', 'ios'])->default('android');
            $table->string('app_version', 40)->nullable();
            $table->dateTime('last_used_at')->nullable();
            $table->timestamps();

            $table->unique(['access_link_id', 'client_id_hash']);
            $table->index(['platform', 'last_used_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('client_access_sessions');
    }
};
