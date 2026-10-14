<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockMovement extends Model
{
    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'id', 'date', 'itemId', 'itemName', 'type', 'quantity', 'reference', 
        'notes', 'part_number', 'item_group', 'po_number', 'vendor', 
        'price_each', 'tax_type', 'price_total'
    ];

    protected $casts = [
        'quantity' => 'integer',
        'price_each' => 'float',
        'price_total' => 'float',
    ];
}
