<?php

namespace App\Services;

use App\Models\ContentAsset;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class PdfTextExtractor
{
    public function extract(ContentAsset $asset): array
    {
        if ($asset->kind !== 'pdf' || ! $asset->storage_path) {
            return [];
        }

        $asset->update(['extraction_status' => 'pending']);
        $command = [
            config('content.python_path'),
            base_path('tools/extract_pdf.py'),
            Storage::disk('local')->path($asset->storage_path),
        ];

        $pipes = [];
        $process = proc_open($command, [
            1 => ['pipe', 'w'],
            2 => ['pipe', 'w'],
        ], $pipes, base_path());

        if (! is_resource($process)) {
            $asset->update(['extraction_status' => 'failed']);
            throw new RuntimeException('No se pudo iniciar el extractor de PDF.');
        }

        $output = stream_get_contents($pipes[1]);
        $error = stream_get_contents($pipes[2]);
        fclose($pipes[1]);
        fclose($pipes[2]);
        $exitCode = proc_close($process);

        $result = json_decode($output, true);
        if ($exitCode !== 0 || ! is_array($result)) {
            $asset->update(['extraction_status' => 'failed']);
            throw new RuntimeException('No se pudo extraer el PDF: '.trim($error));
        }

        $pages = collect($result['pages'] ?? []);
        $text = $pages->pluck('text')->filter()->join('

');
        $pageCount = (int) ($result['page_count'] ?? $pages->count());
        $pagesWithText = (int) ($result['pages_with_text'] ?? $pages->where('text', '!=', '')->count());

        $asset->update([
            'extracted_text' => $text,
            'extracted_pages' => $pages->all(),
            'page_count' => $pageCount,
            'extraction_status' => $pagesWithText === $pageCount ? 'ready' : 'partial',
        ]);

        return $pages->all();
    }
}
