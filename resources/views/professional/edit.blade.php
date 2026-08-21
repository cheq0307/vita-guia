@extends('layouts.app')
@section('title', 'Editar contenido | Vita Guia')
@section('content')
<div class="page-heading"><div><p class="eyebrow">Area profesional</p><h1>Editar contenido</h1></div><a class="button subtle" href="{{ route('professional.dashboard') }}">Volver</a></div>
<section class="panel editor-wrap">
    @if($item->review_notes)<div class="review-note"><strong>Observaciones del administrador:</strong> {{ $item->review_notes }}</div>@endif
    <form class="stack" method="POST" action="{{ route('professional.content.update', $item) }}" enctype="multipart/form-data">@csrf @method('PUT')
        @include('professional.partials.form')
    </form>
</section>
@endsection
