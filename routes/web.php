<?php

use App\Http\Controllers\ImageController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\MessageLogController;
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

Route::post('/incoming', [MessageLogController::class, 'messageConfig']);
Route::get('/incoming-cm', [MessageLogController::class, 'incomingMessageResponse'])->name('incoming_message_response');

// Check user login
Route::middleware(['auth', 'verified'])->group(function () {


    Route::get('/dashboard', [UserController::class, 'dashboard'])->name('dashboard');
    
    Route::get('/user/{id}', [UserController::class, 'userDetail'])->name('user_profile');

    // Messages
    Route::get('/messages/list', [MessageLogController::class, 'list'])->name('messages');
    Route::get('/messages/destination', [MessageLogController::class, 'destination'])->name('destination');
    Route::post('/messages/search_content', [MessageLogController::class, 'searchContent'])->name('searchContent');

    // Accounts
    Route::get('/account/registration', [UserController::class, 'accountRegistration'])->name('account_registration');
    Route::get('/account/edit/{id}', [UserController::class, 'editAccountData'])->name('edit_account');
    Route::post('/account/storeRegistration', [UserController::class, 'storeAccountRegistration'])->name('store_account_registration');
    Route::post('/account/{id}/template', [UserController::class, 'createNewTemplate'])->name('create_new_template');
    Route::get('/account/{id}/template/{template_id}', [UserController::class, 'templateDetailView'])->name('template_detail_view');
    Route::post('/account/{id}/template/{template_id}', [UserController::class, 'storeTemplate'])->name('store_template');
    Route::get('/account/{id}', [UserController::class, 'showAccount'])->name('account_view');
    Route::delete('/account/delete_account', [UserController::class, 'deleteAccount'])->name('delete_account');
    Route::post('saveTemplateStatus/account/{acc_id}/template/{tmp_id}', [UserController::class, 'saveTemplateStatus'])->name('template_status_form');

    Route::get('/image/{type}/{id}', [ImageController::class, 'showImage'])->name('show_image');

    // Create new Incoming URL
    Route::post('account/{id}/incoming_url', [UserController::class, 'createNewIncomingURL'])->name('create_new_incoming_url');
});

// Check user is admin
Route::middleware('auth', IsAdmin::class)->group(function () {
    // Users
    Route::get('/admin/user', [UserController::class, 'user'])->name('user');
    Route::get('admin/user/create', [UserController::class, 'createUser'])->name('create_user');
    Route::get('admin/user/edit/{id}', [UserController::class, 'editUser'])->name('edit_user');
    Route::get('/admin/user/delete', [UserController::class, 'deleteUser'])->name('delete_user');
    Route::post('/admin/user/registration', [UserController::class, 'storeUserRegistration'])->name('store_user_data');
    Route::get('/admin/user/{id}', [UserController::class, 'userDetail'])->name('user_detail');
    Route::post('/admin/user/regenerate_token', [UserController::class, 'regenerateToken'])->name('regenerate_token');
    Route::post('/admin/user/change_password/{id}', [UserController::class, 'changePassword'])->name('change_password');

    // Settings
    Route::get('/admin/settings/outgoing_server', [SettingsController::class, 'settings'])->name('settings');
    Route::get('/admin/settings/template_notification', [SettingsController::class, 'toMail'])->name('template_notification');
    Route::post('/admin/settings/saveSMTP', [SettingsController::class, 'saveOutgoingServerData'])->name('store_smtp_data');
    Route::post('/admin/settings/saveToAddress', [SettingsController::class, 'saveToAddressData'])->name('store_toAddress_data');
});


require __DIR__ . '/auth.php';
