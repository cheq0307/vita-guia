<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscription_plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->decimal('price', 10, 2)->default(0);
            $table->unsignedInteger('client_limit');
            $table->unsignedInteger('link_duration_hours');
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('subscription_plan_id')
                ->nullable()
                ->after('role')
                ->constrained()
                ->nullOnDelete();
        });

        $planId = DB::table('subscription_plans')->insertGetId([
            'name' => 'Inicial',
            'price' => 0,
            'client_limit' => 25,
            'link_duration_hours' => 168,
            'active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('users')
            ->where('role', 'advisor')
            ->update(['subscription_plan_id' => $planId]);
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('subscription_plan_id');
        });

        Schema::dropIfExists('subscription_plans');
    }
};
