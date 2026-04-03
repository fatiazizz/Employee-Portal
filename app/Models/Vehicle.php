<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    protected $fillable = ['name', 'plate_number', 'type', 'is_active'];

    use HasFactory;

    protected $attributes = [
        'is_active' => false,
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
