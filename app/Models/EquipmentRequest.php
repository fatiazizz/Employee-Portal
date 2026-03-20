<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EquipmentRequest extends Model
{
        protected $table = 'equipment_requests';

 protected $fillable = [
        'user_id',
        'approver_id',
        'admin_approver_id',
        'items',
        'approved_items',
        'manager_approved_items',
        'admin_delivery_items',
        'status',
        'comment',
    ];

    protected $casts = [
        'items' => 'array',
        'approved_items' => 'array',
        'manager_approved_items' => 'array',
        'admin_delivery_items' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approver_id');
    }

    public function adminApprover(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_approver_id');
    }
}
