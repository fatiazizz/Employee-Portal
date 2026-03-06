<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('equipment_balances', function (Blueprint $table) {
            $table->id();
            $table->string('type')->unique(); // مثال: monitor, mouse, ...
            $table->integer('quantity')->default(0); // تعداد موجودی فعلی
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('equipment_balances');
    }
};
