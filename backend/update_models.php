<?php

$dir = __DIR__.'/app/Models/';

$models = [
    'User.php' => <<<PHP
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected \$keyType = 'string';
    public \$incrementing = false;

    protected \$fillable = [
        'id', 'name', 'username', 'password', 'role',
    ];

    protected \$hidden = [
        'password', 'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }
}
PHP,
    'ItemCategory.php' => <<<PHP
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ItemCategory extends Model
{
    protected \$keyType = 'string';
    public \$incrementing = false;
    protected \$fillable = ['id', 'name'];
}
PHP,
    'ItemUnit.php' => <<<PHP
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ItemUnit extends Model
{
    protected \$keyType = 'string';
    public \$incrementing = false;
    protected \$fillable = ['id', 'name'];
}
PHP,
    'Customer.php' => <<<PHP
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    protected \$keyType = 'string';
    public \$incrementing = false;
    protected \$fillable = ['id', 'code', 'name', 'contact', 'phone'];
}
PHP,
    'InventoryItem.php' => <<<PHP
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventoryItem extends Model
{
    protected \$keyType = 'string';
    public \$incrementing = false;
    protected \$fillable = ['id', 'sku', 'name', 'category', 'type', 'currentStock', 'minStock', 'unit', 'customerName'];
}
PHP,
    'StockMovement.php' => <<<PHP
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockMovement extends Model
{
    protected \$keyType = 'string';
    public \$incrementing = false;
    protected \$fillable = ['id', 'date', 'itemId', 'itemName', 'type', 'quantity', 'reference', 'notes'];
}
PHP,
];

foreach ($models as $file => $content) {
    file_put_contents($dir.$file, $content);
    echo "Updated \$file\n";
}
