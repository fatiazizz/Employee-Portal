<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Department extends Model
{
    protected $table = 'department';
    protected $fillable = ['name' , 'manager_id'];
    use HasFactory;


    public function manager()
    {
        return $this->hasOne(User::class , "id","manager_id");
    }

    
}
