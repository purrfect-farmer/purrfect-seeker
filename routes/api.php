<?php

use App\Http\Controllers\ServerController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});


Route::get('/servers/{server}', [ServerController::class, 'show']);
Route::get('/servers', [ServerController::class, 'index']);
Route::post('/servers', [ServerController::class, 'update']);
