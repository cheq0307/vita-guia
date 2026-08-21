<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContentAsset extends Model
{
    protected $fillable = [
        'content_item_id', 'kind', 'storage_path', 'external_url', 'original_name',
        'mime_type', 'size_bytes', 'transcript', 'extracted_text', 'extracted_pages',
        'extraction_status', 'page_count', 'sort_order',
    ];

    protected function casts(): array
    {
        return ['extracted_pages' => 'array'];
    }

    public function youtubeEmbedUrl(): ?string
    {
        if ($this->kind !== 'youtube' || ! $this->external_url) {
            return null;
        }

        $parts = parse_url($this->external_url);
        $host = strtolower($parts['host'] ?? '');
        $videoId = null;

        if (in_array($host, ['youtu.be', 'www.youtu.be'], true)) {
            $videoId = trim($parts['path'] ?? '', '/');
        } elseif (in_array($host, ['youtube.com', 'www.youtube.com', 'm.youtube.com'], true)) {
            parse_str($parts['query'] ?? '', $query);
            $videoId = $query['v'] ?? null;
            if (! $videoId && preg_match('#/(?:shorts|embed)/([^/?]+)#', $parts['path'] ?? '', $matches)) {
                $videoId = $matches[1];
            }
        }

        return $videoId && preg_match('/^[A-Za-z0-9_-]{6,20}$/', $videoId)
            ? 'https://www.youtube-nocookie.com/embed/'.$videoId
            : null;
    }

    public function contentItem()
    {
        return $this->belongsTo(ContentItem::class);
    }

    public function chunks()
    {
        return $this->hasMany(ContentChunk::class);
    }
}
