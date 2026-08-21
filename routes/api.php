<?php

use App\Http\Controllers\Api\V1\AccessController;
use App\Http\Controllers\Api\V1\GuideController;
use App\Http\Controllers\ContentAssetController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->name('api.v1.')->group(function (): void {
    Route::post('/access/open', [AccessController::class, 'open'])
        ->middleware('throttle:20,1')
        ->name('access.open');

    Route::middleware(['client.access', 'throttle:120,1'])->group(function (): void {
        Route::get('/guide', [GuideController::class, 'show'])->name('guide.show');
        Route::post('/chat', [GuideController::class, 'chat'])
            ->middleware('throttle:30,1')
            ->name('chat');
        Route::get('/assets/{asset}', [ContentAssetController::class, 'api'])
            ->name('assets.show');
    });
});
