@extends('layouts.app')
@section('title', 'Enlaces | Vita Guia')
@section('content')
<div class="page-heading"><div><p class="eyebrow">Asesor</p><h1>Clientes y enlaces</h1></div><a class="button subtle" href="{{ route('library.show') }}">Ver biblioteca publicada</a></div>
@if(session('new_link'))
<div class="share-box"><div><strong>Enlace listo para compartir</strong><p id="new-link">{{ session('new_link') }}</p></div><button class="button primary" type="button" data-copy="#new-link">Copiar enlace</button></div>
@endif

<section class="stats advisor-plan-stats">
    <div><strong>{{ $plan?->name ?? 'Sin plan' }}</strong><span>suscripcion asignada</span></div>
    <div><strong>{{ $plan ? 'MXN '.number_format($plan->price, 2) : '—' }}</strong><span>costo configurado</span></div>
    <div><strong>{{ $activeClients }}{{ $plan ? ' / '.$plan->client_limit : '' }}</strong><span>clientes con enlace vigente</span></div>
    <div><strong>{{ $plan ? $plan->link_duration_hours.' h' : '—' }}</strong><span>vigencia maxima por enlace</span></div>
</section>

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
        @if(!$plan || !$plan->active)
            <div class="review-note">Tu cuenta necesita un plan activo. El superadministrador puede asignarlo desde su dashboard.</div>
        @elseif($activeClients >= $plan->client_limit)
            <div class="review-note">Tu cupo esta completo. Revoca un enlace vigente o solicita otro plan.</div>
        @else
        <p class="hint">Disponibles: {{ $plan->client_limit - $activeClients }} clientes. Vigencia maxima: {{ $plan->link_duration_hours }} horas.</p>
        @php($useDays = $plan->link_duration_hours >= 24)
        <form class="stack" method="POST" action="{{ route('advisor.links.store') }}">@csrf
            <div><label for="recipient_name">Nombre del cliente</label><input id="recipient_name" name="recipient_name" required></div>
            <div><label for="recipient_contact">Telefono o correo (opcional)</label><input id="recipient_contact" name="recipient_contact"></div>
            <div class="fields-2">
                <div><label for="duration_value">Tiempo disponible</label><input id="duration_value" name="duration_value" type="number" min="1" value="{{ $useDays ? min(7, intdiv($plan->link_duration_hours, 24)) : $plan->link_duration_hours }}" required></div>
                <div><label for="duration_unit">Unidad</label><select id="duration_unit" name="duration_unit"><option value="hours" @selected(!$useDays)>Horas</option><option value="days" @selected($useDays)>Dias</option></select></div>
            </div>
            <div><label for="max_opens">Limite de aperturas (opcional)</label><input id="max_opens" name="max_opens" type="number" min="1" max="100" placeholder="Sin limite"></div>
            <button class="button primary" type="submit">Generar enlace</button>
        </form>
        @endif
    </aside>
</div>
@endsection
