<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MessageLogController;

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

Route::middleware(['auth:sanctum'])->group(function () {
    // Message send from CRM
    if( isset($_POST['template']) && $_POST['template'] != ''){
        Route::post('/vtSendMessage', [MessageLogController::class, 'sendTemplateMessage']);
    } else {
        Route::post('/vtSendMessage', [MessageLogController::class, 'sendMessage']);
    }
    Route::post('/vtFetchTemplate', [MessageLogController::class, 'getTemplates']);
});




//Route::middleware(['auth', 'verified'])->group(function () {
Route::get('/sendImageTemplateMessages', [MessageLogController::class, 'sendImageTemplateMessages'])->name('send_message');    
Route::get('/sendMessages', [MessageLogController::class, 'sendMessage'])->name('send_message');    
Route::get('/sendMessageResponse', [MessageLogController::class, 'sendMessageResponse'])->name('send_message_response');    
Route::get('/incomingMessageResponse', [MessageLogController::class, 'incomingMessageResponse'])->name('incoming_message_response');    
//});
