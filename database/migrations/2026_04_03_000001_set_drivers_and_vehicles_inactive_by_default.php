<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            $table->boolean('is_active')->default(false)->change();
        });
        Schema::table('vehicles', function (Blueprint $table) {
            $table->boolean('is_active')->default(false)->change();
        });

        DB::table('drivers')->update(['is_active' => false]);
        DB::table('vehicles')->update(['is_active' => false]);
    }

    public function down(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            $table->boolean('is_active')->default(true)->change();
        });
        Schema::table('vehicles', function (Blueprint $table) {
            $table->boolean('is_active')->default(true)->change();
        });
    }
};
