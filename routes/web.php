<?php

use App\Http\Controllers\ImageController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PriceController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\MessageLogController;
use App\Http\Controllers\MsgController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\FilterController;
use App\Http\Middleware\IsAdmin;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::post('/incoming', [MsgController::class, 'incoming']);

// Check user login
Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('/dashboard', [UserController::class, 'dashboard'])->name('dashboard');
    
    // Profile
    Route::get('/user/profile', [UserController::class, 'userDetail'])->name('profile');
    Route::get('/user/{id}', [UserController::class, 'userDetail'])->name('user_profile');
    Route::get('/user/edit/{id}', [UserController::class, 'editUser'])->name('edit_profile');
    Route::post('/user/registration', [UserController::class, 'storeUserRegistration'])->name('store_user_data');
    Route::get('/image/{type}/{id}', [ImageController::class, 'showImage'])->name('show_image');
    Route::post('/user/regenerate_token', [UserController::class, 'regenerateToken'])->name('regenerate_token');

    // Messages
    Route::get('/messages/list', [MessageLogController::class, 'list'])->name('messages');
    Route::post('/messages/search_content', [MessageLogController::class, 'searchContent'])->name('searchContent');   
    Route::get('/messages', [MsgController::class, 'messageList'])->name('message_list');

    // Accounts
    Route::get('/account/registration', [UserController::class, 'accountRegistration'])->name('account_registration');
    Route::get('/account/edit/{id}', [UserController::class, 'editAccountData'])->name('edit_account');
    Route::post('/account/storeRegistration', [UserController::class, 'storeAccountRegistration'])->name('store_account_registration');
    Route::post('/account/{id}/template', [UserController::class, 'createNewTemplate'])->name('create_new_template');
    Route::get('/account/{id}/template/{template_id}', [UserController::class, 'templateDetailView'])->name('template_detail_view');
    Route::post('/account/{id}/template/{template_id}', [UserController::class, 'storeTemplate'])->name('store_template');
    Route::get('/account/{id}', [UserController::class, 'showAccount'])->name('account_view');
    Route::post('/account/delete_account', [UserController::class, 'deleteAccount'])->name('delete_account');
    Route::post('/saveTemplateStatus/account/{acc_id}/template/{tmp_id}', [UserController::class, 'saveTemplateStatus'])->name('template_status_form');

    // Webhook Events
    Route::post('/account/{id}/webhook_event', [UserController::class, 'createWebhookEvent'])->name('create_webhook_event');
    Route::post('/account/{id}/webhook_event/{webhook_id}', [UserController::class, 'updateWebhookURL'])->name('update_webhook_url');
    Route::post('/account/{id}/delete', [UserController::class, 'deleteWebhookEvent'])->name('delete_webhook_event');

    // Conversation Page
    Route::get('/chat', [MsgController::class, 'ChatList'])->name('chat_list');
    Route::get('/getMessages', [MsgController::class, 'getMessageList'])->name('get_message_list');
    Route::post('/sendMessage', [MsgController::class, 'sendMessage'])->name('send_message_to_contact');

    //Contact
    Route::get('/contacts', [ContactController::class, 'list'])->name('contacts');
    Route::get('/contact/{id}', [ContactController::class, 'contactDetail'])->name('contact_detail');
    Route::post('/updateContact', [ContactController::class, 'storeContact'])->name('store_contact');
    Route::get('/getContactDetail', [ContactController::class, 'getContactData'])->name('get_contact_data');
    Route::get('/getFilterContacts', [ContactController::class, 'getFilterContactList'])->name('get_filter_contact');

    //Filter
    Route::get('/getFilterData', [FilterController::class, 'getFilterData'])->name('get_filter_data');
});

// Check user is admin
Route::middleware('auth', IsAdmin::class)->group(function () {
    // Users
    Route::get('/admin/users', [UserController::class, 'usersListing'])->name('usersListing');
    Route::get('/admin/user/create', [UserController::class, 'createUser'])->name('create_user');
    Route::get('/admin/user/edit/{id}', [UserController::class, 'editUser'])->name('edit_user');
    Route::get('/admin/user/delete', [UserController::class, 'deleteUser'])->name('delete_user');
    Route::get('/admin/user/{id}', [UserController::class, 'userDetail'])->name('user_detail');
    Route::post('/admin/user/change_password/{id}', [UserController::class, 'changePassword'])->name('change_password');

    // Settings
    Route::get('/admin/settings/outgoing_server', [SettingsController::class, 'settings'])->name('settings');
    Route::get('/admin/settings/template_notification', [SettingsController::class, 'toMail'])->name('template_notification');
    Route::post('/admin/settings/saveSMTP', [SettingsController::class, 'saveOutgoingServerData'])->name('store_smtp_data');
    Route::post('/admin/settings/saveToAddress', [SettingsController::class, 'saveToAddressData'])->name('store_toAddress_data');

    // Pricing
    Route::get('/admin/pricing', [PriceController::class, 'index'])->name('priceListing');
});


require __DIR__ . '/auth.php';
