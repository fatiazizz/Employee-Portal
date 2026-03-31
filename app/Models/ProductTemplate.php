<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductTemplate extends Model
{
    protected $fillable = ['name', 'category', 'type'];

    public function warehouseItems(): HasMany
    {
        return $this->hasMany(WarehouseItem::class, 'product_template_id');
    }

    public function getAvailableQuantityAttribute(): int
    {
        return (int) $this->warehouseItems()
            ->whereNull('recipient_id')
            ->sum('quantity');
    }
}
