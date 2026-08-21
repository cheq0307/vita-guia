<?php

namespace App\Http\Controllers;

use App\Models\AccessLink;
use App\Models\ContentAsset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ContentAssetController extends Controller
{
    public function staff(Request $request, ContentAsset $asset)
    {
        $asset->load('contentItem');
        abort_unless($request->user()->active, 403);

        return $this->response($asset);
    }

    public function guide(Request $request, string $token, ContentAsset $asset)
    {
        $link = AccessLink::where('token_hash', hash('sha256', $token))->firstOrFail();
        abort_unless(
            ! $link->revoked
            && $link->expires_at->isFuture()
            && $request->session()->has('opened_link_'.$link->id),
            403,
        );

        return $this->publishedResponse($asset);
    }

    public function api(Request $request, ContentAsset $asset)
    {
        abort_unless($request->attributes->has('clientAccessSession'), 401);

        return $this->publishedResponse($asset);
    }

    private function publishedResponse(ContentAsset $asset)
    {
        $asset->load('contentItem');
        abort_unless(
            $asset->contentItem->active && $asset->contentItem->status === 'published',
            404,
        );

        return $this->response($asset);
    }

    private function response(ContentAsset $asset)
    {
        abort_unless($asset->storage_path && Storage::disk('local')->exists($asset->storage_path), 404);

        return Storage::disk('local')->response(
            $asset->storage_path,
            $asset->original_name,
            ['Content-Type' => $asset->mime_type ?: 'application/octet-stream'],
            'inline',
        );
    }
}
