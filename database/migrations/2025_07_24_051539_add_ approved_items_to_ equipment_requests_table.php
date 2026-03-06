<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void {
        Schema::table('equipment_requests', function (Blueprint $table) {
            $table->json('approved_items')->after('items')->nullable();
        });
    }

    public function down(): void {
        Schema::table('equipment_requests', function (Blueprint $table) {
            $table->dropColumn('approved_items');
        });
    }
};