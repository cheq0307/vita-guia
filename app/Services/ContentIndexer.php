<?php

namespace App\Services;

use App\Models\ContentAsset;
use App\Models\ContentItem;
use Illuminate\Support\Str;

class ContentIndexer
{
    public function reindex(ContentItem $item): void
    {
        $item->chunks()->delete();

        $manualText = collect([$item->summary, $item->body])->filter()->join('

');
        $this->storeChunks($item, null, $item->title, null, $manualText);

        foreach ($item->assets()->get() as $asset) {
            $label = $asset->original_name ?: match ($asset->kind) {
                'youtube' => 'Video de YouTube',
                'link' => 'Enlace externo',
                default => Str::headline($asset->kind),
            };

            if ($asset->kind === 'pdf' && $asset->extracted_pages) {
                foreach ($asset->extracted_pages as $page) {
                    $this->storeChunks($item, $asset, $label, (int) $page['page'], $page['text'] ?? '');
                }
            } elseif ($asset->extracted_text) {
                $this->storeChunks($item, $asset, $label, null, $asset->extracted_text);
            }

            if ($asset->transcript) {
                $this->storeChunks($item, $asset, $label.' - descripcion o transcripcion', null, $asset->transcript);
            }
        }
    }

    private function storeChunks(ContentItem $item, ?ContentAsset $asset, string $label, ?int $page, string $text): void
    {
        $text = trim(preg_replace('/\s+/u', ' ', $text) ?? '');
        if ($text === '') {
            return;
        }

        foreach ($this->split($text) as $index => $chunk) {
            $item->chunks()->create([
                'content_asset_id' => $asset?->id,
                'source_label' => $label,
                'page_number' => $page,
                'chunk_index' => $index,
                'text' => $chunk,
            ]);
        }
    }

    private function split(string $text): array
    {
        $size = (int) config('content.chunk_size', 900);
        $overlap = (int) config('content.chunk_overlap', 120);
        $chunks = [];
        $offset = 0;
        $length = mb_strlen($text);

        while ($offset < $length) {
            $chunk = mb_substr($text, $offset, $size);
            if ($offset + $size < $length) {
                $lastSpace = mb_strrpos($chunk, ' ');
                if ($lastSpace !== false && $lastSpace > $size * 0.65) {
                    $chunk = mb_substr($chunk, 0, $lastSpace);
                }
            }
            $chunks[] = trim($chunk);
            if ($offset + mb_strlen($chunk) >= $length) {
                break;
            }
            $offset += max(1, mb_strlen($chunk) - $overlap);
        }

        return array_values(array_filter($chunks));
    }
}
