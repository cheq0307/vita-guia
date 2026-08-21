<?php

namespace App\Http\Controllers;

use App\Models\AccessLink;
use App\Models\ContentItem;
use App\Models\SubscriptionPlan;
use App\Models\User;
use App\Services\ContentAssetService;
use App\Services\ContentIndexer;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminController extends Controller
{
    public function __construct(
        private readonly ContentAssetService $assetService,
        private readonly ContentIndexer $indexer,
    ) {}

    public function dashboard()
    {
        return view('admin.dashboard', [
            'users' => User::with('subscriptionPlan')->whereIn('role', ['advisor', 'professional'])->latest()->get(),
            'plans' => SubscriptionPlan::orderBy('price')->orderBy('name')->get(),
            'stats' => [
                'advisors' => User::where('role', 'advisor')->where('active', true)->count(),
                'professionals' => User::where('role', 'professional')->where('active', true)->count(),
                'links' => AccessLink::where('revoked', false)->where('expires_at', '>', now())->count(),
                'pending' => ContentItem::where('status', 'review')->count(),
            ],
        ]);
    }

    public function storeUser(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:160'],
            'email' => ['required', 'email', 'max:190', 'unique:users,email'],
            'password' => ['required', 'string', 'min:10'],
            'role' => ['required', 'in:advisor,professional'],
            'subscription_plan_id' => ['nullable', 'required_if:role,advisor', 'exists:subscription_plans,id'],
        ]);
        $data['subscription_plan_id'] = $data['role'] === 'advisor' ? $data['subscription_plan_id'] : null;
        User::create($data + ['active' => true]);

        return back()->with('success', $data['role'] === 'professional' ? 'Profesional creado correctamente.' : 'Asesor creado correctamente.');
    }

    public function toggleUser(User $user)
    {
        abort_unless(in_array($user->role, ['advisor', 'professional'], true), 404);
        $user->update(['active' => ! $user->active]);

        return back()->with('success', 'Estado del usuario actualizado.');
    }

    public function storePlan(Request $request)
    {
        $data = $this->validatedPlan($request);
        SubscriptionPlan::create($data);

        return back()->with('success', 'Plan de suscripcion creado.');
    }

    public function updatePlan(Request $request, SubscriptionPlan $plan)
    {
        $plan->update($this->validatedPlan($request, $plan));

        return back()->with('success', 'Plan de suscripcion actualizado.');
    }

    public function assignPlan(Request $request, User $user)
    {
        abort_unless($user->role === 'advisor', 404);
        $data = $request->validate([
            'subscription_plan_id' => ['nullable', 'exists:subscription_plans,id'],
        ]);
        $user->update(['subscription_plan_id' => $data['subscription_plan_id'] ?? null]);

        return back()->with('success', 'Suscripcion del asesor actualizada.');
    }

    public function content()
    {
        return view('admin.content', [
            'items' => ContentItem::with(['author', 'reviewer', 'assets'])
                ->orderByRaw("CASE status WHEN 'review' THEN 0 WHEN 'rejected' THEN 1 WHEN 'published' THEN 2 ELSE 3 END")
                ->orderBy('sort_order')
                ->latest()
                ->get(),
        ]);
    }

    public function storeContent(Request $request)
    {
        $data = $this->validatedContent($request);
        $data['summary'] ??= '';
        $data['sort_order'] ??= 0;
        $data['author_id'] = $request->user()->id;
        $data['reviewer_id'] = $request->user()->id;
        $data['status'] = 'published';
        $data['reviewed_at'] = now();
        $item = ContentItem::create($this->onlyContentFields($data));

        $this->storeResources($request, $item);
        $this->indexer->reindex($item);

        return back()->with('success', 'Contenido y recursos publicados.');
    }

    public function approveContent(Request $request, ContentItem $item)
    {
        abort_unless($item->status === 'review', 422);
        $item->update([
            'status' => 'published',
            'active' => true,
            'reviewer_id' => $request->user()->id,
            'review_notes' => null,
            'reviewed_at' => now(),
        ]);
        $this->indexer->reindex($item);

        return back()->with('success', 'Contenido aprobado y publicado.');
    }

    public function rejectContent(Request $request, ContentItem $item)
    {
        abort_unless($item->status === 'review', 422);
        $data = $request->validate(['review_notes' => ['required', 'string', 'max:1000']]);
        $item->update([
            'status' => 'rejected',
            'active' => false,
            'reviewer_id' => $request->user()->id,
            'review_notes' => $data['review_notes'],
            'reviewed_at' => now(),
        ]);

        return back()->with('success', 'Contenido devuelto al profesional con observaciones.');
    }

    public function destroyContent(ContentItem $item)
    {
        foreach ($item->assets as $asset) {
            $this->assetService->delete($asset);
        }
        $item->delete();

        return back()->with('success', 'Contenido eliminado.');
    }

    private function validatedPlan(Request $request, ?SubscriptionPlan $plan = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:100', Rule::unique('subscription_plans', 'name')->ignore($plan?->id)],
            'price' => ['required', 'numeric', 'min:0', 'max:999999.99'],
            'client_limit' => ['required', 'integer', 'min:1', 'max:100000'],
            'link_duration_hours' => ['required', 'integer', 'min:1', 'max:8760'],
            'active' => ['required', 'boolean'],
        ]);
    }

    private function storeResources(Request $request, ContentItem $item): void
    {
        $files = $request->file('media_files', []);
        if ($request->hasFile('media_file')) {
            $files[] = $request->file('media_file');
        }

        $this->assetService->attachUploads($item, $files, $request->input('resource_notes'));
        $this->assetService->attachExternal(
            $item,
            $request->input('external_url'),
            $request->input('external_kind'),
            $request->input('resource_notes'),
        );
    }

    private function validatedContent(Request $request): array
    {
        return $request->validate([
            'type' => ['required', 'in:product,instruction,video,story'],
            'topic' => ['required', 'in:health,business,mixed'],
            'title' => ['required', 'string', 'max:190'],
            'summary' => ['nullable', 'string', 'max:500'],
            'body' => ['required', 'string'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'media_file' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,mp4,webm,pdf', 'max:'.config('content.max_upload_kb')],
            'media_files' => ['nullable', 'array', 'max:8'],
            'media_files.*' => ['file', 'mimes:jpg,jpeg,png,webp,mp4,webm,pdf', 'max:'.config('content.max_upload_kb')],
            'external_kind' => ['nullable', 'in:youtube,link'],
            'external_url' => ['nullable', 'url', 'max:1000', 'required_with:external_kind'],
            'resource_notes' => ['nullable', 'string', 'max:20000'],
        ]);
    }

    private function onlyContentFields(array $data): array
    {
        return collect($data)->only([
            'type', 'topic', 'title', 'summary', 'body', 'sort_order', 'author_id',
            'reviewer_id', 'status', 'reviewed_at',
        ])->all();
    }
}
