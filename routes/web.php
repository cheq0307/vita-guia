<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AdvisorController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\GuideController;
use App\Http\Controllers\ProfessionalController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function (): void {
    Route::get('/login', [AuthController::class, 'show'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->name('login.store');
});

Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth')->name('logout');

Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function (): void {
    Route::get('/', [AdminController::class, 'dashboard'])->name('dashboard');
    Route::post('/usuarios', [AdminController::class, 'storeUser'])->name('users.store');
    Route::patch('/usuarios/{user}/estado', [AdminController::class, 'toggleUser'])->name('users.toggle');
    Route::get('/contenido', [AdminController::class, 'content'])->name('content');
    Route::post('/contenido', [AdminController::class, 'storeContent'])->name('content.store');
    Route::patch('/contenido/{item}/aprobar', [AdminController::class, 'approveContent'])->name('content.approve');
    Route::patch('/contenido/{item}/rechazar', [AdminController::class, 'rejectContent'])->name('content.reject');
    Route::delete('/contenido/{item}', [AdminController::class, 'destroyContent'])->name('content.destroy');
});

Route::middleware(['auth', 'role:professional'])->prefix('profesional')->name('professional.')->group(function (): void {
    Route::get('/', [ProfessionalController::class, 'dashboard'])->name('dashboard');
    Route::post('/contenido', [ProfessionalController::class, 'store'])->name('content.store');
    Route::get('/contenido/{item}/editar', [ProfessionalController::class, 'edit'])->name('content.edit');
    Route::put('/contenido/{item}', [ProfessionalController::class, 'update'])->name('content.update');
    Route::delete('/contenido/{item}', [ProfessionalController::class, 'destroy'])->name('content.destroy');
});

Route::middleware(['auth', 'role:advisor'])->prefix('asesor')->name('advisor.')->group(function (): void {
    Route::get('/', [AdvisorController::class, 'dashboard'])->name('dashboard');
    Route::post('/enlaces', [AdvisorController::class, 'storeLink'])->name('links.store');
    Route::patch('/enlaces/{link}/revocar', [AdvisorController::class, 'revokeLink'])->name('links.revoke');
});

Route::get('/guia/{token}', [GuideController::class, 'show'])->name('guide.show');
Route::post('/guia/{token}/preguntar', [GuideController::class, 'chat'])->middleware('throttle:30,1')->name('guide.chat');

Route::get('/', fn () => auth()->check()
    ? redirect()->route(auth()->user()->homeRoute())
    : redirect()->route('login'));
