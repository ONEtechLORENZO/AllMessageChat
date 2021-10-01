<?php

use App\Http\Controllers\ImageController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\MessageLogController;


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

Route::get('/incoming', function () {

});

Route::post('/incoming', function () {

});

Route::middleware(['auth', 'verified'])->group(function () {
    
    Route::get('/dashboard', [UserController::class, 'dashboard'])->name('dashboard');

    // Users
    Route::get('/admin/user', [UserController::class, 'user'])->name('user');
    Route::get('admin/user/create', [UserController::class, 'createUser'])->name('create_user');
    Route::get('/admin/user/edit/{id}', [UserController::class, 'editUser'])->name('edit_user');
    Route::delete('/admin/user/delete', [UserController::class, 'deleteUser'])->name('delete_user');
    Route::post('/admin/user/registration', [UserController::class, 'storeUserRegistration'])->name('store_user_data');
    Route::get('/admin/user/{id}', [UserController::class, 'userDetail'])->name('user_detail');

    // Settings
    Route::get('/admin/settings/outgoing_server' , [SettingsController::class, 'settings'])->name('settings');
    Route::get('/admin/settings/to_mail' , [SettingsController::class, 'toMail'])->name('to_mail');
    Route::post('/admin/settings/saveSMTP', [SettingsController::class, 'saveOutgoingServerData'])->name('store_smtp_data');
    Route::post('/admin/settings/saveToAddress', [SettingsController::class, 'saveToAddressData'])->name('store_toAddress_data');

    // Messages
    Route::get('/messages/list' , [MessageLogController::class , 'list'])->name('messages');
    Route::get('/messages/destination' , [MessageLogController::class , 'destination'])->name('destination');

    Route::get('/account/registration', [UserController::class, 'accountRegistration'])->name('account_registration');

    Route::post('/account/registration', [UserController::class, 'storeAccountRegistration'])->name('store_account_registration');

    Route::post('/account/{id}/template', [UserController::class, 'createNewTemplate'])->name('create_new_template');

    Route::get('/account/{id}/template/{template_id}', [UserController::class, 'templateDetailView'])->name('template_detail_view');

    Route::post('/account/{id}/template/{template_id}', [UserController::class, 'storeTemplate'])->name('store_template');

    Route::get('/account/{id}', [UserController::class, 'showAccount'])->name('account_view');

    Route::get('/image/{type}/{id}', [ImageController::class, 'showImage'])->name('show_image');
});


require __DIR__.'/auth.php';
