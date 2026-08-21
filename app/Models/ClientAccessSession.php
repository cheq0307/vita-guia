<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClientAccessSession extends Model
{
    protected $fillable = [
        'access_link_id', 'token_hash', 'token', 'client_id_hash',
        'platform', 'app_version', 'last_used_at',
    ];

    protected function casts(): array
    {
        return [
            'token' => 'encrypted',
            'last_used_at' => 'datetime',
        ];
    }

    public function accessLink()
    {
        return $this->belongsTo(AccessLink::class);
    }
}
