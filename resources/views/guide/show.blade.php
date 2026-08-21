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

@php($sections = [
    'product' => ['productos', 'Productos', 'Informacion esencial de cada producto.'],
    'instruction' => ['indicaciones', 'Como utilizarlo', 'Indicaciones disponibles para una consulta clara.'],
    'video' => ['videos', 'Videos', 'Explicaciones y material audiovisual.'],
    'story' => ['historias', 'Experiencias', 'Historias compartidas por otros clientes.'],
])
@foreach($sections as $type => [$id, $title, $description])
<section id="{{ $id }}" class="guide-section">
    <div class="guide-section-head"><div><p class="eyebrow">{{ str_pad($loop->iteration, 2, '0', STR_PAD_LEFT) }}</p><h2>{{ $title }}</h2></div><p>{{ $description }}</p></div>
    <div class="guide-grid">
    @forelse($items->get($type, collect()) as $item)
        <article class="guide-item">
            @if($item->media_url)
                @if($type === 'video' && \Illuminate\Support\Str::endsWith(strtolower(parse_url($item->media_url, PHP_URL_PATH) ?? ''), ['.mp4', '.webm']))
                    <video controls preload="metadata"><source src="{{ $item->media_url }}"></video>
                @elseif($type === 'video')
                    <a class="media-link" href="{{ $item->media_url }}" target="_blank" rel="noopener">Abrir video</a>
                @else
                    <img src="{{ $item->media_url }}" alt="" loading="lazy">
                @endif
            @endif
            <span class="type">{{ $title }}</span><h3>{{ $item->title }}</h3>
            @if($item->summary)<p class="summary">{{ $item->summary }}</p>@endif
            <div class="body-copy">{!! nl2br(e($item->body)) !!}</div>
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
        <form class="chat-form"><label class="sr-only" for="question">Tu pregunta</label><input id="question" name="question" maxlength="500" placeholder="Escribe tu pregunta..." required><button class="button primary" type="submit">Enviar</button></form>
    </div>
</section>
</main>
<footer class="guide-footer"><strong>Vita Guia</strong><p>Esta informacion es educativa y no sustituye la atencion de un profesional de la salud.</p></footer>
</body>
</html>
