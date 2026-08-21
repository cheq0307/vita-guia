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
            'advisors' => User::where('role', 'advisor')->latest()->get(),
            'stats' => [
                'advisors' => User::where('role', 'advisor')->where('active', true)->count(),
                'links' => AccessLink::where('revoked', false)->where('expires_at', '>', now())->count(),
                'opens' => AccessLink::sum('open_count'),
                'content' => ContentItem::where('active', true)->count(),
            ],
        ]);
    }

    public function storeAdvisor(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:160'],
            'email' => ['required', 'email', 'max:190', 'unique:users,email'],
            'password' => ['required', 'string', 'min:10'],
        ]);
        User::create($data + ['role' => 'advisor', 'active' => true]);

        return back()->with('success', 'Asesor creado correctamente.');
    }

    public function toggleAdvisor(User $user)
    {
        abort_unless($user->role === 'advisor', 404);
        $user->update(['active' => ! $user->active]);

        return back()->with('success', 'Estado del asesor actualizado.');
    }

    public function content()
    {
        return view('admin.content', ['items' => ContentItem::orderBy('sort_order')->latest()->get()]);
    }

    public function storeContent(Request $request)
    {
        $data = $request->validate([
            'type' => ['required', 'in:product,instruction,video,story'],
            'title' => ['required', 'string', 'max:190'],
            'summary' => ['nullable', 'string', 'max:500'],
            'body' => ['required', 'string'],
            'media_url' => ['nullable', 'url', 'max:500'],
            'media_file' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,mp4,webm', 'max:102400'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);
        $data['summary'] ??= '';
        $data['sort_order'] ??= 0;
        if ($request->hasFile('media_file')) {
            $data['media_url'] = Storage::url($request->file('media_file')->store('content', 'public'));
        }
        unset($data['media_file']);
        ContentItem::create($data);

        return back()->with('success', 'Contenido guardado.');
    }

    public function destroyContent(ContentItem $item)
    {
        if ($item->media_url && str_starts_with($item->media_url, '/storage/')) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $item->media_url));
        }
        $item->delete();

        return back()->with('success', 'Contenido eliminado.');
    }
}
