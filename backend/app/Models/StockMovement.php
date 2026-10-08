<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockMovement extends Model
{
    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = ['id', 'date', 'itemId', 'itemName', 'type', 'quantity', 'reference', 'notes'];
}
