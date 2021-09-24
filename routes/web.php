<?php

use App\Http\Controllers\ImageController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\UserController;

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

Route::middleware(['auth', 'verified'])->group(function () {
    
    Route::get('/dashboard', [UserController::class, 'dashboard'])->name('dashboard');

    // Users
    Route::get('/admin/user', [UserController::class, 'user'])->name('user');
    Route::get('admin/user/create', [UserController::class, 'createUser'])->name('create_user');
    Route::get('/admin/user/edit/{id}', [UserController::class, 'editUser'])->name('edit_user');
    Route::delete('/admin/user/delete', [UserController::class, 'deleteUser'])->name('delete_user');
    Route::post('/admin/user/registration', [UserController::class, 'storeUserRegistration'])->name('store_user_data');
    Route::get('/admin/user/{id}', [UserController::class, 'userDetail'])->name('user_detail');



    Route::get('/account/registration', [UserController::class, 'accountRegistration'])->name('account_registration');

    Route::post('/account/registration', [UserController::class, 'storeAccountRegistration'])->name('store_account_registration');

    Route::get('/account/{id}/template/new', [UserController::class, 'newTemplate'])->name('new_template');

    Route::post('/account/{id}/template', [UserController::class, 'createNewTemplate'])->name('create_new_template');

    Route::get('/account/{id}', [UserController::class, 'showAccount'])->name('account_view');

    Route::get('/image/{type}/{id}', [ImageController::class, 'showImage'])->name('show_image');
});


require __DIR__.'/auth.php';
