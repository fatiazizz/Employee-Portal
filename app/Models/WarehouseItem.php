<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WarehouseItem extends Model
{
    public $incrementing = false;

    protected $keyType = 'integer';

    protected $fillable = [
        'id',
        'product_template_id',
        'serial_number',
        'country_id',
        'production_date',
        'purchase_date',
        'registered_at',
        'quantity',
        'recipient_id',
        'department_id',
        'delivery_date',
    ];

    protected $casts = [
        'production_date' => 'date',
        'purchase_date' => 'date',
        'registered_at' => 'date',
        'delivery_date' => 'date',
    ];

    public function productTemplate(): BelongsTo
    {
        return $this->belongsTo(ProductTemplate::class, 'product_template_id');
    }

    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class, 'country_id');
    }

    public function recipient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recipient_id');
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'department_id');
    }

    public static function nextIdForType(string $type): int
    {
        $template = \App\Models\ProductTemplate::where('type', $type)->first();
        $minId = $type === 'capital' ? 1 : 8001;
        $maxId = $type === 'capital' ? 8000 : 999999;
        $currentMax = static::whereHas('productTemplate', fn ($q) => $q->where('type', $type))
            ->where('id', '>=', $minId)
            ->where('id', '<=', $maxId)
            ->max('id');

        return $currentMax ? (int) $currentMax + 1 : $minId;
    }
}
