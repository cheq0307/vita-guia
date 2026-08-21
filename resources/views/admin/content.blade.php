@extends('layouts.app')
@section('title', 'Revision de contenido | Vita Guia')
@section('content')
<div class="page-heading"><div><p class="eyebrow">Biblioteca editorial</p><h1>Revision de contenido</h1></div><span>{{ $items->where('status', 'review')->count() }} pendientes</span></div>
<div class="split">
    <section class="content-list">
        @forelse($items as $item)
        <article class="content-row">
            <div class="content-main">
                <div class="meta-line">
                    <span class="type">{{ ['product'=>'Producto','instruction'=>'Indicacion','video'=>'Video','story'=>'Testimonio'][$item->type] }}</span>
                    <span class="topic {{ $item->topic }}">{{ ['health'=>'Salud','business'=>'Negocios','mixed'=>'Mixto'][$item->topic] }}</span>
                    <span class="status {{ $item->status }}">{{ ['draft'=>'Borrador','review'=>'En revision','published'=>'Publicado','rejected'=>'Rechazado'][$item->status] }}</span>
                </div>
                <h3>{{ $item->title }}</h3>
                <p>{{ $item->summary ?: \Illuminate\Support\Str::limit($item->body, 150) }}</p>
                <small>Autor: {{ $item->author?->name ?? 'Administrador' }} @if($item->submitted_at) · Enviado {{ $item->submitted_at->format('d/m/Y H:i') }} @endif</small>
                @if($item->assets->isNotEmpty())
                <div class="asset-summary">
                    @foreach($item->assets as $asset)
                    <span><strong>{{ strtoupper($asset->kind) }}</strong> {{ $asset->original_name }} @if($asset->page_count)· {{ $asset->page_count }} paginas @endif · {{ ['ready'=>'texto listo','partial'=>'texto parcial','failed'=>'sin extraccion','pending'=>'procesando','not_needed'=>'descripcion manual'][$asset->extraction_status] }}</span>
                    @endforeach
                </div>
                @endif
                @if($item->review_notes)<div class="review-note"><strong>Observaciones:</strong> {{ $item->review_notes }}</div>@endif
            </div>
            <div class="row-actions">
                @if($item->status === 'review')
                    <form method="POST" action="{{ route('admin.content.approve', $item) }}">@csrf @method('PATCH')<button class="button primary" type="submit">Aprobar</button></form>
                    <form class="reject-form" method="POST" action="{{ route('admin.content.reject', $item) }}">@csrf @method('PATCH')<label for="note-{{ $item->id }}">Motivo</label><textarea id="note-{{ $item->id }}" name="review_notes" rows="2" required placeholder="Indica que debe corregir"></textarea><button class="button danger" type="submit">Devolver</button></form>
                @endif
                <form method="POST" action="{{ route('admin.content.destroy', $item) }}" onsubmit="return confirm('Eliminar este contenido?')">@csrf @method('DELETE')<button class="button subtle" type="submit">Eliminar</button></form>
            </div>
        </article>
        @empty<div class="empty">No hay contenido registrado.</div>@endforelse
    </section>
    <aside class="panel">
        <h2>Publicacion directa</h2>
        <p class="hint">El administrador puede publicar sin revision.</p>
        <form class="stack" method="POST" action="{{ route('admin.content.store') }}" enctype="multipart/form-data">@csrf
            <div class="fields-2"><div><label for="type">Formato</label><select id="type" name="type" required><option value="product">Producto</option><option value="instruction">Indicacion de uso</option><option value="video">Video</option><option value="story">Testimonio</option></select></div><div><label for="topic">Tema</label><select id="topic" name="topic" required><option value="health">Salud</option><option value="business">Negocios</option><option value="mixed">Mixto</option></select></div></div>
            <div><label for="title">Titulo</label><input id="title" name="title" required></div>
            <div><label for="summary">Resumen</label><textarea id="summary" name="summary" rows="2"></textarea></div>
            <div><label for="body">Informacion completa</label><textarea id="body" name="body" rows="6" required></textarea></div>
            <div><label for="media_files">Archivos locales</label><input id="media_files" name="media_files[]" type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.webp,.mp4,.webm"><small class="hint">Hasta 8 PDF, imagenes o videos; maximo {{ floor(config('content.max_upload_kb') / 1024) }} MB cada uno.</small></div>
            <div class="fields-2"><div><label for="external_kind">Tipo de enlace</label><select id="external_kind" name="external_kind"><option value="">Sin enlace</option><option value="youtube">YouTube</option><option value="link">Otro sitio</option></select></div><div><label for="external_url">URL</label><input id="external_url" name="external_url" type="url" placeholder="https://"></div></div>
            <div><label for="resource_notes">Descripcion o transcripcion</label><textarea id="resource_notes" name="resource_notes" rows="5" placeholder="Describe imagenes o pega la transcripcion del video para que el chatbot pueda consultarla."></textarea></div>
            <div><label for="sort_order">Orden</label><input id="sort_order" name="sort_order" type="number" min="0" value="0"></div>
            <button class="button primary" type="submit">Publicar contenido</button>
        </form>
    </aside>
</div>
@endsection
