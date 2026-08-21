<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AccessLink;
use App\Models\ClientAccessSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AccessController extends Controller
{
    public function open(Request $request)
    {
        $data = $request->validate([
            'token' => ['required', 'string', 'max:500'],
            'client_id' => ['required', 'string', 'min:16', 'max:190'],
            'platform' => ['required', 'in:android,ios'],
            'app_version' => ['nullable', 'string', 'max:40'],
        ]);

        $link = AccessLink::where('token_hash', hash('sha256', $data['token']))->first();
        if (! $link) {
            return response()->json(['message' => 'El enlace no existe.'], 404);
        }
        if ($link->revoked || $link->expires_at->isPast()) {
            return response()->json(['message' => 'El enlace vencio o fue revocado.'], 410);
        }

        $clientHash = hash('sha256', $data['client_id']);
        $result = DB::transaction(function () use ($link, $clientHash, $data) {
            $lockedLink = AccessLink::whereKey($link->id)->lockForUpdate()->firstOrFail();
            $session = ClientAccessSession::where('access_link_id', $lockedLink->id)
                ->where('client_id_hash', $clientHash)
                ->first();

            if ($session) {
                $session->update([
                    'platform' => $data['platform'],
                    'app_version' => $data['app_version'] ?? null,
                    'last_used_at' => now(),
                ]);

                return [$lockedLink, $session];
            }

            if ($lockedLink->max_opens !== null && $lockedLink->open_count >= $lockedLink->max_opens) {
                return null;
            }

            $plainToken = Str::random(80);
            $session = ClientAccessSession::create([
                'access_link_id' => $lockedLink->id,
                'token_hash' => hash('sha256', $plainToken),
                'token' => $plainToken,
                'client_id_hash' => $clientHash,
                'platform' => $data['platform'],
                'app_version' => $data['app_version'] ?? null,
                'last_used_at' => now(),
            ]);

            $lockedLink->increment('open_count');
            $lockedLink->forceFill([
                'first_opened_at' => $lockedLink->first_opened_at ?? now(),
                'last_opened_at' => now(),
            ])->save();

            return [$lockedLink, $session];
        });

        if (! $result) {
            return response()->json(['message' => 'El enlace alcanzo su limite de aperturas.'], 410);
        }

        [$link, $session] = $result;
        $link->load('advisor');

        return response()->json([
            'data' => [
                'access_token' => $session->token,
                'token_type' => 'Bearer',
                'expires_at' => $link->expires_at->toIso8601String(),
                'platform' => $session->platform,
                'guide_path' => route('api.v1.guide.show', [], false),
                'client' => [
                    'name' => $link->recipient_name,
                    'advisor_name' => $link->advisor->name,
                ],
            ],
        ]);
    }
}
