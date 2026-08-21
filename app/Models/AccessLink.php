<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AccessLink extends Model
{
    protected $fillable = ['advisor_id', 'token_hash', 'token', 'recipient_name', 'recipient_contact', 'expires_at', 'max_opens', 'revoked'];

    protected function casts(): array
    {
        return ['token' => 'encrypted', 'expires_at' => 'datetime', 'first_opened_at' => 'datetime', 'last_opened_at' => 'datetime', 'revoked' => 'boolean'];
    }

    public function clientSessions()
    {
        return $this->hasMany(ClientAccessSession::class);
    }

    public function advisor()
    {
        return $this->belongsTo(User::class, 'advisor_id');
    }

    public function isAvailable(): bool
    {
        return ! $this->revoked && $this->expires_at->isFuture() && ($this->max_opens === null || $this->open_count < $this->max_opens);
    }
}
