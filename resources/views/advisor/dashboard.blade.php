@extends('layouts.app')
@section('title', 'Enlaces | Vita Guia')
@section('content')
<div class="page-heading"><div><p class="eyebrow">Asesor</p><h1>Enlaces para clientes</h1></div></div>
@if(session('new_link'))
<div class="share-box"><div><strong>Enlace listo para compartir</strong><p id="new-link">{{ session('new_link') }}</p></div><button class="button primary" type="button" data-copy="#new-link">Copiar enlace</button></div>
@endif
<div class="split">
    <section>
        <div class="section-heading"><h2>Enlaces recientes</h2><span>{{ $links->count() }} mostrados</span></div>
        <div class="table-wrap"><table>
            <thead><tr><th>Cliente</th><th>Vence</th><th>Aperturas</th><th>Estado</th><th></th></tr></thead>
            <tbody>
            @forelse($links as $link)
            <tr><td><strong>{{ $link->recipient_name }}</strong><small>{{ $link->recipient_contact }}</small></td><td>{{ $link->expires_at->format('d/m/Y H:i') }}</td><td>{{ $link->open_count }}{{ $link->max_opens ? ' / '.$link->max_opens : '' }}</td><td><span class="status {{ $link->isAvailable() ? 'active' : 'inactive' }}">{{ $link->isAvailable() ? 'Vigente' : 'Cerrado' }}</span></td>
            <td>@if(!$link->revoked)<form method="POST" action="{{ route('advisor.links.revoke', $link) }}">@csrf @method('PATCH')<button class="button danger" type="submit">Revocar</button></form>@endif</td></tr>
            @empty<tr><td colspan="5">Crea el primer enlace para un cliente.</td></tr>@endforelse
            </tbody>
        </table></div>
    </section>
    <aside class="panel">
        <h2>Nuevo enlace</h2>
        <form class="stack" method="POST" action="{{ route('advisor.links.store') }}">@csrf
            <div><label for="recipient_name">Nombre del cliente</label><input id="recipient_name" name="recipient_name" required></div>
            <div><label for="recipient_contact">Telefono o correo (opcional)</label><input id="recipient_contact" name="recipient_contact"></div>
            <div class="fields-2"><div><label for="valid_days">Dias vigente</label><input id="valid_days" name="valid_days" type="number" min="1" max="90" value="7" required></div><div><label for="max_opens">Limite de aperturas</label><input id="max_opens" name="max_opens" type="number" min="1" max="100" placeholder="Sin limite"></div></div>
            <button class="button primary" type="submit">Generar enlace</button>
        </form>
    </aside>
</div>
@endsection
