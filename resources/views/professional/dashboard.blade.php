@extends('layouts.app')
@section('title', 'Mis contenidos | Vita Guia')
@section('content')
<div class="page-heading"><div><p class="eyebrow">Area profesional</p><h1>Mis contenidos</h1></div></div>
<section class="stats editorial-stats">
    <div><strong>{{ $stats->get('draft', 0) }}</strong><span>borradores</span></div>
    <div><strong>{{ $stats->get('review', 0) }}</strong><span>en revision</span></div>
    <div><strong>{{ $stats->get('published', 0) }}</strong><span>publicados</span></div>
    <div><strong>{{ $stats->get('rejected', 0) }}</strong><span>por corregir</span></div>
</section>
<div class="split">
    <section class="content-list">
        @forelse($items as $item)
        <article class="content-row">
            <div class="content-main">
                <div class="meta-line"><span class="type">{{ ['product'=>'Producto','instruction'=>'Indicacion','video'=>'Video','story'=>'Testimonio'][$item->type] }}</span><span class="status {{ $item->status }}">{{ ['draft'=>'Borrador','review'=>'En revision','published'=>'Publicado','rejected'=>'Por corregir'][$item->status] }}</span></div>
                <h3>{{ $item->title }}</h3>@if($item->assets->isNotEmpty())<span class="asset-count">{{ $item->assets->count() }} recursos adjuntos</span>@endif<p>{{ $item->summary ?: \Illuminate\Support\Str::limit($item->body, 150) }}</p>
                @if($item->review_notes)<div class="review-note"><strong>Observaciones del administrador:</strong> {{ $item->review_notes }}</div>@endif
            </div>
            @if(in_array($item->status, ['draft', 'rejected']))
            <div class="row-actions">
                <a class="button subtle" href="{{ route('professional.content.edit', $item) }}">Editar</a>
                <form method="POST" action="{{ route('professional.content.destroy', $item) }}" onsubmit="return confirm('Eliminar este borrador?')">@csrf @method('DELETE')<button class="button danger" type="submit">Eliminar</button></form>
            </div>
            @endif
        </article>
        @empty<div class="empty">Todavia no has preparado contenido.</div>@endforelse
    </section>
    <aside class="panel">
        <h2>Nuevo contenido</h2>
        <p class="hint">Puedes conservarlo como borrador o enviarlo al administrador.</p>
        <form class="stack" method="POST" action="{{ route('professional.content.store') }}" enctype="multipart/form-data">@csrf
            @include('professional.partials.form')
        </form>
    </aside>
</div>
@endsection
