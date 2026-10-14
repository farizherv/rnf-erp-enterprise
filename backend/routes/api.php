<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    // User Management
    Route::apiResource('users', UserController::class);

    // Inventory Master Data
    Route::get('/inventory', [InventoryController::class, 'getSnapshot']);

    // Inventory CRUD
    Route::post('/inventory/items', [InventoryController::class, 'storeItem']);
    Route::put('/inventory/items/{id}', [InventoryController::class, 'updateItem']);
    Route::delete('/inventory/items/{id}', [InventoryController::class, 'destroyItem']);

    Route::post('/inventory/categories', [InventoryController::class, 'storeCategory']);
    Route::put('/inventory/categories/{id}', [InventoryController::class, 'updateCategory']);
    Route::delete('/inventory/categories/{id}', [InventoryController::class, 'destroyCategory']);

    Route::post('/inventory/units', [InventoryController::class, 'storeUnit']);
    Route::put('/inventory/units/{id}', [InventoryController::class, 'updateUnit']);
    Route::delete('/inventory/units/{id}', [InventoryController::class, 'destroyUnit']);

    Route::post('/inventory/customers', [InventoryController::class, 'storeCustomer']);
    Route::put('/inventory/customers/{id}', [InventoryController::class, 'updateCustomer']);
    Route::delete('/inventory/customers/{id}', [InventoryController::class, 'destroyCustomer']);

    Route::post('/inventory/vendors', [InventoryController::class, 'storeVendor']);
    Route::put('/inventory/vendors/{id}', [InventoryController::class, 'updateVendor']);
    Route::delete('/inventory/vendors/{id}', [InventoryController::class, 'destroyVendor']);

    Route::post('/inventory/item-groups', [InventoryController::class, 'storeItemGroup']);
    Route::put('/inventory/item-groups/{id}', [InventoryController::class, 'updateItemGroup']);
    Route::delete('/inventory/item-groups/{id}', [InventoryController::class, 'destroyItemGroup']);

    Route::post('/inventory/movements/in', [InventoryController::class, 'storeMovementIn']);
    Route::post('/inventory/movements/out', [InventoryController::class, 'storeMovementOut']);
    Route::put('/inventory/movements/{id}', [InventoryController::class, 'updateMovement']);
    Route::delete('/inventory/movements/{id}', [InventoryController::class, 'destroyMovement']);

    // System Maintenance & Production Migration (Restricted to ADMINISTRATOR)
    Route::post('/system/migrate', function (\Illuminate\Http\Request $request) {
        if ($request->user()->role !== 'ADMINISTRATOR') {
            return response()->json(['error' => 'Forbidden. Administrator access required.'], 403);
        }

        try {
            \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
            $migrateOutput = \Illuminate\Support\Facades\Artisan::output();

            // Seed initial Vendors if empty
            if (\Illuminate\Support\Facades\Schema::hasTable('vendors') && \App\Models\Vendor::count() === 0) {
                $defaultVendors = [
                    'PT. United Tractors',
                    'PT. Trakindo Utama',
                    'PT. Hexindo Adiperkasa',
                    'PT. Kobexindo Tractors',
                    'CV. Sumber Teknik',
                    'CV. Maju Bersama',
                    'PT. RNF Global Vendor'
                ];
                foreach ($defaultVendors as $idx => $name) {
                    \App\Models\Vendor::create([
                        'id' => 'VEN-' . str_pad($idx + 1, 3, '0', STR_PAD_LEFT),
                        'name' => $name,
                    ]);
                }
            }

            // Seed initial Item Groups if empty
            if (\Illuminate\Support\Facades\Schema::hasTable('item_groups') && \App\Models\ItemGroup::count() === 0) {
                $defaultGroups = [
                    'SPAREPART',
                    'CONSUMABLE',
                    'TOOLS & EQUIPMENT',
                    'FABRICATION MATERIAL',
                    'GENERAL'
                ];
                foreach ($defaultGroups as $idx => $name) {
                    \App\Models\ItemGroup::create([
                        'id' => 'GRP-' . str_pad($idx + 1, 3, '0', STR_PAD_LEFT),
                        'name' => $name,
                    ]);
                }
            }

            \Illuminate\Support\Facades\Artisan::call('optimize:clear');
            $optimizeOutput = \Illuminate\Support\Facades\Artisan::output();

            return response()->json([
                'success' => true,
                'message' => 'Database migration, provisioning, and cache clear executed successfully.',
                'migrate_output' => $migrateOutput,
                'optimize_output' => $optimizeOutput,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ], 500);
        }
    });
});

