@extends('layouts.app')
@section('title', 'Biblioteca publicada | Vita Guia')
@section('content')
<div class="page-heading"><div><p class="eyebrow">Consulta interna</p><h1>Biblioteca publicada</h1><p class="hint">La misma informacion aprobada que reciben los clientes.</p></div></div>

<div class="library-workspace">
<nav class="guide-tabs" data-guide-modules aria-label="Modulos de la biblioteca"><button type="button" data-module-target="productos">Productos</button><button type="button" data-module-target="indicaciones">Como usarlo</button><button type="button" data-module-target="videos">Videos</button><button type="button" data-module-target="historias">Experiencias</button><button type="button" data-module-target="asistente">Preguntar</button></nav>
<div class="topic-filter-bar" data-topic-filter-bar><div class="topic-filters" data-topic-filters aria-label="Filtrar por tema"><button type="button" class="is-active" data-topic-filter="all" aria-pressed="true">Todo</button><button type="button" data-topic-filter="health" aria-pressed="false">Salud</button><button type="button" data-topic-filter="business" aria-pressed="false">Negocios</button><button type="button" data-topic-filter="mixed" aria-pressed="false">Mixto</button></div></div>

@php($sections = [
    'product' => ['productos', 'Productos', 'Informacion esencial de cada producto.'],
    'instruction' => ['indicaciones', 'Como utilizarlo', 'Indicaciones disponibles para una consulta clara.'],
    'video' => ['videos', 'Videos', 'Explicaciones y material audiovisual.'],
    'story' => ['historias', 'Experiencias', 'Historias compartidas por clientes y profesionales.'],
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
                    <img src="{{ route('assets.staff', $asset) }}" alt="{{ $item->title }}" loading="lazy">
                @elseif($asset->kind === 'video')
                    <video controls preload="metadata"><source src="{{ route('assets.staff', $asset) }}" type="{{ $asset->mime_type }}"></video>
                @elseif($asset->kind === 'pdf')
                    <a class="document-link" href="{{ route('assets.staff', $asset) }}" target="_blank"><span>PDF</span><div><strong>{{ $asset->original_name }}</strong><small>{{ $asset->page_count ? $asset->page_count.' paginas' : 'Documento' }}</small></div></a>
                @elseif($asset->kind === 'youtube' && $asset->youtubeEmbedUrl())
                    <div class="video-embed"><iframe src="{{ $asset->youtubeEmbedUrl() }}" title="{{ $item->title }}" loading="lazy" allow="accelerometer; autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>
                @elseif($asset->external_url)
                    <a class="media-link" href="{{ $asset->external_url }}" target="_blank" rel="noopener">Abrir recurso</a>
                @endif
            @endforeach
            <div class="meta-line"><span class="type">{{ $title }}</span><span class="topic {{ $item->topic }}">{{ ['health'=>'Salud','business'=>'Negocios','mixed'=>'Mixto'][$item->topic] }}</span></div>
            <h3>{{ $item->title }}</h3>
            @if($item->summary)<p class="summary">{{ $item->summary }}</p>@endif
            <div class="body-copy">{!! nl2br(e($item->body)) !!}</div>
            @if($item->author?->isProfessional())
                <div class="professional-contact"><span>Contacto profesional</span><strong>{{ $item->author->name }}</strong><a href="mailto:{{ $item->author->email }}">{{ $item->author->email }}</a></div>
            @endif
            @foreach($item->assets->whereNotNull('transcript') as $asset)
                @if(trim($asset->transcript))
                <details class="resource-notes"><summary>Descripcion o transcripcion de {{ $asset->original_name ?: 'este recurso' }}</summary><p>{!! nl2br(e($asset->transcript)) !!}</p></details>
                @endif
            @endforeach
        </article>
    @empty
        <p class="empty">Todavia no hay informacion publicada en este modulo.</p>
    @endforelse
    </div>
</section>
@endforeach

<section class="guide-empty-state" data-topic-empty hidden><p class="eyebrow">Sin resultados</p><h2>No hay contenido publicado para este tema.</h2><p>Prueba con Todo o selecciona otro tema.</p></section>

<section id="asistente" class="assistant-section" data-assistant-section>
    <div><p class="eyebrow">Consulta interna</p><h2>Pregunta sobre la biblioteca</h2><p>Las respuestas se obtienen solamente del contenido publicado.</p></div>
    <div class="chat" data-chat data-endpoint="{{ route('library.chat') }}">
        <div class="chat-messages" aria-live="polite"><div class="message bot">Escribe una duda sobre la informacion aprobada.</div></div>
        <form class="chat-form"><div><label class="sr-only" for="scope">Tema</label><select id="scope" name="scope" aria-label="Tema de la pregunta"><option value="all">Todos los temas</option><option value="health">Salud</option><option value="business">Negocios</option><option value="mixed">Mixto</option></select></div><label class="sr-only" for="question">Tu pregunta</label><input id="question" name="question" maxlength="500" placeholder="Escribe tu pregunta..." required><button class="button primary" type="submit">Enviar</button></form>
    </div>
</section>
</div>
@endsection
