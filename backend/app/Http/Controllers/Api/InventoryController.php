<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\InventoryItem;
use App\Models\ItemCategory;
use App\Models\ItemUnit;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InventoryController extends Controller
{
    public function getSnapshot()
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
    public function storeItem(Request $request)
    {
        $validated = $request->validate([
            'sku' => 'nullable|string',
            'name' => 'required|string',
            'category' => 'required|string',
            'type' => 'required|string',
            'currentStock' => 'required|integer',
            'minStock' => 'required|integer',
            'unit' => 'required|string',
            'customerName' => 'nullable|string',
        ]);

        $item = InventoryItem::create([
            'id' => 'ITM-'.round(microtime(true) * 1000),
        ] + $validated);

        return response()->json($item, 201);
    }

    public function updateItem(Request $request, $id)
    {
        $item = InventoryItem::findOrFail($id);
        $item->update($request->all());

        return response()->json($item);
    }

    public function destroyItem($id)
    {
        return DB::transaction(function () use ($id) {
            InventoryItem::findOrFail($id)->delete();
            StockMovement::where('itemId', $id)->delete();

            return response()->json(['message' => 'Deleted']);
        });
    }

    // --- Categories ---
    public function storeCategory(Request $request)
    {
        $cat = ItemCategory::create([
            'id' => 'CAT-'.round(microtime(true) * 1000),
            'name' => $request->name,
        ]);

        return response()->json($cat, 201);
    }

    public function updateCategory(Request $request, $id)
    {
        $cat = ItemCategory::findOrFail($id);
        $cat->update(['name' => $request->name]);

        return response()->json($cat);
    }

    public function destroyCategory($id)
    {
        ItemCategory::findOrFail($id)->delete();

        return response()->json(['message' => 'Deleted']);
    }

    // --- Units ---
    public function storeUnit(Request $request)
    {
        $unit = ItemUnit::create([
            'id' => 'U-'.round(microtime(true) * 1000),
            'name' => $request->name,
        ]);

        return response()->json($unit, 201);
    }

    public function updateUnit(Request $request, $id)
    {
        $unit = ItemUnit::findOrFail($id);
        $unit->update(['name' => $request->name]);

        return response()->json($unit);
    }

    public function destroyUnit($id)
    {
        ItemUnit::findOrFail($id)->delete();

        return response()->json(['message' => 'Deleted']);
    }

    // --- Customers ---
    public function storeCustomer(Request $request)
    {
        $cust = Customer::create([
            'id' => 'CUST-'.round(microtime(true) * 1000),
            'code' => $request->code,
            'name' => $request->name,
            'contact' => $request->contact,
            'phone' => $request->phone,
        ]);

        return response()->json($cust, 201);
    }

    public function updateCustomer(Request $request, $id)
    {
        $cust = Customer::findOrFail($id);
        $cust->update($request->all());

        return response()->json($cust);
    }

    public function destroyCustomer($id)
    {
        Customer::findOrFail($id)->delete();

        return response()->json(['message' => 'Deleted']);
    }

    // --- Stock Movements ---
    public function storeMovementIn(Request $request)
    {
        $validated = $request->validate([
            'itemId' => 'required|string',
            'quantity' => 'required|integer',
            'reference' => 'nullable|string',
            'date' => 'required|string',
        ]);

        return DB::transaction(function () use ($validated) {
            $item = InventoryItem::findOrFail($validated['itemId']);

            $mov = StockMovement::create([
                'id' => 'MOV-'.round(microtime(true) * 1000).'-'.rand(100, 999),
                'date' => $validated['date'],
                'itemId' => $item->id,
                'itemName' => $item->name,
                'type' => 'IN',
                'quantity' => $validated['quantity'],
                'reference' => $validated['reference'],
            ]);

            $item->increment('currentStock', $validated['quantity']);

            return response()->json(['movement' => $mov, 'item' => $item->fresh()], 201);
        });
    }

    public function storeMovementOut(Request $request)
    {
        $validated = $request->validate([
            'itemId' => 'required|string',
            'quantity' => 'required|integer',
            'reference' => 'nullable|string',
            'date' => 'required|string',
        ]);

        return DB::transaction(function () use ($validated) {
            $item = InventoryItem::findOrFail($validated['itemId']);

            $mov = StockMovement::create([
                'id' => 'MOV-'.round(microtime(true) * 1000).'-'.rand(100, 999),
                'date' => $validated['date'],
                'itemId' => $item->id,
                'itemName' => $item->name,
                'type' => 'OUT',
                'quantity' => $validated['quantity'],
                'reference' => $validated['reference'],
            ]);

            $item->decrement('currentStock', $validated['quantity']);

            return response()->json(['movement' => $mov, 'item' => $item->fresh()], 201);
        });
    }

    public function updateMovement(Request $request, $id)
    {
        return DB::transaction(function () use ($id, $request) {
            $mov = StockMovement::findOrFail($id);
            $item = InventoryItem::findOrFail($request->itemId);

            // Revert old impact
            if ($mov->type === 'IN') {
                $item->decrement('currentStock', $mov->quantity);
            } else {
                $item->increment('currentStock', $mov->quantity);
            }

            // Apply new impact
            $mov->update([
                'itemId' => $item->id,
                'itemName' => $item->name,
                'quantity' => $request->quantity,
                'date' => $request->date,
            ]);

            if ($mov->type === 'IN') {
                $item->increment('currentStock', $request->quantity);
            } else {
                $item->decrement('currentStock', $request->quantity);
            }

            return response()->json(['movement' => $mov, 'item' => $item->fresh()]);
        });
    }

    public function destroyMovement($id)
    {
        return DB::transaction(function () use ($id) {
            $mov = StockMovement::findOrFail($id);
            $item = InventoryItem::find($mov->itemId);

            if ($item) {
                if ($mov->type === 'IN') {
                    $item->decrement('currentStock', $mov->quantity);
                } else {
                    $item->increment('currentStock', $mov->quantity);
                }
            }

            $mov->delete();

            return response()->json(['message' => 'Deleted']);
        });
    }
}
