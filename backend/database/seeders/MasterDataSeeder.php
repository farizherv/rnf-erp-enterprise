<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ItemCategory;
use App\Models\ItemUnit;
use App\Models\Customer;
use App\Models\Vendor;
use App\Models\ItemGroup;

class MasterDataSeeder extends Seeder
{
    public function run(): void
    {
        // =============================================
        // KATEGORI BARANG
        // =============================================
        $categories = ['ENGINE', 'OSS', 'FABRICATION'];

        foreach ($categories as $index => $name) {
            ItemCategory::firstOrCreate(
                ['name' => $name],
                ['id' => 'CAT-' . str_pad($index + 1, 3, '0', STR_PAD_LEFT)]
            );
        }

        // =============================================
        // SATUAN BARANG
        // =============================================
        $units = ['ASSY', 'UNIT', 'EA', 'PCS', 'BOX'];

        foreach ($units as $index => $name) {
            ItemUnit::firstOrCreate(
                ['name' => $name],
                ['id' => 'U-' . str_pad($index + 1, 3, '0', STR_PAD_LEFT)]
            );
        }

        // =============================================
        // MASTER CUSTOMER (64 Entitas)
        // =============================================
        $customers = [
            'CV. Amanah Indonesia',
            'CV. Astanti',
            'CV. Auto Part Solution Indonesia',
            'CV. Borneo Musasyah',
            'CV. Diesel Utama Part',
            'CV. Glohoha',
            'CV. Hadi Rezky Jaya',
            'CV. HPU-SAB',
            'CV. Kepik Anugerah Adahfi',
            'CV. Reka Guna Nusantara',
            'CV. Tiga Sahabat',
            'CV. Tiga Sahabat Abadi',
            'CV. Tri Jaya Prima',
            'CV. TSA',
            'PT. Alatas',
            'PT. Amman',
            'PT. Amman Mineral',
            'PT. Aneka Indonesia',
            'PT. Auger',
            'PT. Banti',
            'PT. Berkat Anugerah Sejahtera',
            'PT. Bima Kaltim Utama',
            'PT. Bina Sarana Sukses',
            'PT. BIS',
            'PT. Blumbang Putra Perkasa',
            'PT. BMB',
            'PT. Borneo Makmur Bersama',
            'PT. Buma / PT. BUMA',
            'PT. Citra Heritage Indonesia',
            'PT. Diamond Hire Indonesia',
            'PT. Diamond Machinery Asia',
            'PT. Doa Partsindo Utama',
            'PT. Global',
            'PT. Global Energitama',
            'PT. Harmoni Panca Utama',
            'PT. Indo Perkasa',
            'PT. Kaltim Diamond Coal',
            'PT. Karunia Armada Indonesia',
            'PT. Karya Bhumi Lestari',
            'PT. KBL',
            'PT. Kharisma Jaya Prima',
            'PT. KPC',
            'PT. KPUC',
            'PT. Macmahon Indonesia',
            'PT. MAM',
            'PT. Mandala Prima Persada / PT. Mandala Prima Perhasa',
            'PT. PBB',
            'PT. Petrosea',
            'PT. Prima Teknologi Amanah',
            'PT. PSI Drilling',
            'PT. PTA',
            'PT. Rea Kaltim Plantantions',
            'PT. Resource Equipment Indonesia',
            'PT. Rhodes',
            'PT. RNF',
            'PT. Sasana Yudha Bakti',
            'PT. Setya Solusi Sejahtera',
            'PT. SPM',
            'PT. Surya Pratama Makmur',
            'PT. Surya Pratama Makmur (GAM Site)',
            'PT. TCI',
            'PT. Thiess',
            'PT. Thiess Kariangau',
            'PT. Trakindo Utama',
            'PT. TSA',
            'PT. Tunggal Perkasa Group',
        ];

        foreach ($customers as $index => $name) {
            Customer::firstOrCreate(
                ['name' => $name],
                [
                    'id' => 'CUST-' . str_pad($index + 1, 3, '0', STR_PAD_LEFT),
                    'code' => 'C-' . str_pad($index + 1, 3, '0', STR_PAD_LEFT),
                    'contact' => '-',
                    'phone' => '-',
                ]
            );
        }

        // =============================================
        // MASTER VENDOR
        // =============================================
        $vendors = [
            'PT. United Tractors',
            'PT. Trakindo Utama',
            'PT. Hexindo Adiperkasa',
            'PT. Kobexindo Tractors',
            'CV. Sumber Teknik',
            'CV. Maju Bersama',
            'PT. RNF Global Vendor',
        ];

        foreach ($vendors as $index => $name) {
            Vendor::firstOrCreate(
                ['name' => $name],
                ['id' => 'VEN-' . str_pad($index + 1, 3, '0', STR_PAD_LEFT)]
            );
        }

        // =============================================
        // MASTER ITEM GROUP
        // =============================================
        $itemGroups = [
            'SPAREPART',
            'CONSUMABLE',
            'TOOLS & EQUIPMENT',
            'FABRICATION MATERIAL',
            'GENERAL',
        ];

        foreach ($itemGroups as $index => $name) {
            ItemGroup::firstOrCreate(
                ['name' => $name],
                ['id' => 'GRP-' . str_pad($index + 1, 3, '0', STR_PAD_LEFT)]
            );
        }
    }
}
