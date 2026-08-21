<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('content_assets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('content_item_id')->constrained()->cascadeOnDelete();
            $table->enum('kind', ['image', 'video', 'pdf', 'youtube', 'link']);
            $table->string('storage_path')->nullable();
            $table->string('external_url', 1000)->nullable();
            $table->string('original_name')->default('');
            $table->string('mime_type')->default('');
            $table->unsignedBigInteger('size_bytes')->default(0);
            $table->longText('transcript')->nullable();
            $table->longText('extracted_text')->nullable();
            $table->json('extracted_pages')->nullable();
            $table->enum('extraction_status', ['not_needed', 'pending', 'ready', 'partial', 'failed'])->default('not_needed');
            $table->unsignedInteger('page_count')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
            $table->index(['content_item_id', 'kind', 'sort_order']);
        });

        Schema::create('content_chunks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('content_item_id')->constrained()->cascadeOnDelete();
            $table->foreignId('content_asset_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('source_label');
            $table->unsignedInteger('page_number')->nullable();
            $table->unsignedInteger('chunk_index')->default(0);
            $table->text('text');
            $table->timestamps();
            $table->index(['content_item_id', 'content_asset_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('content_chunks');
        Schema::dropIfExists('content_assets');
    }
};
