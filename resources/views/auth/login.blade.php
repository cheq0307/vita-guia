@extends('layouts.app')
@section('title', 'Ingresar | Vita Guia')
@section('content')
<div class="auth-wrap">
    <section class="auth-intro">
        <p class="eyebrow">Acceso privado</p>
        <h1>Informacion clara para cada cliente.</h1>
        <p>Administra asesores, contenido y enlaces con vigencia desde un solo lugar.</p>
    </section>
    <form class="panel auth-form" method="POST" action="{{ route('login.store') }}">
        @csrf
        <div><label for="email">Correo</label><input id="email" name="email" type="email" value="{{ old('email') }}" required autofocus autocomplete="username"></div>
        <div><label for="password">Contrasena</label><input id="password" name="password" type="password" required autocomplete="current-password"></div>
        <label class="check"><input type="checkbox" name="remember" value="1"> Mantener sesion</label>
        <button class="button primary" type="submit">Ingresar</button>
    </form>
</div>
@endsection
