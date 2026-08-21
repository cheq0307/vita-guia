<?php

namespace App\Http\Controllers;

use App\Models\AccessLink;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AdvisorController extends Controller
{
    public function dashboard(Request $request)
    {
        $advisor = $request->user()->load('subscriptionPlan');
        $activeClients = $advisor->links()
            ->where('revoked', false)
            ->where('expires_at', '>', now())
            ->count();

        return view('advisor.dashboard', [
            'links' => $advisor->links()->latest()->limit(100)->get(),
            'plan' => $advisor->subscriptionPlan,
            'activeClients' => $activeClients,
        ]);
    }

    public function storeLink(Request $request)
    {
        $data = $request->validate([
            'recipient_name' => ['required', 'string', 'max:160'],
            'recipient_contact' => ['nullable', 'string', 'max:190'],
            'duration_value' => ['required', 'integer', 'min:1', 'max:8760'],
            'duration_unit' => ['required', 'in:hours,days'],
            'max_opens' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);
        $durationHours = $data['duration_unit'] === 'days'
            ? $data['duration_value'] * 24
            : $data['duration_value'];

        $plainToken = Str::random(64);
        DB::transaction(function () use ($request, $data, $durationHours, $plainToken) {
            $advisor = User::with('subscriptionPlan')->lockForUpdate()->findOrFail($request->user()->id);
            $plan = $advisor->subscriptionPlan;

            if (! $plan || ! $plan->active) {
                throw ValidationException::withMessages([
                    'subscription' => 'Tu cuenta no tiene un plan activo. Contacta al superadministrador.',
                ]);
            }
            if ($durationHours > $plan->link_duration_hours) {
                throw ValidationException::withMessages([
                    'duration_value' => 'La vigencia supera el maximo de '.$plan->link_duration_hours.' horas de tu plan.',
                ]);
            }

            $activeClients = $advisor->links()
                ->where('revoked', false)
                ->where('expires_at', '>', now())
                ->count();
            if ($activeClients >= $plan->client_limit) {
                throw ValidationException::withMessages([
                    'recipient_name' => 'Alcanzaste el cupo de '.$plan->client_limit.' clientes activos de tu plan.',
                ]);
            }

            $advisor->links()->create([
                'token_hash' => hash('sha256', $plainToken),
                'token' => $plainToken,
                'recipient_name' => $data['recipient_name'],
                'recipient_contact' => $data['recipient_contact'] ?? '',
                'expires_at' => now()->addHours($durationHours),
                'max_opens' => $data['max_opens'] ?? null,
            ]);
        });

        return back()->with('success', 'Enlace creado.')
            ->with('new_link', route('guide.show', $plainToken));
    }

    public function revokeLink(Request $request, AccessLink $link)
    {
        abort_unless($link->advisor_id === $request->user()->id, 403);
        $link->update(['revoked' => true]);

        return back()->with('success', 'Enlace revocado.');
    }
}
