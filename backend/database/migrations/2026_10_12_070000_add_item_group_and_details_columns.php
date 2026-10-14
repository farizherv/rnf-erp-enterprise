<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('inventory_items', function (Blueprint $table) {
            if (!Schema::hasColumn('inventory_items', 'itemGroup')) {
                $table->string('itemGroup')->nullable()->after('category');
            }
        });

        Schema::table('stock_movements', function (Blueprint $table) {
            if (!Schema::hasColumn('stock_movements', 'part_number')) {
                $table->string('part_number')->nullable()->after('reference');
            }
            if (!Schema::hasColumn('stock_movements', 'item_group')) {
                $table->string('item_group')->nullable()->after('part_number');
            }
            if (!Schema::hasColumn('stock_movements', 'po_number')) {
                $table->string('po_number')->nullable()->after('item_group');
            }
            if (!Schema::hasColumn('stock_movements', 'vendor')) {
                $table->string('vendor')->nullable()->after('po_number');
            }
            if (!Schema::hasColumn('stock_movements', 'price_each')) {
                $table->decimal('price_each', 15, 2)->nullable()->after('vendor');
            }
            if (!Schema::hasColumn('stock_movements', 'tax_type')) {
                $table->string('tax_type')->nullable()->after('price_each');
            }
            if (!Schema::hasColumn('stock_movements', 'price_total')) {
                $table->decimal('price_total', 15, 2)->nullable()->after('tax_type');
            }
        });
    }

    public function down(): void
    {
        Schema::table('inventory_items', function (Blueprint $table) {
            if (Schema::hasColumn('inventory_items', 'itemGroup')) {
                $table->dropColumn('itemGroup');
            }
        });

        Schema::table('stock_movements', function (Blueprint $table) {
            $colsToDrop = array_filter([
                'part_number', 'item_group', 'po_number', 'vendor',
                'price_each', 'tax_type', 'price_total'
            ], fn($col) => Schema::hasColumn('stock_movements', $col));

            if (!empty($colsToDrop)) {
                $table->dropColumn($colsToDrop);
            }
        });
    }
};
