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
use App\Models\Vendor;
use App\Models\ItemGroup;

class InventoryController extends Controller
{
    public function getSnapshot()
    {
        return response()->json([
            'items' => InventoryItem::all(),
            'categories' => ItemCategory::all(),
            'units' => ItemUnit::all(),
            'customers' => Customer::all(),
            'vendors' => Vendor::all(),
            'itemGroups' => ItemGroup::all(),
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
            'itemGroup' => 'nullable|string',
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

    // --- Vendors ---
    public function storeVendor(Request $request)
    {
        $validated = $request->validate(['name' => 'required|string']);
        $vendor = Vendor::create(['id' => 'VND-'.time(), 'name' => $validated['name']]);
        return response()->json($vendor, 201);
    }

    public function updateVendor(Request $request, $id)
    {
        $vendor = Vendor::findOrFail($id);
        $vendor->update($request->validate(['name' => 'required|string']));
        return response()->json($vendor);
    }

    public function destroyVendor($id)
    {
        Vendor::findOrFail($id)->delete();
        return response()->json(['message' => 'Vendor deleted']);
    }

    // --- Item Groups (Kategori Tambahan) ---
    public function storeItemGroup(Request $request)
    {
        $validated = $request->validate(['name' => 'required|string']);
        $group = ItemGroup::create(['id' => 'IGP-'.time(), 'name' => $validated['name']]);
        return response()->json($group, 201);
    }

    public function updateItemGroup(Request $request, $id)
    {
        $group = ItemGroup::findOrFail($id);
        $group->update($request->validate(['name' => 'required|string']));
        return response()->json($group);
    }

    public function destroyItemGroup($id)
    {
        ItemGroup::findOrFail($id)->delete();
        return response()->json(['message' => 'Item Group deleted']);
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
            'part_number' => 'nullable|string',
            'item_group' => 'nullable|string',
            'po_number' => 'nullable|string',
            'vendor' => 'nullable|string',
            'price_each' => 'nullable|numeric',
            'tax_type' => 'nullable|string',
            'price_total' => 'nullable|numeric',
            'notes' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated) {
            $item = InventoryItem::findOrFail($validated['itemId']);
            $quantity = (int) $validated['quantity'];
            $priceEach = isset($validated['price_each']) && $validated['price_each'] !== '' ? (float) $validated['price_each'] : null;
            $priceTotal = isset($validated['price_total']) && $validated['price_total'] !== ''
                ? (float) $validated['price_total']
                : ($priceEach !== null ? $priceEach * $quantity : null);

            $mov = StockMovement::create([
                'id' => 'MOV-'.round(microtime(true) * 1000).'-'.rand(100, 999),
                'date' => $validated['date'],
                'itemId' => $item->id,
                'itemName' => $item->name,
                'type' => 'IN',
                'quantity' => $quantity,
                'reference' => $validated['reference'] ?? null,
                'part_number' => $validated['part_number'] ?? null,
                'item_group' => $validated['item_group'] ?? $item->itemGroup ?? $item->category ?? null,
                'po_number' => $validated['po_number'] ?? null,
                'vendor' => $validated['vendor'] ?? null,
                'price_each' => $priceEach,
                'tax_type' => $validated['tax_type'] ?? 'NON_PPN',
                'price_total' => $priceTotal,
                'notes' => $validated['notes'] ?? null,
            ]);

            $item->increment('currentStock', $quantity);

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
            'part_number' => 'nullable|string',
            'item_group' => 'nullable|string',
            'po_number' => 'nullable|string',
            'vendor' => 'nullable|string',
            'price_each' => 'nullable|numeric',
            'tax_type' => 'nullable|string',
            'price_total' => 'nullable|numeric',
            'notes' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated) {
            $item = InventoryItem::findOrFail($validated['itemId']);
            $quantity = (int) $validated['quantity'];
            $priceEach = isset($validated['price_each']) && $validated['price_each'] !== '' ? (float) $validated['price_each'] : null;
            $priceTotal = isset($validated['price_total']) && $validated['price_total'] !== ''
                ? (float) $validated['price_total']
                : ($priceEach !== null ? $priceEach * $quantity : null);

            $mov = StockMovement::create([
                'id' => 'MOV-'.round(microtime(true) * 1000).'-'.rand(100, 999),
                'date' => $validated['date'],
                'itemId' => $item->id,
                'itemName' => $item->name,
                'type' => 'OUT',
                'quantity' => $quantity,
                'reference' => $validated['reference'] ?? null,
                'part_number' => $validated['part_number'] ?? null,
                'item_group' => $validated['item_group'] ?? $item->itemGroup ?? $item->category ?? null,
                'po_number' => $validated['po_number'] ?? null,
                'vendor' => $validated['vendor'] ?? null,
                'price_each' => $priceEach,
                'tax_type' => $validated['tax_type'] ?? 'NON_PPN',
                'price_total' => $priceTotal,
                'notes' => $validated['notes'] ?? null,
            ]);

            $item->decrement('currentStock', $quantity);

            return response()->json(['movement' => $mov, 'item' => $item->fresh()], 201);
        });
    }

    public function updateMovement(Request $request, $id)
    {
        $validated = $request->validate([
            'itemId' => 'required|string',
            'quantity' => 'required|integer|min:1',
            'reference' => 'nullable|string',
            'date' => 'required|string',
            'part_number' => 'nullable|string',
            'item_group' => 'nullable|string',
            'po_number' => 'nullable|string',
            'vendor' => 'nullable|string',
            'price_each' => 'nullable|numeric',
            'tax_type' => 'nullable|string',
            'price_total' => 'nullable|numeric',
            'notes' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($id, $validated) {
            $mov = StockMovement::findOrFail($id);
            $newItem = InventoryItem::findOrFail($validated['itemId']);
            $oldItem = InventoryItem::find($mov->itemId);
            $quantity = (int) $validated['quantity'];

            // Revert old impact on previous item
            if ($oldItem) {
                if ($mov->type === 'IN') {
                    $oldItem->decrement('currentStock', $mov->quantity);
                } else {
                    $oldItem->increment('currentStock', $mov->quantity);
                }
            }

            $priceEach = isset($validated['price_each']) && $validated['price_each'] !== '' ? (float) $validated['price_each'] : null;
            $priceTotal = isset($validated['price_total']) && $validated['price_total'] !== ''
                ? (float) $validated['price_total']
                : ($priceEach !== null ? $priceEach * $quantity : null);

            // Apply updates
            $mov->update([
                'itemId' => $newItem->id,
                'itemName' => $newItem->name,
                'quantity' => $quantity,
                'date' => $validated['date'],
                'reference' => $validated['reference'] ?? null,
                'part_number' => $validated['part_number'] ?? null,
                'item_group' => $validated['item_group'] ?? $newItem->itemGroup ?? $newItem->category ?? null,
                'po_number' => $validated['po_number'] ?? null,
                'vendor' => $validated['vendor'] ?? null,
                'price_each' => $priceEach,
                'tax_type' => $validated['tax_type'] ?? 'NON_PPN',
                'price_total' => $priceTotal,
                'notes' => $validated['notes'] ?? null,
            ]);

            // Apply new impact on the new target item
            $targetItem = InventoryItem::findOrFail($newItem->id);
            if ($mov->type === 'IN') {
                $targetItem->increment('currentStock', $quantity);
            } else {
                $targetItem->decrement('currentStock', $quantity);
            }

            return response()->json(['movement' => $mov->fresh(), 'item' => $targetItem->fresh()]);
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
