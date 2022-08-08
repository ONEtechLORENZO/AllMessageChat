<?php

use App\Http\Controllers\ImageController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ImportController;
use App\Http\Controllers\PriceController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\MessageLogController;
use App\Http\Controllers\MsgController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\FilterController;
use App\Http\Controllers\FormController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\NoteController;
use App\Http\Middleware\IsAdmin;
use App\Models\Contact;
use App\Models\Note;
use Barryvdh\DomPDF\Facade\Pdf;

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

Route::get('/pdfinvoice', function () {
    $pdf = App::make('dompdf.wrapper');
    $pdf->loadHTML('<!DOCTYPE html>
    <html>
        <head>
            <meta charset="utf-8" />
            <title>A simple, clean, and responsive HTML invoice template</title>
    
            <style>
                .invoice-box {
                    max-width: 800px;
                    margin: auto;
                    padding: 30px;
                    border: 1px solid #eee;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
                    font-size: 16px;
                    line-height: 24px;
                
                    color: #555;
                }
    
                .invoice-box table {
                    width: 100%;
                    line-height: inherit;
                    text-align: left;
                }
    
                .invoice-box table td {
                    padding: 5px;
                    vertical-align: top;
                }
    
                .invoice-box table tr td:nth-child(2) {
                    text-align: right;
                }
    
                .invoice-box table tr.top table td {
                    padding-bottom: 20px;
                }
    
                .invoice-box table tr.top table td.title {
                    font-size: 45px;
                    line-height: 45px;
                    color: #333;
                }
    
                .invoice-box table tr.information table td {
                    padding-bottom: 40px;
                }
    
                .invoice-box table tr.heading td {
                    background: #eee;
                    border-bottom: 1px solid #ddd;
                    font-weight: bold;
                }
    
                .invoice-box table tr.details td {
                    padding-bottom: 20px;
                }
    
                .invoice-box table tr.item td {
                    border-bottom: 1px solid #eee;
                }
    
                .invoice-box table tr.item.last td {
                    border-bottom: none;
                }
    
                .invoice-box table tr.total td:nth-child(2) {
                    border-top: 2px solid #eee;
                    font-weight: bold;
                }
    
                @media only screen and (max-width: 600px) {
                    .invoice-box table tr.top table td {
                        width: 100%;
                        display: block;
                        text-align: center;
                    }
    
                    .invoice-box table tr.information table td {
                        width: 100%;
                        display: block;
                        text-align: center;
                    }
                }
    
                /** RTL **/
                .invoice-box.rtl {
                    direction: rtl;
                    
                }
    
                .invoice-box.rtl table {
                    text-align: right;
                }
    
                .invoice-box.rtl table tr td:nth-child(2) {
                    text-align: left;
                }
            </style>
        </head>
    
        <body>
            <div class="invoice-box">
                <table cellpadding="0" cellspacing="0">
                    <tr class="top">
                        <td colspan="2">
                            <table>
                                <tr>
                                    <td class="title">
                                        <img src="https://www.sparksuite.com/images/logo.png" style="width: 100%; max-width: 300px" />
                                    </td>
    
                                    <td>
                                        Invoice #: 123<br />
                                        Created: January 1, 2015<br />
                                        Due: February 1, 2015
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
    
                    <tr class="information">
                        <td colspan="2">
                            <table>
                                <tr>
                                    <td>
                                        Sparksuite, Inc.<br />
                                        12345 Sunny Road<br />
                                        Sunnyville, CA 12345
                                    </td>
    
                                    <td>
                                        Acme Corp.<br />
                                        John Doe<br />
                                        john@example.com
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
    
                    <tr class="heading">
                        <td>Payment Method</td>
    
                        <td>Check #</td>
                    </tr>
    
                    <tr class="details">
                        <td>Check</td>
    
                        <td>1000</td>
                    </tr>
    
                    <tr class="heading">
                        <td>Item</td>
    
                        <td>Price</td>
                    </tr>
    
                    <tr class="item">
                        <td>Website design</td>
    
                        <td>$300.00</td>
                    </tr>
    
                    <tr class="item">
                        <td>Hosting (3 months)</td>
    
                        <td>$75.00</td>
                    </tr>
    
                    <tr class="item last">
                        <td>Domain name (1 year)</td>
    
                        <td>$10.00</td>
                    </tr>
    
                    <tr class="total">
                        <td></td>
    
                        <td>Total: $385.00</td>
                    </tr>
                </table>
            </div>
        </body>
    </html>');
    return $pdf->stream();
});

Route::post('/incoming', [MsgController::class, 'incoming']);

// Check user login
Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('/dashboard', [UserController::class, 'dashboard'])->name('dashboard');

    // Wallet
    Route::get('/wallet', [UserController::class, 'wallet'])->name('wallet');
    Route::post('/charge', [UserController::class, 'charge'])->name('charge');
    Route::get('/user-balance', [UserController::class, 'userBalance'])->name('userBalance');
    Route::get('/transactions', [UserController::class, 'transactions'])->name('listTransaction');
    Route::get('/invoices', [UserController::class, 'invoices'])->name('invoices');
    
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
    //Route::get('/contacts', [ContactController::class, 'index'])->name('contacts');
    Route::get('/notes/{module}/{id}', [NoteController::class, 'list_notes'])->name('listNotes');
    Route::post('/addnotes/{module}/{id}', [NoteController::class, 'addNotes'])->name('add_Notes');
    Route::get('/contacts', [ContactController::class, 'index'])->name('listContact');
    Route::delete('/contact/delete/{id}', [ContactController::class, 'deleteContact'])->name('deleteContact');

    Route::get('/contact/{id}', [ContactController::class, 'contactDetail'])->name('detailContact');
    Route::post('/updateContact/{id}', [ContactController::class, 'storeContact'])->name('updateContact');
    Route::post('/updateContact', [ContactController::class, 'storeContact'])->name('storeContact');
    Route::get('/getContactDetail', [ContactController::class, 'getContactData'])->name('editContact');
    Route::get('/getFilterContacts', [ContactController::class, 'getFilterContactList'])->name('get_filter_contact');

    //Filter
    Route::get('/getFilterData', [FilterController::class, 'getFilterData'])->name('get_filter_data');
    Route::post('/storeFilter', [FilterController::class, 'storeFilter'])->name('store_filter');
    Route::post('/deleteFilter', [FilterController::class, 'deleteFilter'])->name('delete_filter');

    // Form
    Route::get('/fetchModuleFields/{module}', [FormController::class, 'fetchModuleFields'])->name('fetchModuleFields');

    // Import
    Route::get('/import',[ImportController::class, 'index'])->name('listImport');
    Route::get('/import/create',[ImportController::class, 'create'])->name('new_import');
    Route::get('/import/detail/{id}',[ImportController::class, 'show'])->name('detailImport');
    Route::post('/import/save',[ImportController::class, 'store'])->name('import_save');
    Route::post('/import/file',[ImportController::class, 'handleFileImport'])->name('handleFileImport');
    Route::delete('/import/{id}', [ImportController::class, 'destroy'])->name('deleteImport');

    //Export
    Route::get('/export',[ExportController::class,'exportFile'])->name('export');

    //Tag
    Route::get('/tag',[TagController::class,'index'])->name('listTag');
    Route::get('/tag/getTagList',[TagController::class,'getTagList'])->name('get_tag_list');
    Route::post('/tag/store',[TagController::class,'store'])->name('storeTag');
    Route::get('/tag/{id}',[TagController::class,'edit'])->name('editTag');
    Route::post('/updateTag/{id}',[TagController::class,'update'])->name('updateTag');
    Route::delete('/deleteTag/{id}',[TagController::class,'destroy'])->name('deleteTag');

    //Category
    Route::get('/list',[CategoryController::class,'index'])->name('listCategory');
    Route::post('/list/store',[CategoryController::class,'store'])->name('storeCategory');
    Route::get('/list/{id}',[CategoryController::class,'edit'])->name('editCategory');
    Route::post('/updateList/{id}',[CategoryController::class,'update'])->name('updateCategory');
    Route::delete('/deleteList/{id}',[CategoryController::class,'destroy'])->name('deleteCategory');
    
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
    Route::get('/admin/pricing', [PriceController::class, 'index'])->name('listPrice');
    Route::get('/admin/pricing/edit/{id}', [PriceController::class, 'edit'])->name('editPrice');
    Route::post('/admin/pricing', [PriceController::class, 'store'])->name('storePrice');
    Route::post('/admin/pricing/{id}', [PriceController::class, 'update'])->name('updatePrice');
    Route::delete('/admin/pricing/{id}', [PriceController::class, 'destroy'])->name('deletePrice');
});

require __DIR__ . '/auth.php';
