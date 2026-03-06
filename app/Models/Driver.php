<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Driver extends Model
{
        use HasFactory;

    protected $fillable = [
        'name',
        'license_number',
        'phone',
        'is_active',
    ];

}