<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TemplateController;
use App\Http\Controllers\InteractiveMessageController;
use App\Http\Controllers\MessageLogController;
use App\Http\Controllers\MsgController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\AutomationController;
use App\Http\Controllers\OpportunityController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\LeadController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\OrganizationController;
use App\Http\Controllers\WhatsAppUsersController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\FormController;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\CatalogController;


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

Route::post('/create-admin-user', [SettingsController::class , 'createAdminUser']);

//Route::get('/impersonate-company', [CompanyController::class , 'sendCompanyKeyToAdmin']);

Route::post('/webhook/v1/', [AutomationController::class , 'storeWebActionData'])->name('web_hook_event');

Route::middleware([ 'App\Http\Middleware\ApiRestriction'])->group(function() {
  
  Route::post('/admin/impersonate-company', [CompanyController::class , 'sendCompanyKeyToAdmin']);
  
  Route::post('/admin/update/social-profile', [UserController::class, 'updateApiAccount']);
  Route::post('/admin/update/payment-method', [CompanyController::class, 'updatePaymentMethod']);
  
  Route::post('/admin/reset-balance', [MsgController::class, 'resetWalletBalance']);
  Route::post('/admin/update-service-engine', [CompanyController::class, 'changeServiceEngine']);
  Route::post('/admin/update-post_limit', [CompanyController::class, 'updatePostLimit']);

  // Sessions 
  Route::get('/admin/get-sessions-count', [CompanyController::class , 'getSessionsData']);

  // Stripe Account
  Route::get('/admin/stripe-incoming', [SettingsController::class, 'updatePayment']);
  Route::post('/admin/stripe-incoming', [SettingsController::class, 'updatePayment']);
  Route::post('/admin/update-invoice', [SettingsController::class, 'updateInvoiceStatus']);

  // FaceBook & Instagram Messages
  Route::post('/admin/fb-insta-messages', [MsgController::class, 'fbInstaMsgHandler']);

  // Template
  Route::post('/admin/update-fb-template-status', [TemplateController::class, 'updateTemplateStatus']);

});

Route::middleware(['auth:sanctum', 'App\Http\Middleware\ApiRestriction'])->group(function() {

    // Fetch user account data
    Route::get('/vtFetchData', [SettingsController::class , 'fetchUserAccountData']);
    
    Route::get('/v1/social-profiles', [SettingsController::class , 'getSocialProfileList']);

    // Send whatsapp message
    Route::post('/v1/send-message', [MsgController::class, 'sendAPIMessage']);

    // Return list of templates
    Route::get('/v1/{account_id}/get-wa-templates', [TemplateController::class, 'getTemplates']);
    Route::get('/v1/get-interactive-templates', [InteractiveMessageController::class, 'index']);

    // Create new template
    Route::post('/v1/{account_id}/create-wa-template', [TemplateController::class, 'createWhatsAppTemplateViaAPI']);

    // Opt-in Gupshup  user
    Route::post('/v1/{account_id}/user-optin', [WhatsAppUsersController::class, 'userOptIn']);

    //CRUD Contact
    Route::get('/v1/contact', [ContactController::class, 'index']);
    Route::post('/v1/contact', [ContactController::class, 'store']);    
    Route::get('/v1/contact/{id}', [ContactController::class, 'show']);
    Route::post('/v1/contact/{id}', [ContactController::class, 'update']);
    Route::delete('/v1/contact/{id}', [ContactController::class, 'destroy']);

    //CRUD Opportunities
    Route::get('/v1/deal', [OpportunityController::class, 'index']);
    Route::post('/v1/deal', [OpportunityController::class, 'store']);
    Route::get('/v1/deal/{id}', [OpportunityController::class, 'show']);
    Route::post('/v1/deal/{id}', [OpportunityController::class, 'update']);
    Route::delete('/v1/deal/{id}', [OpportunityController::class, 'destroy']);

    //CRUD Products
    Route::get('/v1/product', [ProductController::class, 'index']);
    Route::get('/v1/product/{id}', [ProductController::class, 'show']);
    Route::post('/v1/product', [ProductController::class, 'store']);
    Route::post('/v1/product/{id}', [ProductController::class, 'update']);
    Route::delete('/v1/product/{id}', [ProductController::class, 'destroy']);

    //CRUD Orders
    Route::get('/v1/order', [OrderController::class, 'index']);
    Route::get('/v1/order/{id}', [OrderController::class, 'show']);
    Route::post('/v1/order', [OrderController::class, 'store']);
    Route::post('/v1/order/{id}', [OrderController::class, 'update']);
    Route::delete('/v1/order/{id}', [OrderController::class, 'destroy']);

     //CRUD Leads
     Route::get('/v1/lead', [LeadController::class, 'index']);
     Route::get('/v1/lead/{id}', [LeadController::class, 'show']);
     Route::post('/v1/lead', [LeadController::class, 'store']);
     Route::post('/v1/lead/{id}', [LeadController::class, 'update']);
     Route::delete('/v1/lead/{id}', [LeadController::class, 'destroy']);
     Route::post('/v1/convertLead/{id}', [LeadController::class, 'convert_lead']);

      //CRUD Ordganizations
    Route::get('/v1/organization', [OrganizationController::class, 'index']);
    Route::get('/v1/organization/{id}', [OrganizationController::class, 'show']);
    Route::post('/v1/organization', [OrganizationController::class, 'store']);
    Route::post('/v1/organization/{id}', [OrganizationController::class, 'update']);
    Route::delete('/v1/organization/{id}', [OrganizationController::class, 'destroy']);

     //CRUD Catalog
     Route::get('/v1/catalog', [CatalogController::class, 'index']);
     Route::get('/v1/catalog/{id}', [CatalogController::class, 'show']);
     Route::post('/v1/catalog', [CatalogController::class, 'createCatalog']);
     Route::post('/v1/catalog/{id}', [CatalogController::class, 'createCatalog']);
     Route::delete('/v1/catalog/{id}', [CatalogController::class, 'destroy']);
    //fields
    Route::get('/v1/{module_name}/fields', [FormController::class, 'fetchModuleFields']);

    // Check a Contact chat session is active
    Route::get('/v1/{account_id}/contact-status/{contact_number}', [WhatsAppUsersController::class, 'checkActiveStatus']);
    Route::get('/v1/{account_id}/contact-status1/{contact_number}', [WhatsAppUsersController::class, 'checkGupshupStatus']);

    //Shopify API EntryPoint
    Route::get('/v1/message-log', [UserController::class, 'fetchMessageLog']);
    Route::get('/v1/shopify-dashboard', [UserController::class, 'shopifyDashboard']);
  });
