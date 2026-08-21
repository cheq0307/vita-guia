@extends('layouts.app')
@section('title', 'Superadministracion | Vita Guia')
@section('content')
<div class="page-heading"><div><p class="eyebrow">Superadministrador</p><h1>Equipo, planes y actividad</h1></div></div>
<section class="stats">
    <div><strong>{{ $stats['advisors'] }}</strong><span>asesores activos</span></div>
    <div><strong>{{ $stats['professionals'] }}</strong><span>profesionales activos</span></div>
    <div><strong>{{ $stats['links'] }}</strong><span>clientes con enlace vigente</span></div>
    <div><strong>{{ $stats['pending'] }}</strong><span>pendientes de revision</span></div>
</section>

<section class="management-section">
    <div class="section-heading"><div><p class="eyebrow">Suscripciones</p><h2>Planes para asesores</h2></div><span>Tu defines costo, cupo y vigencia maxima</span></div>
    <div class="plan-layout">
        <div class="plan-list">
            @forelse($plans as $plan)
            <form class="plan-row" method="POST" action="{{ route('admin.plans.update', $plan) }}">@csrf @method('PUT')
                <div><label for="plan-name-{{ $plan->id }}">Plan</label><input id="plan-name-{{ $plan->id }}" name="name" value="{{ $plan->name }}" required></div>
                <div><label for="plan-price-{{ $plan->id }}">Costo MXN</label><input id="plan-price-{{ $plan->id }}" name="price" type="number" min="0" step="0.01" value="{{ $plan->price }}" required></div>
                <div><label for="plan-clients-{{ $plan->id }}">Clientes activos</label><input id="plan-clients-{{ $plan->id }}" name="client_limit" type="number" min="1" value="{{ $plan->client_limit }}" required></div>
                <div><label for="plan-hours-{{ $plan->id }}">Vigencia maxima (horas)</label><input id="plan-hours-{{ $plan->id }}" name="link_duration_hours" type="number" min="1" value="{{ $plan->link_duration_hours }}" required></div>
                <div class="plan-actions"><input type="hidden" name="active" value="0"><label class="check"><input name="active" type="checkbox" value="1" @checked($plan->active)> Activo</label><button class="button subtle" type="submit">Actualizar</button></div>
            </form>
            @empty
            <div class="empty">Crea el primer plan para poder asignar asesores.</div>
            @endforelse
        </div>
        <aside class="panel">
            <h2>Nuevo plan</h2>
            <form class="stack" method="POST" action="{{ route('admin.plans.store') }}">@csrf
                <div><label for="plan_name">Nombre</label><input id="plan_name" name="name" required></div>
                <div class="fields-2"><div><label for="price">Costo MXN</label><input id="price" name="price" type="number" min="0" step="0.01" value="0" required></div><div><label for="client_limit">Clientes activos</label><input id="client_limit" name="client_limit" type="number" min="1" value="10" required></div></div>
                <div><label for="link_duration_hours">Vigencia maxima por enlace (horas)</label><input id="link_duration_hours" name="link_duration_hours" type="number" min="1" value="168" required><small class="hint">24 horas = 1 dia; 168 horas = 7 dias.</small></div>
                <input type="hidden" name="active" value="1">
                <button class="button primary" type="submit">Crear plan</button>
            </form>
        </aside>
    </div>
</section>

<div class="split team-management">
    <section>
        <div class="section-heading"><h2>Equipo</h2><span>{{ $users->count() }} usuarios internos</span></div>
        <div class="table-wrap"><table>
            <thead><tr><th>Nombre</th><th>Rol</th><th>Correo</th><th>Plan y cupo</th><th>Estado</th><th></th></tr></thead>
            <tbody>
            @forelse($users as $user)
                <tr>
                    <td>{{ $user->name }}</td>
                    <td>{{ $user->role === 'professional' ? 'Profesional' : 'Asesor' }}</td>
                    <td>{{ $user->email }}</td>
                    <td>
                        @if($user->role === 'advisor')
                        <form class="inline-plan" method="POST" action="{{ route('admin.users.plan', $user) }}">@csrf @method('PATCH')
                            <select name="subscription_plan_id" aria-label="Plan de {{ $user->name }}">
                                <option value="">Sin plan</option>
                                @foreach($plans as $plan)<option value="{{ $plan->id }}" @selected($user->subscription_plan_id === $plan->id)>{{ $plan->name }} · {{ $plan->client_limit }} clientes</option>@endforeach
                            </select>
                            <button class="button subtle" type="submit">Asignar</button>
                        </form>
                        @else
                        <span class="hint">Publica informacion y figura como contacto.</span>
                        @endif
                    </td>
                    <td><span class="status {{ $user->active ? 'active' : 'inactive' }}">{{ $user->active ? 'Activo' : 'Inactivo' }}</span></td>
                    <td><form method="POST" action="{{ route('admin.users.toggle', $user) }}">@csrf @method('PATCH')<button class="button subtle" type="submit">{{ $user->active ? 'Desactivar' : 'Activar' }}</button></form></td>
                </tr>
            @empty<tr><td colspan="6">Todavia no hay usuarios de equipo.</td></tr>@endforelse
            </tbody>
        </table></div>
    </section>
    <aside class="panel">
        <h2>Nuevo usuario</h2>
        <form class="stack" method="POST" action="{{ route('admin.users.store') }}">@csrf
            <div><label for="role">Tipo de acceso</label><select id="role" name="role" required><option value="professional">Profesional / doctor</option><option value="advisor">Asesor</option></select></div>
            <div><label for="name">Nombre</label><input id="name" name="name" required></div>
            <div><label for="email">Correo</label><input id="email" name="email" type="email" required></div>
            <div><label for="password">Contrasena temporal</label><input id="password" name="password" type="password" minlength="10" required></div>
            <div><label for="subscription_plan_id">Plan para asesor</label><select id="subscription_plan_id" name="subscription_plan_id"><option value="">No aplica al profesional</option>@foreach($plans->where('active', true) as $plan)<option value="{{ $plan->id }}">{{ $plan->name }} · MXN {{ number_format($plan->price, 2) }} · {{ $plan->client_limit }} clientes</option>@endforeach</select></div>
            <button class="button primary" type="submit">Crear usuario</button>
        </form>
    </aside>
</div>
@endsection
