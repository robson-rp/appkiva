<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CurrencyExchangeRate extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = ['base_currency', 'target_currency', 'rate'];

    protected function casts(): array
    {
        return ['rate' => 'decimal:8'];
    }
}
