<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ItemUnit extends Model
{
    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = ['id', 'name'];
}
