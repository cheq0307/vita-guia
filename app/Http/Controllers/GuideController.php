<?php

namespace App\Http\Controllers;

use App\Models\AccessLink;
use App\Models\ContentItem;
use Illuminate\Http\Request;

class GuideController extends Controller
{
    private function findLink(string $token): ?AccessLink
    {
        return AccessLink::with('advisor')->where('token_hash', hash('sha256', $token))->first();
    }

    private function isAvailableFor(Request $request, AccessLink $link): bool
    {
        if ($link->revoked || $link->expires_at->isPast()) {
            return false;
        }

        return $request->session()->has('opened_link_'.$link->id)
            || $link->max_opens === null
            || $link->open_count < $link->max_opens;
    }

    public function show(Request $request, string $token)
    {
        $link = $this->findLink($token);
        if (! $link) {
            return response()->view('guide.unavailable', ['reason' => 'El enlace no existe.'], 404);
        }
        if (! $this->isAvailableFor($request, $link)) {
            return response()->view('guide.unavailable', ['reason' => 'El enlace venció, fue revocado o alcanzó su límite.'], 410);
        }

        $sessionKey = 'opened_link_'.$link->id;
        if (! $request->session()->has($sessionKey)) {
            $link->increment('open_count');
            $link->forceFill([
                'first_opened_at' => $link->first_opened_at ?? now(),
                'last_opened_at' => now(),
            ])->save();
            $request->session()->put($sessionKey, true);
        }

        return view('guide.show', [
            'link' => $link,
            'token' => $token,
            'items' => ContentItem::where('active', true)->orderBy('sort_order')->orderBy('id')->get()->groupBy('type'),
        ]);
    }

    public function chat(Request $request, string $token)
    {
        $link = $this->findLink($token);
        abort_unless($link && $this->isAvailableFor($request, $link), 403);
        $question = trim($request->validate(['question' => ['required', 'string', 'max:500']])['question']);
        $words = collect(preg_split('/[^[:alnum:]áéíóúüñ]+/iu', mb_strtolower($question)))
            ->filter(fn ($word) => mb_strlen($word) >= 4)
            ->unique()
            ->take(8);

        $query = ContentItem::where('active', true);
        $query->where(function ($builder) use ($words) {
            foreach ($words as $word) {
                $builder->orWhere('title', 'like', '%'.$word.'%')
                    ->orWhere('summary', 'like', '%'.$word.'%')
                    ->orWhere('body', 'like', '%'.$word.'%');
            }
        });
        $matches = $words->isEmpty() ? collect() : $query->limit(3)->get();
        if ($matches->isEmpty()) {
            return response()->json(['answer' => 'No encontré esa respuesta en la información disponible. Consulta directamente con tu asesor.']);
        }

        $answer = $matches->map(fn ($item) => $item->title.': '.($item->summary ?: str($item->body)->limit(260)))->join("\n\n");

        return response()->json(['answer' => $answer]);
    }
}
