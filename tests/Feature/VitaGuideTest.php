<?php

namespace Tests\Feature;

use App\Models\AccessLink;
use App\Models\ContentItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class VitaGuideTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_and_advisor_are_sent_to_their_own_areas(): void
    {
        $admin = User::create(['name' => 'Admin', 'email' => 'admin@test.local', 'password' => 'password-segura', 'role' => 'admin', 'active' => true]);
        $advisor = User::create(['name' => 'Asesor', 'email' => 'advisor@test.local', 'password' => 'password-segura', 'role' => 'advisor', 'active' => true]);

        $this->post('/login', ['email' => $admin->email, 'password' => 'password-segura'])->assertRedirect(route('admin.dashboard'));
        $this->post('/logout');
        $this->post('/login', ['email' => $advisor->email, 'password' => 'password-segura'])->assertRedirect(route('advisor.dashboard'));
    }

    public function test_one_open_link_remains_available_in_the_same_session(): void
    {
        $link = $this->makeLink('una-apertura', 1);

        $this->get('/guia/una-apertura')->assertOk()->assertSee('Cliente de prueba');
        $this->get('/guia/una-apertura')->assertOk();
        $this->assertSame(1, $link->fresh()->open_count);

        $this->flushSession();
        $this->get('/guia/una-apertura')->assertStatus(410);
    }

    public function test_chat_uses_only_published_content(): void
    {
        $this->makeLink('chat-token', 3);
        ContentItem::create([
            'type' => 'instruction',
            'title' => 'Uso del producto',
            'summary' => 'Tomar con alimentos segun la indicacion publicada.',
            'body' => 'No se debe exceder la cantidad indicada.',
            'sort_order' => 1,
            'active' => true,
        ]);

        $this->get('/guia/chat-token')->assertOk();
        $this->postJson('/guia/chat-token/preguntar', ['question' => 'Como debo tomar el producto?'])
            ->assertOk()
            ->assertJsonFragment(['answer' => 'Uso del producto: Tomar con alimentos segun la indicacion publicada.']);

        $this->postJson('/guia/chat-token/preguntar', ['question' => 'Cual es el clima de manana?'])
            ->assertOk()
            ->assertJsonFragment(['answer' => 'No encontré esa respuesta en la información disponible. Consulta directamente con tu asesor.']);
    }

    public function test_admin_can_store_a_video_on_the_local_disk(): void
    {
        Storage::fake('public');
        $admin = User::create(['name' => 'Admin', 'email' => 'upload@test.local', 'password' => 'password-segura', 'role' => 'admin', 'active' => true]);

        $this->actingAs($admin)->post('/admin/contenido', [
            'type' => 'video',
            'title' => 'Video local',
            'body' => 'Explicacion del producto.',
            'media_file' => UploadedFile::fake()->create('explicacion.mp4', 500, 'video/mp4'),
        ])->assertRedirect();

        $item = ContentItem::where('title', 'Video local')->firstOrFail();
        Storage::disk('public')->assertExists(str_replace('/storage/', '', $item->media_url));
    }

    private function makeLink(string $token, int $maxOpens): AccessLink
    {
        $advisor = User::create([
            'name' => 'Asesor',
            'email' => $token.'@test.local',
            'password' => 'password-segura',
            'role' => 'advisor',
            'active' => true,
        ]);

        return AccessLink::create([
            'advisor_id' => $advisor->id,
            'token_hash' => hash('sha256', $token),
            'token' => $token,
            'recipient_name' => 'Cliente de prueba',
            'recipient_contact' => '',
            'expires_at' => now()->addDay(),
            'max_opens' => $maxOpens,
        ]);
    }
}
