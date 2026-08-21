<?php

namespace Database\Seeders;

use App\Models\ContentItem;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $adminPassword = env('ADMIN_PASSWORD');
        if (! $adminPassword && app()->environment('production')) {
            throw new \RuntimeException('Define ADMIN_PASSWORD antes de ejecutar el seeder.');
        }
        $adminPassword ??= 'CambiarEstaClave123!';

        User::updateOrCreate(
            ['email' => env('ADMIN_EMAIL', 'admin@vita-guia.local')],
            [
                'name' => 'Administrador Vita Guia',
                'password' => $adminPassword,
                'role' => 'admin',
                'active' => true,
            ],
        );

        if (app()->environment('production')) {
            return;
        }

        User::updateOrCreate(
            ['email' => 'asesor@vita-guia.local'],
            [
                'name' => 'Asesor de demostracion',
                'password' => env('ADVISOR_PASSWORD', 'AsesorDemo123!'),
                'role' => 'advisor',
                'active' => true,
            ],
        );

        User::updateOrCreate(
            ['email' => 'profesional@vita-guia.local'],
            [
                'name' => 'Profesional de demostracion',
                'password' => env('PROFESSIONAL_PASSWORD', 'ProfesionalDemo123!'),
                'role' => 'professional',
                'active' => true,
            ],
        );

        $items = [
            ['type' => 'product', 'topic' => 'health', 'title' => 'Producto de ejemplo', 'summary' => 'Informacion general disponible para cada cliente.', 'body' => 'Agrega aqui la descripcion real, ingredientes, presentacion y cualquier advertencia autorizada del producto.', 'sort_order' => 10],
            ['type' => 'instruction', 'topic' => 'health', 'title' => 'Como utilizarlo', 'summary' => 'Sigue siempre las indicaciones proporcionadas por tu asesor.', 'body' => 'Este contenido es demostrativo. El administrador puede reemplazarlo con instrucciones claras, horarios y recomendaciones de uso.', 'sort_order' => 20],
            ['type' => 'story', 'topic' => 'health', 'title' => 'Historia de experiencia', 'summary' => 'Espacio para compartir testimonios reales y autorizados.', 'body' => 'Los testimonios representan experiencias personales y no sustituyen una evaluacion profesional.', 'sort_order' => 30],
        ];

        foreach ($items as $item) {
            ContentItem::firstOrCreate(['title' => $item['title']], $item + ['active' => true]);
        }
    }
}
