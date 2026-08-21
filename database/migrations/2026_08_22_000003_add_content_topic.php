<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('content_items', 'topic')) {
            Schema::table('content_items', function (Blueprint $table) {
                $table->enum('topic', ['health', 'business', 'mixed'])->default('health')->after('type');
                $table->index(['topic', 'status', 'active']);
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('content_items', 'topic')) {
            Schema::table('content_items', function (Blueprint $table) {
                $table->dropIndex(['topic', 'status', 'active']);
                $table->dropColumn('topic');
            });
        }
    }
};
