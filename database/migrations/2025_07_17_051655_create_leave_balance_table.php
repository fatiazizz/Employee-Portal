<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void {
        Schema::create('leave_balances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->integer('year'); // سال شمسی یا میلادی
            $table->integer('total_hours')->default(160); // مقدار مجاز مرخصی
            $table->integer('used_hours')->default(0);    // مقدار استفاده‌شده
            $table->timestamps();

            $table->unique(['user_id', 'year']); // هر کاربر فقط یک رکورد در هر سال
        });
    }

    public function down(): void {
        Schema::dropIfExists('leave_balances');
    }
};
