<?php

namespace App\Http\Controllers;

use App\Models\ContentAsset;
use App\Models\ContentItem;
use App\Services\ContentAssetService;
use App\Services\ContentIndexer;
use Illuminate\Http\Request;

class ProfessionalController extends Controller
{
    public function __construct(
        private readonly ContentAssetService $assetService,
        private readonly ContentIndexer $indexer,
    ) {}

    public function dashboard(Request $request)
    {
        return view('professional.dashboard', [
            'items' => $request->user()->authoredContent()->with(['reviewer', 'assets'])->latest()->get(),
            'stats' => $request->user()->authoredContent()
                ->selectRaw('status, COUNT(*) as total')
                ->groupBy('status')
                ->pluck('total', 'status'),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->prepareSubmission($request, $this->validatedContent($request));
        $data['author_id'] = $request->user()->id;
        $item = ContentItem::create($this->onlyContentFields($data));

        $this->storeResources($request, $item);
        $this->indexer->reindex($item);

        return back()->with('success', $data['status'] === 'review' ? 'Contenido enviado a revision.' : 'Borrador guardado.');
    }

    public function edit(Request $request, ContentItem $item)
    {
        abort_unless($item->isEditableBy($request->user()), 403);
        $item->load('assets');

        return view('professional.edit', compact('item'));
    }

    public function update(Request $request, ContentItem $item)
    {
        abort_unless($item->isEditableBy($request->user()), 403);
        $data = $this->prepareSubmission($request, $this->validatedContent($request));
        $item->update($this->onlyContentFields($data));

        $this->storeResources($request, $item);
        $this->indexer->reindex($item);

        return redirect()->route('professional.dashboard')
            ->with('success', $data['status'] === 'review' ? 'Contenido reenviado a revision.' : 'Borrador actualizado.');
    }

    public function destroyAsset(Request $request, ContentAsset $asset)
    {
        $item = $asset->contentItem;
        abort_unless($item->isEditableBy($request->user()), 403);
        $this->assetService->delete($asset);
        $this->indexer->reindex($item);

        return back()->with('success', 'Recurso eliminado.');
    }

    public function destroy(Request $request, ContentItem $item)
    {
        abort_unless($item->isEditableBy($request->user()), 403);
        foreach ($item->assets as $asset) {
            $this->assetService->delete($asset);
        }
        $item->delete();

        return back()->with('success', 'Borrador eliminado.');
    }

    private function prepareSubmission(Request $request, array $data): array
    {
        $data['summary'] ??= '';
        $data['sort_order'] ??= 0;
        $data['status'] = $request->input('action') === 'submit' ? 'review' : 'draft';
        $data['active'] = false;
        $data['submitted_at'] = $data['status'] === 'review' ? now() : null;
        $data['reviewer_id'] = null;
        $data['review_notes'] = null;
        $data['reviewed_at'] = null;

        return $data;
    }

    private function storeResources(Request $request, ContentItem $item): void
    {
        $this->assetService->attachUploads(
            $item,
            $request->file('media_files', []),
            $request->input('resource_notes'),
        );
        $this->assetService->attachExternal(
            $item,
            $request->input('external_url'),
            $request->input('external_kind'),
            $request->input('resource_notes'),
        );
    }

    private function validatedContent(Request $request): array
    {
        return $request->validate([
            'type' => ['required', 'in:product,instruction,video,story'],
            'topic' => ['required', 'in:health,business,mixed'],
            'title' => ['required', 'string', 'max:190'],
            'summary' => ['nullable', 'string', 'max:500'],
            'body' => ['required', 'string'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'media_files' => ['nullable', 'array', 'max:8'],
            'media_files.*' => ['file', 'mimes:jpg,jpeg,png,webp,mp4,webm,pdf', 'max:'.config('content.max_upload_kb')],
            'external_kind' => ['nullable', 'in:youtube,link'],
            'external_url' => ['nullable', 'url', 'max:1000', 'required_with:external_kind'],
            'resource_notes' => ['nullable', 'string', 'max:20000'],
            'action' => ['required', 'in:draft,submit'],
        ]);
    }

    private function onlyContentFields(array $data): array
    {
        return collect($data)->only([
            'type', 'topic', 'title', 'summary', 'body', 'sort_order', 'author_id',
            'status', 'active', 'submitted_at', 'reviewer_id', 'review_notes', 'reviewed_at',
        ])->all();
    }
}
