<?php

namespace App\Http\Controllers;

use App\Models\AccessLink;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdvisorController extends Controller
{
    public function dashboard(Request $request)
    {
        return view('advisor.dashboard', ['links' => $request->user()->links()->latest()->limit(100)->get()]);
    }

    public function storeLink(Request $request)
    {
        $data = $request->validate([
            'recipient_name' => ['required', 'string', 'max:160'],
            'recipient_contact' => ['nullable', 'string', 'max:190'],
            'valid_days' => ['required', 'integer', 'min:1', 'max:90'],
            'max_opens' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);
        $plainToken = Str::random(64);
        $link = $request->user()->links()->create([
            'token_hash' => hash('sha256', $plainToken),
            'token' => $plainToken,
            'recipient_name' => $data['recipient_name'],
            'recipient_contact' => $data['recipient_contact'] ?? '',
            'expires_at' => now()->addDays($data['valid_days']),
            'max_opens' => $data['max_opens'] ?? null,
        ]);

        return back()->with('success', 'Enlace creado.')->with('new_link', route('guide.show', $plainToken));
    }

    public function revokeLink(Request $request, AccessLink $link)
    {
        abort_unless($link->advisor_id === $request->user()->id, 403);
        $link->update(['revoked' => true]);

        return back()->with('success', 'Enlace revocado.');
    }
}
