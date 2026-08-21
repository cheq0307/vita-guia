<?php

namespace App\Http\Controllers;

use App\Models\AccessLink;
use App\Models\ContentChunk;
use App\Models\ContentItem;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

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
            'items' => ContentItem::with('assets')
                ->where('active', true)
                ->where('status', 'published')
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get()
                ->groupBy('type'),
        ]);
    }

    public function chat(Request $request, string $token)
    {
        $link = $this->findLink($token);
        abort_unless($link && $this->isAvailableFor($request, $link), 403);
        $question = trim($request->validate(['question' => ['required', 'string', 'max:500']])['question']);
        $words = collect(preg_split('/[^[:alnum:]áéíóúüñ]+/iu', mb_strtolower($question)))
            ->filter(fn ($word) => mb_strlen($word) >= 4)
            ->reject(fn ($word) => in_array($word, ['como', 'cual', 'para', 'esta', 'este', 'esto', 'debo', 'puedo'], true))
            ->unique()
            ->take(8);

        if ($words->isEmpty()) {
            return $this->notFound();
        }

        $chunks = ContentChunk::with('contentItem')
            ->whereHas('contentItem', fn ($query) => $query->where('active', true)->where('status', 'published'))
            ->where(function ($query) use ($words) {
                foreach ($words as $word) {
                    $query->orWhere('text', 'like', '%'.$word.'%');
                }
            })
            ->limit(60)
            ->get()
            ->map(function (ContentChunk $chunk) use ($words) {
                $haystack = mb_strtolower($chunk->text);
                $chunk->match_score = $words->sum(fn ($word) => substr_count($haystack, $word));

                return $chunk;
            })
            ->sortByDesc('match_score')
            ->take(4);

        if ($chunks->isEmpty()) {
            return $this->notFound();
        }

        $answer = $chunks->map(function (ContentChunk $chunk) {
            $source = $chunk->source_label;
            if ($chunk->page_number) {
                $source .= ', pagina '.$chunk->page_number;
            }

            return 'Fuente: '.$source.'
'.Str::limit($chunk->text, 520);
        })->join('

');

        return response()->json([
            'answer' => $answer,
            'mode' => 'extractive',
            'notice' => 'Fragmentos recuperados literalmente de la biblioteca aprobada.',
        ]);
    }

    private function notFound()
    {
        return response()->json([
            'answer' => 'No encontré esa respuesta en la información aprobada. Consulta directamente con tu asesor.',
            'mode' => 'extractive',
        ]);
    }
}
