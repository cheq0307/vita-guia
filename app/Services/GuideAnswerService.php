<?php

namespace App\Services;

use App\Models\ContentChunk;
use Illuminate\Support\Str;

class GuideAnswerService
{
    public function answer(string $question, string $scope = 'all'): array
    {
        $words = collect(preg_split('/[^[:alnum:]áéíóúüñ]+/iu', mb_strtolower(trim($question))))
            ->filter(fn ($word) => mb_strlen($word) >= 4)
            ->reject(fn ($word) => in_array($word, ['como', 'cual', 'para', 'esta', 'este', 'esto', 'debo', 'puedo'], true))
            ->unique()
            ->take(8);

        if ($words->isEmpty()) {
            return $this->notFound();
        }

        $chunks = ContentChunk::with('contentItem')
            ->whereHas('contentItem', function ($query) use ($scope) {
                $query->where('active', true)->where('status', 'published');

                if (in_array($scope, ['health', 'business'], true)) {
                    $query->whereIn('topic', [$scope, 'mixed']);
                } elseif ($scope === 'mixed') {
                    $query->where('topic', 'mixed');
                }
            })
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

        return [
            'answer' => $answer,
            'mode' => 'extractive',
            'notice' => 'Fragmentos recuperados literalmente de la biblioteca aprobada.',
        ];
    }

    private function notFound(): array
    {
        return [
            'answer' => 'No encontré esa respuesta en la información aprobada. Consulta directamente con tu asesor.',
            'mode' => 'extractive',
        ];
    }
}
