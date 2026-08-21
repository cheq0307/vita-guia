<?php

use App\Models\ContentItem;
use App\Services\ContentIndexer;
use Illuminate\Support\Facades\Artisan;

Artisan::command('content:reindex', function (ContentIndexer $indexer) {
    $count = 0;
    ContentItem::with('assets')->chunkById(100, function ($items) use ($indexer, &$count) {
        foreach ($items as $item) {
            $indexer->reindex($item);
            $count++;
        }
    });

    $this->info("Contenido reindexado: {$count}");
})->purpose('Reconstruye los fragmentos consultables por el chat');
