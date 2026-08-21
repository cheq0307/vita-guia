<?php

namespace Tests\Feature;

use App\Models\AccessLink;
use App\Models\ContentAsset;
use App\Models\ContentItem;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class RolesAndSubscriptionsTest extends TestCase
{
    use RefreshDatabase;

    public function test_professional_and_advisor_can_view_the_published_library(): void
    {
        Storage::fake('local');
        $professional = $this->user('professional', 'professional-library@test.local');
        $advisor = $this->user('advisor', 'advisor-library@test.local');
        $item = ContentItem::create([
            'type' => 'product',
            'topic' => 'health',
            'title' => 'Producto visible para el equipo',
            'summary' => 'Informacion publicada.',
            'body' => 'Contenido que tambien consulta el cliente.',
            'author_id' => $professional->id,
            'active' => true,
            'status' => 'published',
        ]);
        Storage::disk('local')->put('content/team.pdf', 'PDF interno');
        $asset = ContentAsset::create([
            'content_item_id' => $item->id,
            'kind' => 'pdf',
            'storage_path' => 'content/team.pdf',
            'original_name' => 'team.pdf',
            'mime_type' => 'application/pdf',
            'size_bytes' => 11,
            'extraction_status' => 'ready',
        ]);

        $this->get('/biblioteca')->assertRedirect('/login');

        foreach ([$professional, $advisor] as $user) {
            $this->actingAs($user)->get('/biblioteca')
                ->assertOk()
                ->assertSee('Producto visible para el equipo')
                ->assertSee('Contacto profesional')
                ->assertSee('professional-library@test.local');
        }

        $this->actingAs($advisor)->get('/recursos/'.$asset->id)
            ->assertOk()
            ->assertHeader('content-type', 'application/pdf');
    }

    public function test_superadmin_creates_plans_and_assigns_them_to_advisors(): void
    {
        $admin = $this->user('admin', 'superadmin@test.local');
        $advisor = $this->user('advisor', 'assign-plan@test.local');

        $this->actingAs($admin)->post('/admin/planes', [
            'name' => 'Crecimiento',
            'price' => '499.00',
            'client_limit' => 40,
            'link_duration_hours' => 336,
            'active' => 1,
        ])->assertRedirect();

        $plan = SubscriptionPlan::where('name', 'Crecimiento')->firstOrFail();
        $this->actingAs($admin)->patch('/admin/usuarios/'.$advisor->id.'/plan', [
            'subscription_plan_id' => $plan->id,
        ])->assertRedirect();

        $this->assertSame($plan->id, $advisor->fresh()->subscription_plan_id);
        $this->actingAs($admin)->get('/admin')
            ->assertOk()
            ->assertSee('Crecimiento')
            ->assertSee('40 clientes');
    }

    public function test_advisor_cannot_exceed_plan_duration_or_client_quota(): void
    {
        $plan = SubscriptionPlan::create([
            'name' => 'Limitado',
            'price' => 199,
            'client_limit' => 1,
            'link_duration_hours' => 48,
            'active' => true,
        ]);
        $advisor = $this->user('advisor', 'limited-advisor@test.local', $plan);

        $this->actingAs($advisor)->post('/asesor/enlaces', [
            'recipient_name' => 'Duracion excesiva',
            'duration_value' => 3,
            'duration_unit' => 'days',
        ])->assertSessionHasErrors('duration_value');

        $this->actingAs($advisor)->post('/asesor/enlaces', [
            'recipient_name' => 'Primer cliente',
            'recipient_contact' => 'cliente@test.local',
            'duration_value' => 2,
            'duration_unit' => 'days',
            'max_opens' => 3,
        ])->assertRedirect();

        $link = AccessLink::where('advisor_id', $advisor->id)->firstOrFail();
        $this->assertSame('Primer cliente', $link->recipient_name);
        $this->assertTrue($link->expires_at->between(now()->addHours(47), now()->addHours(49)));

        $this->actingAs($advisor)->post('/asesor/enlaces', [
            'recipient_name' => 'Segundo cliente',
            'duration_value' => 1,
            'duration_unit' => 'hours',
        ])->assertSessionHasErrors('recipient_name');

        $this->assertSame(1, AccessLink::where('advisor_id', $advisor->id)->count());
    }

    public function test_advisor_without_active_plan_cannot_create_links(): void
    {
        $advisor = $this->user('advisor', 'no-plan@test.local');

        $this->actingAs($advisor)->post('/asesor/enlaces', [
            'recipient_name' => 'Cliente bloqueado',
            'duration_value' => 1,
            'duration_unit' => 'days',
        ])->assertSessionHasErrors('subscription');

        $this->assertDatabaseMissing('access_links', ['advisor_id' => $advisor->id]);
    }

    private function user(string $role, string $email, ?SubscriptionPlan $plan = null): User
    {
        return User::create([
            'name' => ucfirst($role).' de prueba',
            'email' => $email,
            'password' => 'password-segura',
            'role' => $role,
            'subscription_plan_id' => $plan?->id,
            'active' => true,
        ]);
    }
}
