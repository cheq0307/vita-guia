<?php

namespace App\Http\Controllers;

use App\Models\ContentItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProfessionalController extends Controller
{
    public function dashboard(Request $request)
    {
        return view('professional.dashboard', [
            'items' => $request->user()->authoredContent()->with('reviewer')->latest()->get(),
            'stats' => $request->user()->authoredContent()
                ->selectRaw('status, COUNT(*) as total')
                ->groupBy('status')
                ->pluck('total', 'status'),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validatedContent($request);
        $data = $this->prepareSubmission($request, $data);
        $data['author_id'] = $request->user()->id;

        ContentItem::create($data);

        return back()->with('success', $data['status'] === 'review' ? 'Contenido enviado a revision.' : 'Borrador guardado.');
    }

    public function edit(Request $request, ContentItem $item)
    {
        abort_unless($item->isEditableBy($request->user()), 403);

        return view('professional.edit', compact('item'));
    }

    public function update(Request $request, ContentItem $item)
    {
        abort_unless($item->isEditableBy($request->user()), 403);
        $data = $this->validatedContent($request);
        $data = $this->prepareSubmission($request, $data, $item);
        $item->update($data);

        return redirect()->route('professional.dashboard')
            ->with('success', $data['status'] === 'review' ? 'Contenido reenviado a revision.' : 'Borrador actualizado.');
    }

    public function destroy(Request $request, ContentItem $item)
    {
        abort_unless($item->isEditableBy($request->user()), 403);
        $this->deleteLocalMedia($item->media_url);
        $item->delete();

        return back()->with('success', 'Borrador eliminado.');
    }

    private function prepareSubmission(Request $request, array $data, ?ContentItem $item = null): array
    {
        $data['summary'] ??= '';
        $data['sort_order'] ??= 0;
        $data['status'] = $request->input('action') === 'submit' ? 'review' : 'draft';
        $data['active'] = false;
        $data['submitted_at'] = $data['status'] === 'review' ? now() : null;
        $data['reviewer_id'] = null;
        $data['review_notes'] = null;
        $data['reviewed_at'] = null;

        if ($request->hasFile('media_file')) {
            $this->deleteLocalMedia($item?->media_url);
            $data['media_url'] = Storage::url($request->file('media_file')->store('content', 'public'));
        } elseif (empty($data['media_url'])) {
            unset($data['media_url']);
        }

        unset($data['media_file'], $data['action']);

        return $data;
    }

    private function validatedContent(Request $request): array
    {
        return $request->validate([
            'type' => ['required', 'in:product,instruction,video,story'],
            'title' => ['required', 'string', 'max:190'],
            'summary' => ['nullable', 'string', 'max:500'],
            'body' => ['required', 'string'],
            'media_url' => ['nullable', 'url', 'max:500'],
            'media_file' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,mp4,webm', 'max:102400'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'action' => ['required', 'in:draft,submit'],
        ]);
    }

    private function deleteLocalMedia(?string $mediaUrl): void
    {
        if ($mediaUrl && str_starts_with($mediaUrl, '/storage/')) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $mediaUrl));
        }
    }
}
