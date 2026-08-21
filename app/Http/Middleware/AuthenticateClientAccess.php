<?php

namespace App\Http\Middleware;

use App\Models\ClientAccessSession;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateClientAccess
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();
        if (! $token) {
            return response()->json(['message' => 'Falta el token de acceso.'], 401);
        }

        $session = ClientAccessSession::with('accessLink.advisor')
            ->where('token_hash', hash('sha256', $token))
            ->first();

        if (! $session) {
            return response()->json(['message' => 'El token de acceso no es valido.'], 401);
        }

        $link = $session->accessLink;
        if ($link->revoked || $link->expires_at->isPast()) {
            return response()->json(['message' => 'El acceso vencio o fue revocado.'], 410);
        }

        $session->forceFill(['last_used_at' => now()])->save();
        $request->attributes->set('clientAccessSession', $session);

        return $next($request);
    }
}
