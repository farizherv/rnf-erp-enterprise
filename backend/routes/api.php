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

    Route::post('/inventory/movements/in', [InventoryController::class, 'storeMovementIn']);
    Route::post('/inventory/movements/out', [InventoryController::class, 'storeMovementOut']);
    Route::put('/inventory/movements/{id}', [InventoryController::class, 'updateMovement']);
    Route::delete('/inventory/movements/{id}', [InventoryController::class, 'destroyMovement']);
});
