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
        $professional = User::create(['name' => 'Profesional', 'email' => 'professional@test.local', 'password' => 'password-segura', 'role' => 'professional', 'active' => true]);

        $this->post('/login', ['email' => $admin->email, 'password' => 'password-segura'])->assertRedirect(route('admin.dashboard'));
        $this->post('/logout');
        $this->post('/login', ['email' => $advisor->email, 'password' => 'password-segura'])->assertRedirect(route('advisor.dashboard'));
        $this->post('/logout');
        $this->post('/login', ['email' => $professional->email, 'password' => 'password-segura'])->assertRedirect(route('professional.dashboard'));
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
        $item = ContentItem::create([
            'type' => 'instruction',
            'topic' => 'health',
            'title' => 'Uso del producto',
            'summary' => 'Tomar con alimentos segun la indicacion publicada.',
            'body' => 'No se debe exceder la cantidad indicada.',
            'sort_order' => 1,
            'active' => true,
        ]);
        app(\App\Services\ContentIndexer::class)->reindex($item);

        $this->get('/guia/chat-token')->assertOk();
        $this->postJson('/guia/chat-token/preguntar', ['question' => 'Como debo tomar el producto?'])
            ->assertOk()
            ->assertJsonPath('mode', 'extractive')
            ->assertJsonPath('answer', fn ($answer) => str_contains($answer, 'Tomar con alimentos segun la indicacion publicada.'));

        $this->postJson('/guia/chat-token/preguntar', ['question' => 'Cual es el clima de manana?'])
            ->assertOk()
            ->assertJsonFragment(['answer' => 'No encontré esa respuesta en la información aprobada. Consulta directamente con tu asesor.']);
    }

    public function test_professional_content_requires_admin_approval(): void
    {
        $professional = User::create(['name' => 'Profesional', 'email' => 'writer@test.local', 'password' => 'password-segura', 'role' => 'professional', 'active' => true]);
        $admin = User::create(['name' => 'Admin', 'email' => 'reviewer@test.local', 'password' => 'password-segura', 'role' => 'admin', 'active' => true]);
        $this->makeLink('review-flow', 3);

        $this->actingAs($professional)->post('/profesional/contenido', [
            'type' => 'product',
            'topic' => 'health',
            'title' => 'Producto pendiente',
            'summary' => 'Informacion que requiere aprobacion.',
            'body' => 'Contenido completo pendiente.',
            'sort_order' => 1,
            'action' => 'submit',
        ])->assertRedirect();

        $item = ContentItem::where('title', 'Producto pendiente')->firstOrFail();
        $this->actingAs($professional)->get('/profesional')->assertOk()->assertSee('Producto pendiente');
        $this->assertSame('review', $item->status);
        $this->get('/guia/review-flow')->assertOk()->assertDontSee('Producto pendiente');

        $this->actingAs($admin)->get('/admin/contenido')->assertOk()->assertSee('Producto pendiente');
        $this->actingAs($admin)->patch('/admin/contenido/'.$item->id.'/aprobar')->assertRedirect();
        $this->assertSame('published', $item->fresh()->status);
        $this->get('/guia/review-flow')->assertOk()->assertSee('Producto pendiente');
    }

    public function test_rejected_content_returns_to_its_author_with_notes(): void
    {
        $professional = User::create(['name' => 'Profesional', 'email' => 'correction@test.local', 'password' => 'password-segura', 'role' => 'professional', 'active' => true]);
        $admin = User::create(['name' => 'Admin', 'email' => 'approval@test.local', 'password' => 'password-segura', 'role' => 'admin', 'active' => true]);
        $item = ContentItem::create([
            'type' => 'instruction',
            'topic' => 'health',
            'title' => 'Indicacion por revisar',
            'summary' => '',
            'body' => 'Texto inicial.',
            'author_id' => $professional->id,
            'status' => 'review',
            'submitted_at' => now(),
            'active' => false,
        ]);

        $this->actingAs($admin)->patch('/admin/contenido/'.$item->id.'/rechazar', [
            'review_notes' => 'Agrega la advertencia correspondiente.',
        ])->assertRedirect();

        $this->assertSame('rejected', $item->fresh()->status);
        $this->actingAs($professional)->get('/profesional/contenido/'.$item->id.'/editar')
            ->assertOk()
            ->assertSee('Agrega la advertencia correspondiente.');
    }

    public function test_admin_can_store_a_video_on_the_local_disk(): void
    {
        Storage::fake('local');
        $admin = User::create(['name' => 'Admin', 'email' => 'upload@test.local', 'password' => 'password-segura', 'role' => 'admin', 'active' => true]);

        $this->actingAs($admin)->post('/admin/contenido', [
            'type' => 'video',
            'topic' => 'health',
            'title' => 'Video local',
            'body' => 'Explicacion del producto.',
            'media_file' => UploadedFile::fake()->create('explicacion.mp4', 500, 'video/mp4'),
        ])->assertRedirect();

        $item = ContentItem::where('title', 'Video local')->firstOrFail();
        $asset = $item->assets()->firstOrFail();
        $this->assertSame('video', $asset->kind);
        Storage::disk('local')->assertExists($asset->storage_path);
    }

    public function test_professional_can_attach_pdf_image_and_youtube_transcript(): void
    {
        Storage::fake('local');
        $professional = User::create(['name' => 'Profesional', 'email' => 'media@test.local', 'password' => 'password-segura', 'role' => 'professional', 'active' => true]);
        $admin = User::create(['name' => 'Admin', 'email' => 'media-admin@test.local', 'password' => 'password-segura', 'role' => 'admin', 'active' => true]);
        $this->makeLink('media-flow', 3);

        $this->actingAs($professional)->post('/profesional/contenido', [
            'type' => 'video',
            'topic' => 'health',
            'title' => 'Demostracion multimedia',
            'body' => 'Recursos para el cliente.',
            'action' => 'submit',
            'media_files' => [
                UploadedFile::fake()->create('producto.jpg', 10, 'image/jpeg'),
                UploadedFile::fake()->create('manual.pdf', 50, 'application/pdf'),
            ],
            'external_kind' => 'youtube',
            'external_url' => 'https://www.youtube.com/watch?v=abcdefghijk',
            'resource_notes' => 'La demostracion audiovisual explica la mezcla nocturna.',
        ])->assertRedirect();

        $item = ContentItem::where('title', 'Demostracion multimedia')->firstOrFail();
        $this->assertEqualsCanonicalizing(['image', 'pdf', 'youtube'], $item->assets()->pluck('kind')->all());
        $this->actingAs($admin)->patch('/admin/contenido/'.$item->id.'/aprobar')->assertRedirect();

        $this->get('/guia/media-flow')->assertOk()->assertSee('Demostracion multimedia');
        $this->postJson('/guia/media-flow/preguntar', ['question' => 'Que explica sobre la mezcla nocturna?'])
            ->assertOk()
            ->assertJsonPath('answer', fn ($answer) => str_contains($answer, 'mezcla nocturna'));
    }

    public function test_topic_filters_scope_the_guide_and_chat(): void
    {
        $this->makeLink('topic-flow', 10);
        $items = [
            ['topic' => 'health', 'title' => 'Rutina Cardiozen', 'body' => 'Cardiozen acompana una rutina de bienestar personal.'],
            ['topic' => 'business', 'title' => 'Plan Comerciomax', 'body' => 'Comerciomax explica una estrategia comercial para el equipo.'],
            ['topic' => 'mixed', 'title' => 'Programa Nexusmixto', 'body' => 'Nexusmixto relaciona bienestar y crecimiento del negocio.'],
        ];

        foreach ($items as $data) {
            $item = ContentItem::create($data + [
                'type' => 'instruction',
                'summary' => '',
                'active' => true,
                'status' => 'published',
            ]);
            app(\App\Services\ContentIndexer::class)->reindex($item);
        }

        $this->get('/guia/topic-flow')
            ->assertOk()
            ->assertSee('data-topic="health"', false)
            ->assertSee('data-topic="business"', false)
            ->assertSee('data-topic="mixed"', false);

        $notFound = 'No encontré esa respuesta en la información aprobada. Consulta directamente con tu asesor.';
        $this->postJson('/guia/topic-flow/preguntar', ['question' => 'Que explica Comerciomax?', 'scope' => 'health'])
            ->assertOk()->assertJsonFragment(['answer' => $notFound]);
        $this->postJson('/guia/topic-flow/preguntar', ['question' => 'Que explica Comerciomax?', 'scope' => 'business'])
            ->assertOk()->assertJsonPath('answer', fn ($answer) => str_contains($answer, 'estrategia comercial'));
        $this->postJson('/guia/topic-flow/preguntar', ['question' => 'Que dice Nexusmixto?', 'scope' => 'health'])
            ->assertOk()->assertJsonPath('answer', fn ($answer) => str_contains($answer, 'bienestar y crecimiento'));
        $this->postJson('/guia/topic-flow/preguntar', ['question' => 'Que dice Cardiozen?', 'scope' => 'mixed'])
            ->assertOk()->assertJsonFragment(['answer' => $notFound]);
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
