<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContentItem extends Model
{
    protected $fillable = ['type', 'title', 'summary', 'body', 'media_url', 'sort_order', 'active', 'author_id', 'reviewer_id', 'status', 'review_notes', 'submitted_at', 'reviewed_at'];

    protected function casts(): array
    {
        return ['active' => 'boolean', 'submitted_at' => 'datetime', 'reviewed_at' => 'datetime'];
    }

    public function assets()
    {
        return $this->hasMany(ContentAsset::class)->orderBy('sort_order')->orderBy('id');
    }

    public function chunks()
    {
        return $this->hasMany(ContentChunk::class);
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    public function isEditableBy(User $user): bool
    {
        return $this->author_id === $user->id && in_array($this->status, ['draft', 'rejected'], true);
    }
}
