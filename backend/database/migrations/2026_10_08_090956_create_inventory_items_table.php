<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_items', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('sku')->nullable();
            $table->string('name');
            $table->string('category');
            $table->string('type');
            $table->integer('currentStock')->default(0);
            $table->integer('minStock')->default(0);
            $table->string('unit');
            $table->string('customerName')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_items');
    }
};
