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
            $table->enum('topic', ['health', 'business', 'mixed'])->default('health');
            $table->string('title');
            $table->string('summary', 500)->default('');
            $table->text('body');
            $table->string('media_url')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('active')->default(true);
            $table->foreignId('author_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('reviewer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('status', ['draft', 'review', 'published', 'rejected'])->default('published');
            $table->text('review_notes')->nullable();
            $table->dateTime('submitted_at')->nullable();
            $table->dateTime('reviewed_at')->nullable();
            $table->timestamps();
            $table->index(['type', 'active', 'status', 'sort_order']);
            $table->index(['author_id', 'status']);
            $table->index(['topic', 'status', 'active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('content_items');
    }
};
