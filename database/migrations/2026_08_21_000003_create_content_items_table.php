<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('content_items', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['product', 'instruction', 'video', 'story']);
            $table->string('title');
            $table->string('summary', 500)->default('');
            $table->text('body');
            $table->string('media_url')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->index(['type', 'active', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('content_items');
    }
};
