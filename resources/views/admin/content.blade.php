@extends('layouts.app')
@section('title', 'Contenido | Vita Guia')
@section('content')
<div class="page-heading"><div><p class="eyebrow">Biblioteca</p><h1>Contenido para clientes</h1></div><span>{{ $items->count() }} elementos</span></div>
<div class="split">
    <section class="content-list">
        @forelse($items as $item)
        <article class="content-row">
            <div><span class="type">{{ ['product'=>'Producto','instruction'=>'Indicacion','video'=>'Video','story'=>'Testimonio'][$item->type] }}</span><h3>{{ $item->title }}</h3><p>{{ $item->summary ?: IlluminateSupportStr::limit($item->body, 150) }}</p></div>
            <form method="POST" action="{{ route('admin.content.destroy', $item) }}" onsubmit="return confirm('Eliminar este contenido?')">@csrf @method('DELETE')<button class="button danger" type="submit">Eliminar</button></form>
        </article>
        @empty<div class="empty">No hay contenido publicado.</div>@endforelse
    </section>
    <aside class="panel">
        <h2>Agregar contenido</h2>
        <form class="stack" method="POST" action="{{ route('admin.content.store') }}" enctype="multipart/form-data">@csrf
            <div><label for="type">Tipo</label><select id="type" name="type" required><option value="product">Producto</option><option value="instruction">Indicacion de uso</option><option value="video">Video</option><option value="story">Testimonio</option></select></div>
            <div><label for="title">Titulo</label><input id="title" name="title" required></div>
            <div><label for="summary">Resumen</label><textarea id="summary" name="summary" rows="2"></textarea></div>
            <div><label for="body">Informacion completa</label><textarea id="body" name="body" rows="6" required></textarea></div>
            <div><label for="media_file">Archivo en este servidor</label><input id="media_file" name="media_file" type="file" accept=".jpg,.jpeg,.png,.webp,.mp4,.webm"><small class="hint">Imagen o video, maximo 100 MB.</small></div>
            <div><label for="media_url">O enlace externo</label><input id="media_url" name="media_url" type="url" placeholder="https://"></div>
            <div><label for="sort_order">Orden</label><input id="sort_order" name="sort_order" type="number" min="0" value="0"></div>
            <button class="button primary" type="submit">Publicar contenido</button>
        </form>
    </aside>
</div>
@endsection
