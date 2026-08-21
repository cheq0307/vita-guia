@extends('layouts.app')
@section('title', 'Usuarios | Vita Guia')
@section('content')
<div class="page-heading"><div><p class="eyebrow">Administracion</p><h1>Equipo y actividad</h1></div></div>
<section class="stats">
    <div><strong>{{ $stats['advisors'] }}</strong><span>asesores activos</span></div>
    <div><strong>{{ $stats['professionals'] }}</strong><span>profesionales activos</span></div>
    <div><strong>{{ $stats['links'] }}</strong><span>enlaces vigentes</span></div>
    <div><strong>{{ $stats['pending'] }}</strong><span>pendientes de revision</span></div>
</section>
<div class="split">
    <section>
        <div class="section-heading"><h2>Equipo</h2><span>{{ $users->count() }} usuarios</span></div>
        <div class="table-wrap"><table>
            <thead><tr><th>Nombre</th><th>Rol</th><th>Correo</th><th>Estado</th><th></th></tr></thead>
            <tbody>
            @forelse($users as $user)
                <tr><td>{{ $user->name }}</td><td>{{ $user->role === 'professional' ? 'Profesional' : 'Asesor' }}</td><td>{{ $user->email }}</td><td><span class="status {{ $user->active ? 'active' : 'inactive' }}">{{ $user->active ? 'Activo' : 'Inactivo' }}</span></td>
                <td><form method="POST" action="{{ route('admin.users.toggle', $user) }}">@csrf @method('PATCH')<button class="button subtle" type="submit">{{ $user->active ? 'Desactivar' : 'Activar' }}</button></form></td></tr>
            @empty<tr><td colspan="5">Todavia no hay usuarios de equipo.</td></tr>@endforelse
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
            <button class="button primary" type="submit">Crear usuario</button>
        </form>
    </aside>
</div>
@endsection
