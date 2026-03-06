<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void {
        Schema::create('vehicle_requests', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('approver_id')->nullable()->constrained('users')->nullOnDelete();

            $table->foreignId('vehicle_id')->constrained()->onDelete('cascade'); // خودروی انتخابی
            $table->foreignId('driver_id')->nullable()->constrained('users')->nullOnDelete(); // راننده اختصاصی (در صورت وجود)

            $table->timestamp('start_at');
            $table->timestamp('end_at');

            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('comment')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('vehicle_requests');
    }
};
