<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('inventory_items', function (Blueprint $table) {
            $table->string('itemGroup')->nullable()->after('category');
        });

        Schema::table('stock_movements', function (Blueprint $table) {
            $table->string('part_number')->nullable()->after('reference');
            $table->string('item_group')->nullable()->after('part_number');
            $table->string('po_number')->nullable()->after('item_group');
            $table->string('vendor')->nullable()->after('po_number');
            $table->decimal('price_each', 15, 2)->nullable()->after('vendor');
            $table->string('tax_type')->nullable()->after('price_each');
            $table->decimal('price_total', 15, 2)->nullable()->after('tax_type');
        });
    }

    public function down(): void
    {
        Schema::table('inventory_items', function (Blueprint $table) {
            $table->dropColumn('itemGroup');
        });

        Schema::table('stock_movements', function (Blueprint $table) {
            $table->dropColumn([
                'part_number', 'item_group', 'po_number', 'vendor',
                'price_each', 'tax_type', 'price_total'
            ]);
        });
    }
};
