<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY role ENUM('admin', 'advisor', 'professional') NOT NULL DEFAULT 'advisor'");
        }

        if (! Schema::hasColumn('content_items', 'author_id')) {
            Schema::table('content_items', function (Blueprint $table) {
                $table->foreignId('author_id')->nullable()->after('active')->constrained('users')->nullOnDelete();
                $table->foreignId('reviewer_id')->nullable()->after('author_id')->constrained('users')->nullOnDelete();
                $table->enum('status', ['draft', 'review', 'published', 'rejected'])->default('published')->after('reviewer_id');
                $table->text('review_notes')->nullable()->after('status');
                $table->dateTime('submitted_at')->nullable()->after('review_notes');
                $table->dateTime('reviewed_at')->nullable()->after('submitted_at');
                $table->index(['author_id', 'status']);
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('content_items', 'author_id')) {
            Schema::table('content_items', function (Blueprint $table) {
                $table->dropForeign(['author_id']);
                $table->dropForeign(['reviewer_id']);
                $table->dropIndex(['author_id', 'status']);
                $table->dropColumn(['author_id', 'reviewer_id', 'status', 'review_notes', 'submitted_at', 'reviewed_at']);
            });
        }

        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY role ENUM('admin', 'advisor') NOT NULL DEFAULT 'advisor'");
        }
    }
};
