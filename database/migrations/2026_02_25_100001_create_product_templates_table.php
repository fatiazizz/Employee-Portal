<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('category');
            $table->enum('type', ['consumable', 'capital']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_templates');
    }
};
