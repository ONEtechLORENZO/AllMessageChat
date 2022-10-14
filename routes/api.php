<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TemplateController;
use App\Http\Controllers\MessageLogController;
use App\Http\Controllers\MsgController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\AutomationController;
use App\Http\Controllers\OpportunityController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\OrderController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::post('/webhook/v1/', [AutomationController::class , 'storeWebActionData'])->name('web_hook_event');

Route::middleware(['auth:sanctum'])->group(function() {

    // Send whatsapp message
    Route::post('/v1/{account_id}/send-wa-message', [MsgController::class, 'sendAPIMessage']);

    // Return list of templates
    Route::get('/v1/{account_id}/get-wa-templates', [TemplateController::class, 'getTemplates']);

    // Create new template
    Route::post('/v1/{account_id}/create-wa-template', [TemplateController::class, 'createWhatsAppTemplateViaAPI']);

    //CRUD Contact
    Route::post('/contact', [ContactController::class, 'store']);
    Route::get('/contact', [ContactController::class, 'index']);
    Route::get('/contact/{id}', [ContactController::class, 'getContactData']);
    Route::post('/contact/{id}', [ContactController::class, 'update']);
    Route::delete('/contact/{id}', [ContactController::class, 'destroy']);

    //CRUD Opportunities
    Route::get('/opportunity', [OpportunityController::class, 'index']);
    Route::post('/opportunity', [OpportunityController::class, 'store']);
    Route::get('/opportunity/{id}', [OpportunityController::class, 'show']);
    Route::post('/opportunity/{id}', [OpportunityController::class, 'update']);
    Route::delete('/opportunity/{id}', [OpportunityController::class, 'destroy']);

    //CRUD Products
    Route::get('/product', [ProductController::class, 'index']);
    Route::get('/product/{id}', [ProductController::class, 'show']);
    Route::post('/product', [ProductController::class, 'store']);
    Route::post('/product/{id}', [ProductController::class, 'update']);
    Route::delete('/product/{id}', [ProductController::class, 'destroy']);

    //CRUD Orders
    Route::get('/order', [OrderController::class, 'index']);
    Route::get('/order/{id}', [OrderController::class, 'show']);
    Route::post('/order', [OrderController::class, 'store']);
    Route::post('/order/{id}', [OrderController::class, 'update']);
    Route::delete('/order/{id}', [OrderController::class, 'destroy']);

});