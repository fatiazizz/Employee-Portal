<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('equipment_requests', function (Blueprint $table) {
            if (!Schema::hasColumn('equipment_requests', 'admin_approver_id')) {
                $table->foreignId('admin_approver_id')->nullable()->after('approver_id')->constrained('users')->nullOnDelete();
            }
            if (!Schema::hasColumn('equipment_requests', 'manager_approved_items')) {
                $table->json('manager_approved_items')->nullable()->after('approved_items');
            }
            if (!Schema::hasColumn('equipment_requests', 'admin_delivery_items')) {
                $table->json('admin_delivery_items')->nullable()->after('manager_approved_items');
            }
        });

        if (\DB::getDriverName() === 'mysql') {
            \DB::statement("ALTER TABLE equipment_requests MODIFY COLUMN status ENUM('pending', 'approved', 'rejected', 'final_approval', 'final_rejection') DEFAULT 'pending'");
        }
    }

    public function down(): void
    {
        Schema::table('equipment_requests', function (Blueprint $table) {
            $table->dropForeign(['admin_approver_id']);
            $table->dropColumn(['admin_approver_id', 'manager_approved_items', 'admin_delivery_items']);
        });
        if (\DB::getDriverName() === 'mysql') {
            \DB::statement("ALTER TABLE equipment_requests MODIFY COLUMN status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending'");
        }
    }
};
