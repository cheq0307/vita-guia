<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'Vita Guia')</title>
    <link rel="stylesheet" href="{{ asset('assets/app.css') }}">
    <script src="{{ asset('assets/app.js') }}" defer></script>
</head>
<body>
<header class="topbar">
    <a class="brand" href="{{ url('/') }}"><span class="brand-mark">V</span><span>Vita Guia</span></a>
    @auth
        <nav class="nav">
            @if(auth()->user()->isAdmin())
                <a href="{{ route('admin.dashboard') }}">Usuarios</a>
                <a href="{{ route('admin.content') }}">Revision</a>
            @elseif(auth()->user()->isProfessional())
                <a href="{{ route('professional.dashboard') }}">Mis contenidos</a>
            @else
                <a href="{{ route('advisor.dashboard') }}">Enlaces</a>
            @endif
        </nav>
        <div class="account">
            <span>{{ auth()->user()->name }}</span>
            <form method="POST" action="{{ route('logout') }}">@csrf<button class="icon-button" title="Cerrar sesion" aria-label="Cerrar sesion">Salir</button></form>
        </div>
    @endauth
</header>
<main class="shell">
    @if(session('success'))<div class="alert success">{{ session('success') }}</div>@endif
    @if($errors->any())<div class="alert error"><strong>Revisa los datos:</strong> {{ $errors->first() }}</div>@endif
    @yield('content')
</main>
</body>
</html>
