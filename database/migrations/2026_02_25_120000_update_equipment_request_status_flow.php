<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Map old status values to new ones
        DB::table('equipment_requests')->where('status', 'approved')->update(['status' => 'approved_by_manager']);
        DB::table('equipment_requests')->where('status', 'rejected')->update(['status' => 'declined_by_manager']);
        DB::table('equipment_requests')->where('status', 'final_approval')->update(['status' => 'final_approved']);
        DB::table('equipment_requests')->where('status', 'final_rejection')->update(['status' => 'admin_rejected']);

        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE equipment_requests MODIFY COLUMN status ENUM(
                'pending',
                'declined_by_manager',
                'approved_by_manager',
                'admin_rejected',
                'final_approved'
            ) DEFAULT 'pending'");
        }
    }

    public function down(): void
    {
        DB::table('equipment_requests')->where('status', 'approved_by_manager')->update(['status' => 'approved']);
        DB::table('equipment_requests')->where('status', 'declined_by_manager')->update(['status' => 'rejected']);
        DB::table('equipment_requests')->where('status', 'final_approved')->update(['status' => 'final_approval']);
        DB::table('equipment_requests')->where('status', 'admin_rejected')->update(['status' => 'final_rejection']);

        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE equipment_requests MODIFY COLUMN status ENUM(
                'pending',
                'approved',
                'rejected',
                'final_approval',
                'final_rejection'
            ) DEFAULT 'pending'");
        }
    }
};
