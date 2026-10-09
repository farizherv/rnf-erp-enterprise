<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();
        User::factory()->create([
            'id' => \Illuminate\Support\Str::uuid()->toString(),
            'name' => 'Admin User',
            'username' => 'admin',
            'role' => 'ADMIN',
        ]);
        $this->call([
            MasterDataSeeder::class,
        ]);
    }
}
