<?php

namespace App\Http\Controllers;

use App\Models\ContentItem;
use App\Services\GuideAnswerService;
use Illuminate\Http\Request;

class LibraryController extends Controller
{
    public function __construct(private readonly GuideAnswerService $answers) {}

    public function show(Request $request)
    {
        abort_unless($request->user()->active, 403);

        return view('library.show', [
            'items' => ContentItem::with(['assets', 'author'])
                ->where('active', true)
                ->where('status', 'published')
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get()
                ->groupBy('type'),
        ]);
    }

    public function chat(Request $request)
    {
        abort_unless($request->user()->active, 403);
        $data = $request->validate([
            'question' => ['required', 'string', 'max:500'],
            'scope' => ['nullable', 'in:all,health,business,mixed'],
        ]);

        return response()->json($this->answers->answer(
            $data['question'],
            $data['scope'] ?? 'all',
        ));
    }
}
