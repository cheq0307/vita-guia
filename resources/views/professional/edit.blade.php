@extends('layouts.app')
@section('title', 'Editar contenido | Vita Guia')
@section('content')
<div class="page-heading"><div><p class="eyebrow">Area profesional</p><h1>Editar contenido</h1></div><a class="button subtle" href="{{ route('professional.dashboard') }}">Volver</a></div>
<section class="panel editor-wrap">
    @if($item->review_notes)<div class="review-note"><strong>Observaciones del administrador:</strong> {{ $item->review_notes }}</div>@endif
    @if($item->assets->isNotEmpty())
    <div class="asset-list">
        @foreach($item->assets as $asset)
        <div class="asset-row"><div><span class="asset-kind">{{ strtoupper($asset->kind) }}</span><strong>{{ $asset->original_name }}</strong><small>{{ $asset->page_count ? $asset->page_count.' paginas · ' : '' }}{{ ['ready'=>'Texto extraido','partial'=>'Texto parcial','failed'=>'Sin extraccion','pending'=>'Procesando','not_needed'=>'Descripcion manual'][$asset->extraction_status] }}</small></div><div class="asset-actions">@if($asset->storage_path)<a class="button subtle" href="{{ route('assets.staff', $asset) }}" target="_blank">Abrir</a>@elseif($asset->external_url)<a class="button subtle" href="{{ $asset->external_url }}" target="_blank" rel="noopener">Abrir</a>@endif<form method="POST" action="{{ route('professional.assets.destroy', $asset) }}" onsubmit="return confirm('Eliminar este recurso?')">@csrf @method('DELETE')<button class="button danger" type="submit">Eliminar</button></form></div></div>
        @endforeach
    </div>
    @endif
    <form class="stack" method="POST" action="{{ route('professional.content.update', $item) }}" enctype="multipart/form-data">@csrf @method('PUT')
        @include('professional.partials.form')
    </form>
</section>
@endsection
