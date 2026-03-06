<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('vehicle_requests', function (Blueprint $table) {
            // اگر نام foreign key را نمی‌دانی، لاراول به صورت پیش‌فرض این‌طوری می‌سازد:
            $table->dropForeign(['vehicle_id']);
            $table->dropForeign(['driver_id']);
        });
    }

    public function down(): void
    {
        Schema::table('vehicle_requests', function (Blueprint $table) {
            $table->foreign('vehicle_id')->references('id')->on('vehicles')->onDelete('cascade');
            $table->foreign('driver_id')->references('id')->on('drivers')->onDelete('cascade');
        });
    }
};
