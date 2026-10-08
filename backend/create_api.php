<?php

$controllersDir = __DIR__.'/app/Http/Controllers/Api/';
if (! is_dir($controllersDir)) {
    mkdir($controllersDir, 0777, true);
}

$controllers = [
    'AuthController.php' => <<<PHP
<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request \$request)
    {
        \$request->validate([
            'username' => 'required',
            'password' => 'required',
        ]);

        \$user = User::where('username', \$request->username)->first();

        if (! \$user || ! Hash::check(\$request->password, \$user->password)) {
            throw ValidationException::withMessages([
                'username' => ['Username atau password salah.'],
            ]);
        }

        return response()->json([
            'user' => \$user,
            'token' => \$user->createToken('auth_token')->plainTextToken,
        ]);
    }

    public function logout(Request \$request)
    {
        \$request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }

    public function me(Request \$request)
    {
        return response()->json(\$request->user());
    }
}
PHP,
    'UserController.php' => <<<PHP
<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index()
    {
        return response()->json(User::all());
    }

    public function store(Request \$request)
    {
        \$validated = \$request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|unique:users,username',
            'password' => 'required|string|min:3',
            'role' => 'required|string',
        ]);

        \$user = User::create([
            'id' => (string) round(microtime(true) * 1000), // Simple ID generator
            'name' => \$validated['name'],
            'username' => \$validated['username'],
            'password' => Hash::make(\$validated['password']),
            'role' => \$validated['role'],
        ]);

        return response()->json(\$user, 201);
    }

    public function update(Request \$request, \$id)
    {
        \$user = User::findOrFail(\$id);

        \$validated = \$request->validate([
            'name' => 'sometimes|required|string|max:255',
            'username' => 'sometimes|required|string|unique:users,username,' . \$id,
            'role' => 'sometimes|required|string',
            'password' => 'nullable|string|min:3',
        ]);

        if (isset(\$validated['password']) && !empty(\$validated['password'])) {
            \$validated['password'] = Hash::make(\$validated['password']);
        } else {
            unset(\$validated['password']);
        }

        \$user->update(\$validated);
        return response()->json(\$user);
    }

    public function destroy(\$id)
    {
        \$user = User::findOrFail(\$id);
        \$user->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
PHP,
    'InventoryController.php' => <<<PHP
<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use App\Models\ItemCategory;
use App\Models\ItemUnit;
use App\Models\Customer;
use App\Models\StockMovement;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    public function getMasterData()
    {
        return response()->json([
            'items' => InventoryItem::all(),
            'categories' => ItemCategory::all(),
            'units' => ItemUnit::all(),
            'customers' => Customer::all(),
            'movements' => StockMovement::orderBy('created_at', 'desc')->get(),
        ]);
    }

    // --- Items ---
    public function storeItem(Request \$request)
    {
        \$validated = \$request->validate([
            'sku' => 'required|string',
            'name' => 'required|string',
            'category' => 'required|string',
            'type' => 'required|string',
            'currentStock' => 'required|integer',
            'minStock' => 'required|integer',
            'unit' => 'required|string',
            'customerName' => 'nullable|string',
        ]);

        \$item = InventoryItem::create([
            'id' => 'ITM-' . round(microtime(true) * 1000),
        ] + \$validated);

        return response()->json(\$item, 201);
    }

    public function updateItem(Request \$request, \$id)
    {
        \$item = InventoryItem::findOrFail(\$id);
        \$item->update(\$request->all());
        return response()->json(\$item);
    }

    public function destroyItem(\$id)
    {
        InventoryItem::findOrFail(\$id)->delete();
        return response()->json(['message' => 'Deleted']);
    }

    // --- Categories ---
    public function storeCategory(Request \$request)
    {
        \$cat = ItemCategory::create([
            'id' => 'CAT-' . round(microtime(true) * 1000),
            'name' => \$request->name,
        ]);
        return response()->json(\$cat, 201);
    }

    public function updateCategory(Request \$request, \$id)
    {
        \$cat = ItemCategory::findOrFail(\$id);
        \$cat->update(['name' => \$request->name]);
        return response()->json(\$cat);
    }

    public function destroyCategory(\$id)
    {
        ItemCategory::findOrFail(\$id)->delete();
        return response()->json(['message' => 'Deleted']);
    }

    // --- Units ---
    public function storeUnit(Request \$request)
    {
        \$unit = ItemUnit::create([
            'id' => 'U-' . round(microtime(true) * 1000),
            'name' => \$request->name,
        ]);
        return response()->json(\$unit, 201);
    }

    public function updateUnit(Request \$request, \$id)
    {
        \$unit = ItemUnit::findOrFail(\$id);
        \$unit->update(['name' => \$request->name]);
        return response()->json(\$unit);
    }

    public function destroyUnit(\$id)
    {
        ItemUnit::findOrFail(\$id)->delete();
        return response()->json(['message' => 'Deleted']);
    }

    // --- Customers ---
    public function storeCustomer(Request \$request)
    {
        \$cust = Customer::create([
            'id' => 'CUST-' . round(microtime(true) * 1000),
            'code' => \$request->code,
            'name' => \$request->name,
            'contact' => \$request->contact,
            'phone' => \$request->phone,
        ]);
        return response()->json(\$cust, 201);
    }

    public function updateCustomer(Request \$request, \$id)
    {
        \$cust = Customer::findOrFail(\$id);
        \$cust->update(\$request->all());
        return response()->json(\$cust);
    }

    public function destroyCustomer(\$id)
    {
        Customer::findOrFail(\$id)->delete();
        return response()->json(['message' => 'Deleted']);
    }

    // --- Stock Movements ---
    public function storeMovement(Request \$request)
    {
        \$validated = \$request->validate([
            'itemId' => 'required|string',
            'type' => 'required|in:IN,OUT',
            'quantity' => 'required|integer',
            'reference' => 'nullable|string',
            'date' => 'required|string',
        ]);

        \$item = InventoryItem::findOrFail(\$validated['itemId']);

        \$mov = StockMovement::create([
            'id' => 'MOV-' . round(microtime(true) * 1000) . '-' . rand(100,999),
            'date' => \$validated['date'],
            'itemId' => \$item->id,
            'itemName' => \$item->name,
            'type' => \$validated['type'],
            'quantity' => \$validated['quantity'],
            'reference' => \$validated['reference'],
        ]);

        if (\$validated['type'] === 'IN') {
            \$item->increment('currentStock', \$validated['quantity']);
        } else {
            \$item->decrement('currentStock', \$validated['quantity']);
        }

        return response()->json(['movement' => \$mov, 'item' => \$item], 201);
    }

    public function updateMovement(Request \$request, \$id)
    {
        \$mov = StockMovement::findOrFail(\$id);
        \$item = InventoryItem::findOrFail(\$request->itemId);

        // Revert old impact
        if (\$mov->type === 'IN') {
            \$item->decrement('currentStock', \$mov->quantity);
        } else {
            \$item->increment('currentStock', \$mov->quantity);
        }

        // Apply new impact
        \$mov->update([
            'itemId' => \$item->id,
            'itemName' => \$item->name,
            'quantity' => \$request->quantity,
            'date' => \$request->date,
        ]);

        if (\$mov->type === 'IN') {
            \$item->increment('currentStock', \$request->quantity);
        } else {
            \$item->decrement('currentStock', \$request->quantity);
        }

        return response()->json(['movement' => \$mov, 'item' => \$item]);
    }

    public function destroyMovement(\$id)
    {
        \$mov = StockMovement::findOrFail(\$id);
        \$item = InventoryItem::find(\$mov->itemId);

        if (\$item) {
            if (\$mov->type === 'IN') {
                \$item->decrement('currentStock', \$mov->quantity);
            } else {
                \$item->increment('currentStock', \$mov->quantity);
            }
        }

        \$mov->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
PHP,
];

foreach ($controllers as $file => $content) {
    file_put_contents($controllersDir.$file, $content);
    echo "Created controller \$file\n";
}

$routesApi = <<<PHP
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\InventoryController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // User Management
    Route::apiResource('users', UserController::class);

    // Inventory Master Data
    Route::get('/inventory/master', [InventoryController::class, 'getMasterData']);

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

    Route::post('/inventory/movements', [InventoryController::class, 'storeMovement']);
    Route::put('/inventory/movements/{id}', [InventoryController::class, 'updateMovement']);
    Route::delete('/inventory/movements/{id}', [InventoryController::class, 'destroyMovement']);
});
PHP;

file_put_contents(__DIR__.'/routes/api.php', $routesApi);
echo "Updated routes/api.php\n";
