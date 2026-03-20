<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('warehouse_items', function (Blueprint $table) {
            $table->unsignedBigInteger('id')->primary();
            $table->foreignId('product_template_id')->constrained('product_templates')->cascadeOnDelete();
            $table->string('serial_number', 10)->nullable()->unique();
            $table->foreignId('country_id')->nullable()->constrained('countries')->nullOnDelete();
            $table->date('production_date')->nullable();
            $table->date('purchase_date');
            $table->date('registered_at');
            $table->unsignedInteger('quantity')->default(1);
            $table->foreignId('recipient_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('department_id')->nullable()->constrained('department')->nullOnDelete();
            $table->date('delivery_date')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('warehouse_items');
    }
};
