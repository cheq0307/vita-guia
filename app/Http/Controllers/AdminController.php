<?php

namespace App\Http\Controllers;

use App\Models\AccessLink;
use App\Models\ContentItem;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminController extends Controller
{
    public function dashboard()
    {
        return view('admin.dashboard', [
            'users' => User::whereIn('role', ['advisor', 'professional'])->latest()->get(),
            'stats' => [
                'advisors' => User::where('role', 'advisor')->where('active', true)->count(),
                'professionals' => User::where('role', 'professional')->where('active', true)->count(),
                'links' => AccessLink::where('revoked', false)->where('expires_at', '>', now())->count(),
                'pending' => ContentItem::where('status', 'review')->count(),
            ],
        ]);
    }

    public function storeUser(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:160'],
            'email' => ['required', 'email', 'max:190', 'unique:users,email'],
            'password' => ['required', 'string', 'min:10'],
            'role' => ['required', 'in:advisor,professional'],
        ]);
        User::create($data + ['active' => true]);

        return back()->with('success', $data['role'] === 'professional' ? 'Profesional creado correctamente.' : 'Asesor creado correctamente.');
    }

    public function toggleUser(User $user)
    {
        abort_unless(in_array($user->role, ['advisor', 'professional'], true), 404);
        $user->update(['active' => ! $user->active]);

        return back()->with('success', 'Estado del usuario actualizado.');
    }

    public function content()
    {
        return view('admin.content', [
            'items' => ContentItem::with(['author', 'reviewer'])
                ->orderByRaw("CASE status WHEN 'review' THEN 0 WHEN 'rejected' THEN 1 WHEN 'published' THEN 2 ELSE 3 END")
                ->orderBy('sort_order')
                ->latest()
                ->get(),
        ]);
    }

    public function storeContent(Request $request)
    {
        $data = $this->validatedContent($request);
        $data['summary'] ??= '';
        $data['sort_order'] ??= 0;
        $data['author_id'] = $request->user()->id;
        $data['reviewer_id'] = $request->user()->id;
        $data['status'] = 'published';
        $data['reviewed_at'] = now();

        if ($request->hasFile('media_file')) {
            $data['media_url'] = Storage::url($request->file('media_file')->store('content', 'public'));
        }
        unset($data['media_file']);
        ContentItem::create($data);

        return back()->with('success', 'Contenido publicado.');
    }

    public function approveContent(Request $request, ContentItem $item)
    {
        abort_unless($item->status === 'review', 422);
        $item->update([
            'status' => 'published',
            'active' => true,
            'reviewer_id' => $request->user()->id,
            'review_notes' => null,
            'reviewed_at' => now(),
        ]);

        return back()->with('success', 'Contenido aprobado y publicado.');
    }

    public function rejectContent(Request $request, ContentItem $item)
    {
        abort_unless($item->status === 'review', 422);
        $data = $request->validate(['review_notes' => ['required', 'string', 'max:1000']]);
        $item->update([
            'status' => 'rejected',
            'active' => false,
            'reviewer_id' => $request->user()->id,
            'review_notes' => $data['review_notes'],
            'reviewed_at' => now(),
        ]);

        return back()->with('success', 'Contenido devuelto al profesional con observaciones.');
    }

    public function destroyContent(ContentItem $item)
    {
        if ($item->media_url && str_starts_with($item->media_url, '/storage/')) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $item->media_url));
        }
        $item->delete();

        return back()->with('success', 'Contenido eliminado.');
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
        ]);
    }
}
