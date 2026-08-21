<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Guia para {{ $link->recipient_name }} | Vita Guia</title>
    <link rel="stylesheet" href="{{ asset('assets/app.css') }}"><script src="{{ asset('assets/app.js') }}" defer></script>
</head>
<body class="guide-page">
<header class="guide-header"><a class="brand" href="#"><span class="brand-mark">V</span><span>Vita Guia</span></a><span>Enlace vigente hasta {{ $link->expires_at->format('d/m/Y H:i') }}</span></header>
<main>
<section class="guide-hero"><div><p class="eyebrow">Informacion preparada para ti</p><h1>Hola, {{ $link->recipient_name }}</h1><p>Aqui encontraras los productos, indicaciones y experiencias que tu asesor selecciono para resolver tus dudas.</p><div class="advisor-line"><span>Tu asesor</span><strong>{{ $link->advisor->name }}</strong></div></div></section>
<nav class="guide-tabs"><a href="#productos">Productos</a><a href="#indicaciones">Como usarlo</a><a href="#videos">Videos</a><a href="#historias">Experiencias</a><a href="#asistente">Preguntar</a></nav>
<div class="topic-filter-bar"><div class="topic-filters" data-topic-filters aria-label="Filtrar por tema"><button type="button" class="is-active" data-topic-filter="all" aria-pressed="true">Todo</button><button type="button" data-topic-filter="health" aria-pressed="false">Salud</button><button type="button" data-topic-filter="business" aria-pressed="false">Negocios</button><button type="button" data-topic-filter="mixed" aria-pressed="false">Mixto</button></div></div>

@php($sections = [
    'product' => ['productos', 'Productos', 'Informacion esencial de cada producto.'],
    'instruction' => ['indicaciones', 'Como utilizarlo', 'Indicaciones disponibles para una consulta clara.'],
    'video' => ['videos', 'Videos', 'Explicaciones y material audiovisual.'],
    'story' => ['historias', 'Experiencias', 'Historias compartidas por otros clientes.'],
])
@foreach($sections as $type => [$id, $title, $description])
<section id="{{ $id }}" class="guide-section" data-topic-section>
    <div class="guide-section-head"><div><p class="eyebrow">{{ str_pad($loop->iteration, 2, '0', STR_PAD_LEFT) }}</p><h2>{{ $title }}</h2></div><p>{{ $description }}</p></div>
    <div class="guide-grid">
    @forelse($items->get($type, collect()) as $item)
        <article class="guide-item" data-topic="{{ $item->topic }}">
            @if($item->media_url)
                @if($type === 'video' && \Illuminate\Support\Str::endsWith(strtolower(parse_url($item->media_url, PHP_URL_PATH) ?? ''), ['.mp4', '.webm']))
                    <video controls preload="metadata"><source src="{{ $item->media_url }}"></video>
                @elseif($type === 'video')
                    <a class="media-link" href="{{ $item->media_url }}" target="_blank" rel="noopener">Abrir video</a>
                @else
                    <img src="{{ $item->media_url }}" alt="" loading="lazy">
                @endif
            @endif
            @foreach($item->assets as $asset)
                @if($asset->kind === 'image')
                    <img src="{{ route('guide.asset', [$token, $asset]) }}" alt="{{ $item->title }}" loading="lazy">
                @elseif($asset->kind === 'video')
                    <video controls preload="metadata"><source src="{{ route('guide.asset', [$token, $asset]) }}" type="{{ $asset->mime_type }}"></video>
                @elseif($asset->kind === 'pdf')
                    <a class="document-link" href="{{ route('guide.asset', [$token, $asset]) }}" target="_blank"><span>PDF</span><div><strong>{{ $asset->original_name }}</strong><small>{{ $asset->page_count ? $asset->page_count.' paginas' : 'Documento' }}</small></div></a>
                @elseif($asset->kind === 'youtube' && $asset->youtubeEmbedUrl())
                    <div class="video-embed"><iframe src="{{ $asset->youtubeEmbedUrl() }}" title="{{ $item->title }}" loading="lazy" allow="accelerometer; autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>
                @elseif($asset->external_url)
                    <a class="media-link" href="{{ $asset->external_url }}" target="_blank" rel="noopener">Abrir recurso</a>
                @endif
            @endforeach
            <div class="meta-line"><span class="type">{{ $title }}</span><span class="topic {{ $item->topic }}">{{ ['health'=>'Salud','business'=>'Negocios','mixed'=>'Mixto'][$item->topic] }}</span></div><h3>{{ $item->title }}</h3>
            @if($item->summary)<p class="summary">{{ $item->summary }}</p>@endif
            <div class="body-copy">{!! nl2br(e($item->body)) !!}</div>
            @foreach($item->assets->whereNotNull('transcript') as $asset)
                @if(trim($asset->transcript))
                <details class="resource-notes"><summary>Descripcion o transcripcion de {{ $asset->original_name ?: 'este recurso' }}</summary><p>{!! nl2br(e($asset->transcript)) !!}</p></details>
                @endif
            @endforeach
        </article>
    @empty
        <p class="empty">Tu asesor agregara informacion en esta seccion.</p>
    @endforelse
    </div>
</section>
@endforeach

<section id="asistente" class="assistant-section">
    <div><p class="eyebrow">Asistente Vita</p><h2>Pregunta sobre esta informacion</h2><p>Las respuestas se obtienen solamente del contenido publicado en esta guia.</p></div>
    <div class="chat" data-chat data-endpoint="{{ route('guide.chat', $token) }}">
        <div class="chat-messages" aria-live="polite"><div class="message bot">Hola. Escribe una duda sobre los productos o sus indicaciones.</div></div>
        <form class="chat-form"><div><label class="sr-only" for="scope">Tema</label><select id="scope" name="scope" aria-label="Tema de la pregunta"><option value="all">Todos los temas</option><option value="health">Salud</option><option value="business">Negocios</option><option value="mixed">Mixto</option></select></div><label class="sr-only" for="question">Tu pregunta</label><input id="question" name="question" maxlength="500" placeholder="Escribe tu pregunta..." required><button class="button primary" type="submit">Enviar</button></form>
    </div>
</section>
</main>
<footer class="guide-footer"><strong>Vita Guia</strong><p>Esta informacion es educativa y no sustituye la atencion de un profesional de la salud.</p></footer>
</body>
</html>
