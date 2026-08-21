@extends('layouts.app')
@section('title', 'Usuarios | Vita Guia')
@section('content')
<div class="page-heading"><div><p class="eyebrow">Administracion</p><h1>Usuarios y actividad</h1></div></div>
<section class="stats">
    <div><strong>{{ $stats['advisors'] }}</strong><span>asesores activos</span></div>
    <div><strong>{{ $stats['links'] }}</strong><span>enlaces vigentes</span></div>
    <div><strong>{{ $stats['opens'] }}</strong><span>aperturas registradas</span></div>
    <div><strong>{{ $stats['content'] }}</strong><span>contenidos visibles</span></div>
</section>
<div class="split">
    <section>
        <div class="section-heading"><h2>Asesores</h2><span>{{ $advisors->count() }} registrados</span></div>
        <div class="table-wrap"><table>
            <thead><tr><th>Nombre</th><th>Correo</th><th>Estado</th><th></th></tr></thead>
            <tbody>
            @forelse($advisors as $advisor)
                <tr><td>{{ $advisor->name }}</td><td>{{ $advisor->email }}</td><td><span class="status {{ $advisor->active ? 'active' : 'inactive' }}">{{ $advisor->active ? 'Activo' : 'Inactivo' }}</span></td>
                <td><form method="POST" action="{{ route('admin.advisors.toggle', $advisor) }}">@csrf @method('PATCH')<button class="button subtle" type="submit">{{ $advisor->active ? 'Desactivar' : 'Activar' }}</button></form></td></tr>
            @empty<tr><td colspan="4">Todavia no hay asesores.</td></tr>@endforelse
            </tbody>
        </table></div>
    </section>
    <aside class="panel">
        <h2>Nuevo asesor</h2>
        <form class="stack" method="POST" action="{{ route('admin.advisors.store') }}">@csrf
            <div><label for="name">Nombre</label><input id="name" name="name" required></div>
            <div><label for="email">Correo</label><input id="email" name="email" type="email" required></div>
            <div><label for="password">Contrasena temporal</label><input id="password" name="password" type="password" minlength="10" required></div>
            <button class="button primary" type="submit">Crear asesor</button>
        </form>
    </aside>
</div>
@endsection
