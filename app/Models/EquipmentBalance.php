<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EquipmentBalance extends Model
{
    protected $fillable = ['type', 'quantity'];

    public $timestamps = true;
}
