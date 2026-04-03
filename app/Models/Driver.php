<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Driver extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'license_number',
        'phone',
        'is_active',
    ];

    protected $attributes = [
        'is_active' => false,
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
