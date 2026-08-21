<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ContentAsset;
use App\Models\ContentItem;
use App\Services\GuideAnswerService;
use Illuminate\Http\Request;

class GuideController extends Controller
{
    public function __construct(private readonly GuideAnswerService $answers) {}

    public function show(Request $request)
    {
        $session = $request->attributes->get('clientAccessSession');
        $link = $session->accessLink;
        $items = ContentItem::with('assets')
            ->where('active', true)
            ->where('status', 'published')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->groupBy('type');

        $modules = collect([
            'product' => ['id' => 'products', 'label' => 'Productos'],
            'instruction' => ['id' => 'instructions', 'label' => 'Como usarlo'],
            'video' => ['id' => 'videos', 'label' => 'Videos'],
            'story' => ['id' => 'stories', 'label' => 'Experiencias'],
        ])->map(function (array $module, string $type) use ($items) {
            return $module + [
                'type' => $type,
                'items' => $items->get($type, collect())->map(fn (ContentItem $item) => $this->item($item))->values(),
            ];
        })->values();

        return response()->json([
            'data' => [
                'client' => [
                    'name' => $link->recipient_name,
                    'advisor_name' => $link->advisor->name,
                ],
                'access' => [
                    'expires_at' => $link->expires_at->toIso8601String(),
                ],
                'topics' => [
                    ['id' => 'all', 'label' => 'Todo'],
                    ['id' => 'health', 'label' => 'Salud', 'includes' => ['health', 'mixed']],
                    ['id' => 'business', 'label' => 'Negocios', 'includes' => ['business', 'mixed']],
                    ['id' => 'mixed', 'label' => 'Mixto', 'includes' => ['mixed']],
                ],
                'modules' => $modules,
            ],
        ]);
    }

    public function chat(Request $request)
    {
        $data = $request->validate([
            'question' => ['required', 'string', 'max:500'],
            'scope' => ['nullable', 'in:all,health,business,mixed'],
        ]);

        return response()->json($this->answers->answer(
            $data['question'],
            $data['scope'] ?? 'all',
        ));
    }

    private function item(ContentItem $item): array
    {
        return [
            'id' => $item->id,
            'type' => $item->type,
            'topic' => $item->topic,
            'title' => $item->title,
            'summary' => $item->summary,
            'body' => $item->body,
            'sort_order' => $item->sort_order,
            'assets' => $item->assets->map(fn (ContentAsset $asset) => [
                'id' => $asset->id,
                'kind' => $asset->kind,
                'name' => $asset->original_name,
                'mime_type' => $asset->mime_type,
                'size_bytes' => $asset->size_bytes,
                'page_count' => $asset->page_count,
                'url' => $asset->storage_path ? route('api.v1.assets.show', $asset, false) : null,
                'external_url' => $asset->external_url,
                'youtube_embed_url' => $asset->youtubeEmbedUrl(),
                'description_or_transcript' => $asset->transcript,
            ])->values(),
        ];
    }
}
