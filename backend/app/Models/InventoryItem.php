<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventoryItem extends Model
{
    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = ['id', 'sku', 'name', 'category', 'type', 'currentStock', 'minStock', 'unit', 'customerName'];
}
