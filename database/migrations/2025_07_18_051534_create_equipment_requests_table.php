<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void {
        Schema::create('equipment_requests', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('approver_id')->nullable()->constrained('users')->nullOnDelete();

            $table->json('items'); // لیست تجهیزات درخواست‌شده (مثلاً ["monitor", "keyboard"])

            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('comment')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('equipment_requests');
    }
};
