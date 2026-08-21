<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContentChunk extends Model
{
    protected $fillable = [
        'content_item_id', 'content_asset_id', 'source_label',
        'page_number', 'chunk_index', 'text',
    ];

    public function contentItem()
    {
        return $this->belongsTo(ContentItem::class);
    }

    public function asset()
    {
        return $this->belongsTo(ContentAsset::class, 'content_asset_id');
    }
}
