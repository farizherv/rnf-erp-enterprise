<?php

$dir = __DIR__.'/database/migrations/';
$files = scandir($dir);

$migrations = [
    'create_users_table' => <<<PHP
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('users', function (Blueprint \$table) {
            \$table->string('id')->primary();
            \$table->string('name');
            \$table->string('username')->unique();
            \$table->string('password');
            \$table->string('role')->default('ADMIN');
            \$table->rememberToken();
            \$table->timestamps();
        });
        Schema::create('password_reset_tokens', function (Blueprint \$table) {
            \$table->string('email')->primary();
            \$table->string('token');
            \$table->timestamp('created_at')->nullable();
        });
        Schema::create('sessions', function (Blueprint \$table) {
            \$table->string('id')->primary();
            \$table->foreignId('user_id')->nullable()->index();
            \$table->string('ip_address', 45)->nullable();
            \$table->text('user_agent')->nullable();
            \$table->longText('payload');
            \$table->integer('last_activity')->index();
        });
    }
    public function down(): void {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
PHP,
    'create_item_categories_table' => <<<PHP
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('item_categories', function (Blueprint \$table) {
            \$table->string('id')->primary();
            \$table->string('name');
            \$table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('item_categories'); }
};
PHP,
    'create_item_units_table' => <<<PHP
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('item_units', function (Blueprint \$table) {
            \$table->string('id')->primary();
            \$table->string('name');
            \$table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('item_units'); }
};
PHP,
    'create_customers_table' => <<<PHP
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('customers', function (Blueprint \$table) {
            \$table->string('id')->primary();
            \$table->string('code')->nullable();
            \$table->string('name');
            \$table->string('contact')->nullable();
            \$table->string('phone')->nullable();
            \$table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('customers'); }
};
PHP,
    'create_inventory_items_table' => <<<PHP
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('inventory_items', function (Blueprint \$table) {
            \$table->string('id')->primary();
            \$table->string('sku')->nullable();
            \$table->string('name');
            \$table->string('category');
            \$table->string('type');
            \$table->integer('currentStock')->default(0);
            \$table->integer('minStock')->default(0);
            \$table->string('unit');
            \$table->string('customerName')->nullable();
            \$table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('inventory_items'); }
};
PHP,
    'create_stock_movements_table' => <<<PHP
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('stock_movements', function (Blueprint \$table) {
            \$table->string('id')->primary();
            \$table->string('date');
            \$table->string('itemId');
            \$table->string('itemName');
            \$table->string('type');
            \$table->integer('quantity');
            \$table->string('reference')->nullable();
            \$table->text('notes')->nullable();
            \$table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('stock_movements'); }
};
PHP,
];

foreach ($files as $file) {
    foreach ($migrations as $key => $content) {
        if (strpos($file, $key) !== false) {
            file_put_contents($dir.$file, $content);
            echo "Updated \$file\n";
        }
    }
}
