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
use App\Http\Controllers\LeadController;
use App\Http\Controllers\OrganizationController;

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
    Route::post('/v1/send-wa-message', [MsgController::class, 'sendAPIMessage']);

    // Return list of templates
    Route::get('/v1/{account_id}/get-wa-templates', [TemplateController::class, 'getTemplates']);

    // Create new template
    Route::post('/v1/{account_id}/create-wa-template', [TemplateController::class, 'createWhatsAppTemplateViaAPI']);

    //CRUD Contact
    Route::get('/v1/{account_id}/contact', [ContactController::class, 'index']);
    Route::post('/v1/{account_id}/contact', [ContactController::class, 'store']);    
    Route::get('/v1/{account_id}/contact/{id}', [ContactController::class, 'show']);
    Route::post('/v1/{account_id}/contact/{id}', [ContactController::class, 'update']);
    Route::delete('/v1/{account_id}/contact/{id}', [ContactController::class, 'destroy']);

    //CRUD Opportunities
    Route::get('/v1/{account_id}/opportunity', [OpportunityController::class, 'index']);
    Route::post('/v1/{account_id}/opportunity', [OpportunityController::class, 'store']);
    Route::get('/v1/{account_id}/opportunity/{id}', [OpportunityController::class, 'show']);
    Route::post('/v1/{account_id}/opportunity/{id}', [OpportunityController::class, 'update']);
    Route::delete('/v1/{account_id}/opportunity/{id}', [OpportunityController::class, 'destroy']);

    //CRUD Products
    Route::get('/v1/{account_id}/product', [ProductController::class, 'index']);
    Route::get('/v1/{account_id}/product/{id}', [ProductController::class, 'show']);
    Route::post('/v1/{account_id}/product', [ProductController::class, 'store']);
    Route::post('/v1/{account_id}/product/{id}', [ProductController::class, 'update']);
    Route::delete('/v1/{account_id}/product/{id}', [ProductController::class, 'destroy']);

    //CRUD Orders
    Route::get('/v1/{account_id}/order', [OrderController::class, 'index']);
    Route::get('/v1/{account_id}/order/{id}', [OrderController::class, 'show']);
    Route::post('/v1/{account_id}/order', [OrderController::class, 'store']);
    Route::post('/v1/{account_id}/order/{id}', [OrderController::class, 'update']);
    Route::delete('/v1/{account_id}/order/{id}', [OrderController::class, 'destroy']);

     //CRUD Leads
     Route::get('/v1/{account_id}/lead', [LeadController::class, 'index']);
     Route::get('/v1/{account_id}/lead/{id}', [LeadController::class, 'show']);
     Route::post('/v1/{account_id}/lead', [LeadController::class, 'store']);
     Route::post('/v1/{account_id}/lead/{id}', [LeadController::class, 'update']);
     Route::delete('/v1/{account_id}/lead/{id}', [LeadController::class, 'destroy']);
     Route::post('/v1/{account_id}/convertLead/{id}', [LeadController::class, 'convert_lead']);

      //CRUD Ordganizations
    Route::get('/v1/{account_id}/organization', [OrganizationController::class, 'index']);
    Route::get('/v1/{account_id}/organization/{id}', [OrganizationController::class, 'show']);
    Route::post('/v1/{account_id}/organization', [OrganizationController::class, 'store']);
    Route::post('/v1/{account_id}/organization/{id}', [OrganizationController::class, 'update']);
    Route::delete('/v1/{account_id}/organization/{id}', [OrganizationController::class, 'destroy']);

});