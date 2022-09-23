<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TemplateController;
use App\Http\Controllers\MessageLogController;
use App\Http\Controllers\MsgController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\AutomationController;

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
    Route::post('/updateContact', [ContactController::class, 'store']);
    Route::get('/contacts', [ContactController::class, 'index']);
    Route::get('/contact/{id}', [ContactController::class, 'getContactData']);
    Route::post('/updateContact/{id}', [ContactController::class, 'update']);
    Route::delete('/contactdelete/{id}', [ContactController::class, 'destroy']);



});