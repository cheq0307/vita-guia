<?php

namespace App\Services;

use App\Models\ContentAsset;
use App\Models\ContentItem;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

class ContentAssetService
{
    public function __construct(private readonly PdfTextExtractor $pdfExtractor) {}

    public function attachUploads(ContentItem $item, array $files, ?string $notes = null): array
    {
        $assets = [];

        foreach ($files as $file) {
            if (! $file instanceof UploadedFile) {
                continue;
            }

            $kind = $this->kindFromMime($file->getMimeType() ?: '');
            $extension = strtolower($file->getClientOriginalExtension() ?: $file->extension() ?: 'bin');
            $path = $file->storeAs('content-assets', Str::uuid().'.'.$extension, 'local');

            $asset = $item->assets()->create([
                'kind' => $kind,
                'storage_path' => $path,
                'original_name' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType() ?: '',
                'size_bytes' => $file->getSize() ?: 0,
                'transcript' => $notes,
                'extraction_status' => $kind === 'pdf' ? 'pending' : 'not_needed',
            ]);

            if ($kind === 'pdf') {
                try {
                    $this->pdfExtractor->extract($asset);
                } catch (Throwable) {
                    $asset->refresh();
                }
            }

            $assets[] = $asset->fresh();
        }

        return $assets;
    }

    public function attachExternal(ContentItem $item, ?string $url, ?string $kind, ?string $notes = null): ?ContentAsset
    {
        if (! $url || ! in_array($kind, ['youtube', 'link'], true)) {
            return null;
        }

        return $item->assets()->create([
            'kind' => $kind,
            'external_url' => $url,
            'original_name' => $kind === 'youtube' ? 'Video de YouTube' : parse_url($url, PHP_URL_HOST),
            'transcript' => $notes,
            'extraction_status' => 'not_needed',
        ]);
    }

    public function delete(ContentAsset $asset): void
    {
        if ($asset->storage_path) {
            Storage::disk('local')->delete($asset->storage_path);
        }

        $asset->delete();
    }

    private function kindFromMime(string $mime): string
    {
        return match (true) {
            $mime === 'application/pdf' => 'pdf',
            str_starts_with($mime, 'image/') => 'image',
            str_starts_with($mime, 'video/') => 'video',
            default => 'link',
        };
    }
}
