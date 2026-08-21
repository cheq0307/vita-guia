<?php

namespace Tests\Feature;

use App\Models\AccessLink;
use App\Models\ContentAsset;
use App\Models\ContentItem;
use App\Models\User;
use App\Services\ContentIndexer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MobileApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_android_reuses_its_session_without_spending_another_open(): void
    {
        $link = $this->makeLink('android-link', 1);
        $payload = [
            'token' => 'android-link',
            'client_id' => '11111111-1111-4111-8111-111111111111',
            'platform' => 'android',
            'app_version' => '1.0.0',
        ];

        $first = $this->postJson('/api/v1/access/open', $payload)
            ->assertOk()
            ->assertJsonPath('data.token_type', 'Bearer')
            ->assertJsonPath('data.platform', 'android')
            ->assertJsonPath('data.guide_path', '/api/v1/guide');

        $bearer = $first->json('data.access_token');
        $this->assertNotEmpty($bearer);

        $this->postJson('/api/v1/access/open', $payload)
            ->assertOk()
            ->assertJsonPath('data.access_token', $bearer);

        $this->assertSame(1, $link->fresh()->open_count);

        $this->postJson('/api/v1/access/open', array_replace($payload, [
            'client_id' => '22222222-2222-4222-8222-222222222222',
        ]))->assertStatus(410);
    }

    public function test_mobile_guide_requires_bearer_and_returns_only_published_modules(): void
    {
        $this->makeLink('guide-api');
        ContentItem::create([
            'type' => 'product',
            'topic' => 'health',
            'title' => 'Contenido movil publicado',
            'summary' => 'Resumen para Android.',
            'body' => 'Informacion aprobada.',
            'active' => true,
            'status' => 'published',
        ]);
        ContentItem::create([
            'type' => 'product',
            'topic' => 'mixed',
            'title' => 'Borrador privado',
            'summary' => '',
            'body' => 'No debe salir por API.',
            'active' => false,
            'status' => 'review',
        ]);

        $this->getJson('/api/v1/guide')->assertUnauthorized();

        $bearer = $this->open('guide-api', 'android');
        $this->withToken($bearer)->getJson('/api/v1/guide')
            ->assertOk()
            ->assertJsonPath('data.modules.0.id', 'products')
            ->assertJsonPath('data.modules.0.items.0.title', 'Contenido movil publicado')
            ->assertJsonFragment(['id' => 'business', 'includes' => ['business', 'mixed']])
            ->assertJsonMissing(['title' => 'Borrador privado']);
    }

    public function test_mobile_chat_respects_topic_scope(): void
    {
        $this->makeLink('chat-api');
        $item = ContentItem::create([
            'type' => 'instruction',
            'topic' => 'business',
            'title' => 'Comerciomax movil',
            'summary' => '',
            'body' => 'Comerciomax contiene una estrategia comercial para distribuidores.',
            'active' => true,
            'status' => 'published',
        ]);
        app(ContentIndexer::class)->reindex($item);
        $bearer = $this->open('chat-api', 'android');

        $notFound = 'No encontré esa respuesta en la información aprobada. Consulta directamente con tu asesor.';
        $this->withToken($bearer)->postJson('/api/v1/chat', [
            'question' => 'Que explica Comerciomax?',
            'scope' => 'health',
        ])->assertOk()->assertJsonFragment(['answer' => $notFound]);

        $this->withToken($bearer)->postJson('/api/v1/chat', [
            'question' => 'Que explica Comerciomax?',
            'scope' => 'business',
        ])->assertOk()->assertJsonPath(
            'answer',
            fn ($answer) => str_contains($answer, 'estrategia comercial'),
        );
    }

    public function test_private_assets_and_ios_use_the_same_api_contract(): void
    {
        Storage::fake('local');
        $this->makeLink('ios-api');
        $item = ContentItem::create([
            'type' => 'instruction',
            'topic' => 'mixed',
            'title' => 'Manual privado',
            'summary' => '',
            'body' => 'Manual para ambas plataformas.',
            'active' => true,
            'status' => 'published',
        ]);
        Storage::disk('local')->put('content/manual.pdf', 'PDF de prueba');
        $asset = ContentAsset::create([
            'content_item_id' => $item->id,
            'kind' => 'pdf',
            'storage_path' => 'content/manual.pdf',
            'original_name' => 'manual.pdf',
            'mime_type' => 'application/pdf',
            'size_bytes' => 13,
            'extraction_status' => 'ready',
        ]);

        $response = $this->postJson('/api/v1/access/open', [
            'token' => 'ios-api',
            'client_id' => '33333333-3333-4333-8333-333333333333',
            'platform' => 'ios',
            'app_version' => '1.0.0',
        ])->assertOk()->assertJsonPath('data.platform', 'ios');

        $this->getJson('/api/v1/assets/'.$asset->id)->assertUnauthorized();
        $this->withToken($response->json('data.access_token'))
            ->get('/api/v1/assets/'.$asset->id)
            ->assertOk()
            ->assertHeader('content-type', 'application/pdf');
    }

    private function open(string $token, string $platform): string
    {
        return $this->postJson('/api/v1/access/open', [
            'token' => $token,
            'client_id' => 'aaaaaaaa-aaaa-4aaa-8aaa-'.substr(hash('sha256', $token), 0, 12),
            'platform' => $platform,
            'app_version' => '1.0.0',
        ])->assertOk()->json('data.access_token');
    }

    private function makeLink(string $token, int $maxOpens = 3): AccessLink
    {
        $advisor = User::create([
            'name' => 'Asesor API',
            'email' => $token.'@api.test',
            'password' => 'password-segura',
            'role' => 'advisor',
            'active' => true,
        ]);

        return AccessLink::create([
            'advisor_id' => $advisor->id,
            'token_hash' => hash('sha256', $token),
            'token' => $token,
            'recipient_name' => 'Cliente movil',
            'recipient_contact' => '',
            'expires_at' => now()->addDay(),
            'max_opens' => $maxOpens,
        ]);
    }
}
