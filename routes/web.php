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
use App\Http\Controllers\OpportunityController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\FieldController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\CampaignController;
use App\Http\Controllers\UserInviteController;
use App\Http\Controllers\FieldGroupController;
use App\Http\Controllers\ChatListContactController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\LeadController;
use App\Http\Controllers\OrganizationController;
use App\Http\Controllers\LineItemController;
use App\Http\Controllers\AutomationController;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\DocumentController;
use App\Http\Middleware\IsAdmin;
use App\Http\Middleware\IsGlobalAdmin;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Models\Contact;
use App\Models\Document;
use App\Models\Service;
use App\Models\Company;
use App\Models\Notification;

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

Route::middleware('guest')->group(function () {
    session()->forget('global_user');
    session()->flush();

    Route::get('/', [AuthenticatedSessionController::class, 'create'])->name('login');
});

// Test
Route::get('/test', function(){
   echo "Test";
});

// Invite User
Route::get('/user-invite', [UserInviteController::class, 'relateUser']);
Route::get('/invitedUserRelation', [UserInviteController::class, 'relateUser']);

Route::post('/incoming', [MsgController::class, 'incoming']);
Route::get('/msglogin', [MessageLogController::class, 'msglogin']);

Route::get('/fb-whatsapp',[MsgController::class, 'incomingFBWhatsApp']);
Route::post('/fb-whatsapp',[MsgController::class, 'incomingFBWhatsApp']);

Route::get('/stripe-incoming',[SettingsController::class, 'updatePayment']);
Route::post('/stripe-incoming',[SettingsController::class, 'updatePayment']);

// // Add stripe Hook on  stripe
// Route::get('/add-stripe', function(){
//     $stripe = Stripe\Stripe::setApiKey(config('stripe.stripe_secret'));
//     $endpoint = \Stripe\WebhookEndpoint::create([
//         'url' => 'https://www.onemessage.chat/app/stripe-incoming',
//         'enabled_events' => [
//             'invoice.paid',
//             'invoice.payment_failed',
//         ],
//     ]);
//     // Webhook id: we_1LsRDXEI934XwyqtK8NBwD0B
//     dd($endpoint);
// });

// // Delete hook
// Route::get('/delete-stripe', function(){
//      $stripe = new \Stripe\StripeClient(config('stripe.stripe_secret'));
//      $response = $stripe->webhookEndpoints->retrieve('we_1LsRDXEI934XwyqtK8NBwD0B', []);

//     $response =$stripe->webhookEndpoints->delete(
//             'we_1LsQoBEI934Xwyqt4OK9yq8L',
//             []
//             );
//      dd($response);
// });

// Route Stripe Test
// Route::get('/stripe-test', function(){
//     $stripe = new \Stripe\StripeClient(config('stripe.stripe_secret'));
//     $response = $stripe->subscriptions->retrieve('sub_1LtBmPEI934XwyqtgIEjbWWp', []);
//     dd($response);
// });

// Check user login
Route::middleware(['auth', 'verified'])->group(function () {
     
    Route::get('/dashboard', [UserController::class, 'dashboard'])->name('dashboard');
    Route::get('/getCompanyId', [UserController::class, 'getSelectedCompany'])->name('get_selected_company');
    Route::get('/user/timezone',[UserController::class, 'getUserTimeZone'])->name('get_time_zone');
    Route::post('/show_register_step',[RegisteredUserController:: class, 'create'])->name('show_register_step');

    // FaceBook
    Route::get('/connect/fb',[UserController::class, 'connectFaceBook'])->name('connect_face_book');
    Route::get('/fb-callback',[UserController::class, 'storeFaceBookCode'])->name('store_face_book_code');
    
    // Wallet
    Route::get('/wallet', [UserController::class, 'wallet'])->name('wallet');
    Route::post('/charge', [UserController::class, 'charge'])->name('charge');
    Route::get('/user-balance', [UserController::class, 'userBalance'])->name('userBalance');
    Route::get('/transactions', [UserController::class, 'transactions'])->name('listTransaction');
    Route::get('/invoices/{id}', [UserController::class, 'invoices'])->name('invoices');    
    Route::get('/getPaymentMethods', [UserController::class, 'getPaymentMethods'])->name('getPaymentMethods');
    Route::get('/getPlanDetail/{plan}', [PlanController::class, 'getPlanDetail'])->name('get_plan_data');

    // Stripe
    Route::get('/createStripeSetupIntent', [UserController::class, 'createStripeSetupIntent'])->name('createStripeSetupIntent');
    Route::post('/relatePaymentMethod', [UserController::class, 'relatePaymentMethod'])->name('relatePaymentMethod');

    // Subscription
    Route::get('/wallet/subscription', [SettingsController::class, 'walletSubscription'])->name('wallet_subscription');
    Route::get('/user/company/pricing', [SettingsController::class, 'updateSubscription'])->name('updateSubscription');
    Route::post('/save/subscription/{plan}', [SettingsController::class, 'SubscriptionPlan'])->name('subscribe_plan');
    Route::post('/edit/company',[SettingsController::class, 'saveCompany'])->name('saveCompany');

    // Profile
    Route::get('/user/profile', [UserController::class, 'profile'])->name('profile');
    Route::post('/user/registration', [UserController::class, 'storeUserRegistration'])->name('store_user_data');
    Route::get('/image/{type}/{id}', [ImageController::class, 'showImage'])->name('show_image');
    Route::post('/user/regenerate_token', [UserController::class, 'regenerateToken'])->name('regenerate_token');
    Route::post('/user/change_password/{id}', [UserController::class, 'changePassword'])->name('change_password');

    // Messages
    Route::get('/messages/list', [MessageLogController::class, 'list'])->name('messages');
    Route::post('/messages/search_content', [MessageLogController::class, 'searchContent'])->name('searchContent');   
    Route::get('/messages', [MsgController::class, 'messageList'])->name('listMessage');

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
    Route::post('/migrateRequest', [UserController::class, 'sendMigrateRequest'])->name('migrate_request');

    // Webhook Events
    Route::post('/account/{id}/webhook_event', [UserController::class, 'createWebhookEvent'])->name('create_webhook_event');
    Route::post('/account/{id}/webhook_event/{webhook_id}', [UserController::class, 'updateWebhookURL'])->name('update_webhook_url');
    Route::post('/account/{id}/delete', [UserController::class, 'deleteWebhookEvent'])->name('delete_webhook_event');

    // Conversation Page
    Route::get('/chat', [MsgController::class, 'ChatList'])->name('chat_list');
    Route::get('/getMessages', [MsgController::class, 'getMessageList'])->name('get_message_list');
    Route::post('/sendMessage', [MsgController::class, 'sendMessage'])->name('send_message_to_contact');
    Route::post('/setArchivedContact', [ChatListContactController::class, 'setArchivedContact'])->name('set_archive');
    Route::get('/getUserContacts', [ChatListContactController::class, 'getUserContacts'])->name('get_user_contacts_list');
    Route::post('/store/userChartContacts', [ChatListContactController::class, 'storeUserChatContact'])->name('store_user_contact_list');

    // Contact
    //Route::get('/contacts', [ContactController::class, 'index'])->name('contacts');
    Route::get('/notes/{module}/{id}', [NoteController::class, 'list_notes'])->name('listNotes');
    Route::post('/addnotes/{module}/{id}', [NoteController::class, 'addNotes'])->name('add_Notes');
    Route::get('/contacts', [ContactController::class, 'index'])->name('listContact');
    Route::delete('/contact/delete/{id}', [ContactController::class, 'destroy'])->name('deleteContact');
    Route::get('/contact', [ContactController::class, 'show'])->name('detailContact');
    Route::post('/updateContact/{id}', [ContactController::class, 'update'])->name('updateContact');
    Route::post('/updateContact', [ContactController::class, 'store'])->name('storeContact');
    Route::get('/getContactDetail', [ContactController::class, 'edit'])->name('editContact');
    Route::get('/getFilterContacts', [ContactController::class, 'getFilterContactList'])->name('get_filter_contact');
    
    Route::get('/subpanelRecords', [ContactController::class, 'show_subpanel'])->name('subpanel_list');

    // Document
    Route::get('/download_document/{id}', [DocumentController::class, 'downloadDocument'])->name('download_document');
    Route::get('/preview_document/{id}', [DocumentController::class, 'previewDocument'])->name('preview_document');

    // Opportunity
    Route::get('/opportunities', [OpportunityController::class, 'index'])->name('listOpportunity');
    Route::delete('/opportunity/delete/{id}', [OpportunityController::class, 'destroy'])->name('deleteOpportunity');
    Route::get('/opportunity/detail/{id}', [OpportunityController::class, 'show'])->name('detailOpportunity');
    Route::post('/updateOpportunity/{id}', [OpportunityController::class, 'update'])->name('updateOpportunity');
    Route::post('/updateOpportunity', [OpportunityController::class, 'store'])->name('storeOpportunity');
    Route::get('/opportunity/edit/{id}', [OpportunityController::class, 'edit'])->name('editOpportunity');
   
    //Leads
    Route::get('/leads', [LeadController::class, 'index'])->name('listLead');
    Route::delete('/lead/delete/{id}', [LeadController::class, 'destroy'])->name('deleteLead');
    Route::get('/lead', [LeadController::class, 'show'])->name('detailLead');
    Route::post('/updateLead/{id}', [LeadController::class, 'update'])->name('updateLead');
    Route::post('/updateLead', [LeadController::class, 'store'])->name('storeLead');
    Route::get('/getLeadDetail', [LeadController::class, 'edit'])->name('editLead');
    Route::post('/convertLead/{id}', [LeadController::class, 'convert_lead'])->name('convertLead');
    
    
    //Organization
    Route::get('/organizations', [OrganizationController::class, 'index'])->name('listOrganization');
    Route::delete('/organization/delete/{id}', [OrganizationController::class, 'destroy'])->name('deleteOrganization');
    Route::get('/organization', [OrganizationController::class, 'show'])->name('detailOrganization');
    Route::post('/updateOrganization/{id}', [OrganizationController::class, 'update'])->name('updateOrganization');
    Route::post('/updateOrganization', [OrganizationController::class, 'store'])->name('storeOrganization');
    Route::get('/organization/edit/{id}', [OrganizationController::class, 'edit'])->name('editOrganization');

    // Product
    Route::get('/products', [ProductController::class, 'index'])->name('listProduct');
    Route::delete('/product/delete/{id}', [ProductController::class, 'destroy'])->name('deleteProduct');
    Route::get('/product/{id}', [ProductController::class, 'show'])->name('detailProduct');
    Route::post('/updateProduct/{id}', [ProductController::class, 'update'])->name('updateProduct');
    Route::post('/updateProduct', [ProductController::class, 'store'])->name('storeProduct');
    Route::get('/getProductDetail', [ProductController::class, 'edit'])->name('editProduct');
   
    // Order
    Route::get('/orders', [OrderController::class, 'index'])->name('listOrder');
    Route::delete('/order/delete/{id}', [OrderController::class, 'destroy'])->name('deleteOrder');
    Route::get('/order/{id}', [OrderController::class, 'show'])->name('detailOrder');
    Route::post('/updateOrder/{id}', [OrderController::class, 'update'])->name('updateOrder');
    Route::post('/updateOrder', [OrderController::class, 'store'])->name('storeOrder');
    Route::get('/order/detail/{id}', [OrderController::class, 'edit'])->name('editOrder');
    Route::get('/productPrice/{id}', [OrderController::class , 'getProductPrice'])->name('get_product_price');
  
    // Filter
    Route::get('/getFilterData', [FilterController::class, 'getFilterData'])->name('get_filter_data');
    Route::post('/storeFilter', [FilterController::class, 'storeFilter'])->name('store_filter');
    Route::post('/deleteFilter', [FilterController::class, 'deleteFilter'])->name('delete_filter');

    // Form
    Route::get('/fetchModuleFields/{module}', [FormController::class, 'fetchModuleFields'])->name('fetchModuleFields');
    Route::get('/field/getFieldOptions',[FormController::class,'getFieldOptions'])->name('get_field_options');
    Route::get('/getRelateContacts', [FormController::class, 'getRelateContacts'])->name('get_relate_contacts_list');
    Route::get('/lookup', [FormController::class, 'lookup'])->name('lookup');
    Route::post('/massEdit', [FormController::class, 'massEdit'])->name('mass_edit');

    // Import
    Route::get('/imports', [ImportController::class, 'index'])->name('listImport');
    Route::get('/import/create', [ImportController::class, 'create'])->name('new_import');
    Route::get('/import/detail/{id}', [ImportController::class, 'show'])->name('detailImport');
    Route::post('/import/save', [ImportController::class, 'store'])->name('import_save');
    Route::post('/import/file', [ImportController::class, 'handleFileImport'])->name('handleFileImport');
    Route::delete('/import/{id}', [ImportController::class, 'destroy'])->name('deleteImport');

    // Export
    Route::get('/exports', [ExportController::class, 'exportFile'])->name('export');

    // Show Columns
    Route::post('/showColumns/{module}', [CompanyController::class, 'showColumn'])->name('showColumns');

    // Tag
    Route::get('/tags', [TagController::class, 'index'])->name('listTag');
    Route::get('/tag', [TagController::class, 'show'])->name('detailTag');
    Route::get('/tag/getTagList', [TagController::class, 'getTagList'])->name('get_tag_list');
    Route::post('/tag/store', [TagController::class, 'store'])->name('storeTag');
    Route::get('/tag/{id}', [TagController::class, 'edit'])->name('editTag');
    Route::post('/updateTag/{id}', [TagController::class, 'update'])->name('updateTag');
    Route::delete('/deleteTag/{id}', [TagController::class, 'destroy'])->name('deleteTag');

    // Subscription
    Route::post('/subscription/save', [ContactController::class, 'saveSubscription'])->name('saveSubscription');
    Route::post('/subscription/delete', [ContactController::class, 'removeSubscription'])->name('removeSubscription');

    // Category
    Route::get('/lists', [CategoryController::class, 'index'])->name('listCategory');
    Route::get('/list', [CategoryController::class, 'show'])->name('detailCategory');
    Route::post('/list/store', [CategoryController::class, 'store'])->name('storeCategory');
    Route::get('/list/{id}', [CategoryController::class, 'edit'])->name('editCategory');
    Route::post('/updateList/{id}', [CategoryController::class, 'update'])->name('updateCategory');
    Route::delete('/deleteList/{id}', [CategoryController::class, 'destroy'])->name('deleteCategory');

    // Field
    Route::get('/fields', [FieldController::class, 'index'])->name('listField');
    Route::get('/field/{id}', [FieldController::class, 'edit'])->name('editField');
    Route::post('/field/store', [FieldController::class, 'store'])->name('storeField');
    Route::post('/updateField/{id}',[FieldController::class, 'update'])->name('updateField');
    Route::delete('/deleteField/{id}',[FieldController::class, 'destroy'])->name('deleteField');

    // Campaign
    Route::get('/campaigns',[CampaignController::class, 'index'])->name('listCampaign');
    Route::post('/campaign/store',[Campaigncontroller::class, 'store'])->name('storeCampaign');
    Route::get('/campaign/detail/{id}',[CampaignController::class, 'show'])->name('detailCampaign');
    Route::get('/campaign/search',[CampaignController::class, 'searchRecords'])->name('searchfilter');
    Route::delete('/deleteCampaign/{id}',[CampaignController::class, 'destroy'])->name('deleteCampaign');
    Route::get('/campaign/company/{service}',[CampaignController::class, 'getCompanyName'])->name('get_company_name');
    Route::get('/campaign/getTemplates/{account_id}',[CampaignController::class, 'getTemplateList'])->name('get_template_list');

    // Impersonate User
    Route::get('/user/getUserSession',[UserController::class, 'getUserSession'])->name('get_session_value');
    Route::post('/user/setGlobalUser',[UserController::class, 'setGlobalUser'])->name('set_global_user');

    // Notification
    Route::get('/notifications',[Notification::class, 'getNotifications'])->name('notification');
    Route::get('/clickNotification',[Notification::class, 'clickNotification'])->name('clickNotification');
    Route::get('/showMore',[Notification::class, 'showMore'])->name('showMore');

    // Automation
    Route::get('/automations', [AutomationController::class, 'index'])->name('listAutomation');
    Route::post('/automation/store',[AutomationController::class, 'store'])->name('storeAutomation');
    Route::post('/automation/update/{id}',[AutomationController::class, 'update'])->name('updateAutomation');
    Route::get('/automation/create/{id}', [AutomationController::class, 'create'])->name('createAutomation');
    Route::get('/automation/edit/{id}', [AutomationController::class, 'edit'])->name('editAutomation');
    Route::delete('/automation/delete/{id}',[AutomationController::class, 'destroy'])->name('deleteAutomation');

    Route::get('/getActionData', [AutomationController::class, 'getActionData'])->name('get_action_data');
    Route::get('/webhook/sample/{id}/{uuid}', [AutomationController::class , 'getSampleData'])->name('get_webhook_data');
    Route::post('/testCall', [AutomationController::class, 'testPostData'])->name('test_post_data');


    // LineItem
    Route::get('/lineitems', [LineItemController::class, 'index'])->name('listLineItem');
    Route::get('/create/lineitem', [LineItemController::class, 'create'])->name('createLineItem');

    // Company
    Route::post('/company/setBaseCompany', [CompanyController::class, 'setBaseCompany'])->name('setBaseCompany');

});

// Check user is admin
Route::middleware('auth', IsAdmin::class)->group(function () {
    
    //users
    Route::get('/users', [UserController::class, 'usersListing'])->name('show_Users');
    Route::get('/user/create', [UserController::class, 'createUser'])->name('create_user');
    Route::get('/user/edit/{id}', [UserController::class, 'editUser'])->name('editUser');
    Route::delete('/user/delete', [UserController::class, 'deleteUser'])->name('deleteUser');
    Route::get('/user/{id}', [UserController::class, 'userDetail'])->name('detailUser');
    Route::get('/globalusers', [UserController::class, 'globalusersListing'])->name('show_GlobalUsers');

    // Field Group
    Route::post('/storeFieldGroup', [FieldGroupController::class, 'store'])->name('storeFieldGroup');
    Route::get('/getFieldsGroup', [FieldGroupController::class, 'getFieldsGroup'])->name('get_fields_group');
    Route::post('/storeFieldOrder', [FieldGroupController::class, 'storeFieldOrder'])->name('store_field_order');
    
    //Company   
    Route::get('/admin/company', [CompanyController::class, 'index'])->name('listAdminCompany');
    Route::post('/storeCompany', [CompanyController::class, 'store'])->name('storeCompany');
   // Route::get('/company/detail/{id}', [CompanyController::class, 'show'])->name('detailCompany');
    Route::get('/company/edit/{id}', [CompanyController::class, 'edit'])->name('editCompany');
    Route::post('/company/update/{id}', [CompanyController::class, 'store'])->name('updateCompany');
    Route::delete('/company/delete/{id}', [CompanyController::class, 'destroy'])->name('deleteCompany');
    Route::post('/company/sendInvitation', [CompanyController::class, 'sendInvitation'])->name('send_invite_link');

});

// Check user is global admin
Route::middleware('auth', IsGlobalAdmin::class)->group(function () {
    // Users
    Route::get('/admin/users', [UserController::class, 'usersListing'])->name('list_global_user');
    Route::get('/admin/user/create', [UserController::class, 'createUser'])->name('create_global_user');
    Route::get('/admin/user/edit/{id}', [UserController::class, 'editUser'])->name('edit_global_user');
    Route::get('/admin/user/{id}', [UserController::class, 'userDetail'])->name('detail_global_user');
    Route::delete('/admin/user/delete', [UserController::class, 'deleteUser'])->name('delete_global_user');
    Route::post('/wallet/amount', [UserController::class, 'addWalletAmount'])->name('wallet_amount');

    //Workspaces
    Route::get('/admin/workspaces', [CompanyController::class, 'index'])->name('listCompany');
    Route::get('/admin/company/detail/{id}', [CompanyController::class, 'show'])->name('detailCompany');
    Route::post('/admin/paymentmethod', [CompanyController::class, 'paymentMethod'])->name('payment_method');

    // Settings
    Route::get('/admin/settings/outgoing_server', [SettingsController::class, 'settings'])->name('settings');
    Route::get('/admin/settings/template_notification', [SettingsController::class, 'toMail'])->name('template_notification');
    Route::post('/admin/settings/saveSMTP', [SettingsController::class, 'saveOutgoingServerData'])->name('store_smtp_data');
    Route::post('/admin/settings/saveToAddress', [SettingsController::class, 'saveToAddressData'])->name('store_toAddress_data');
    Route::get('/subscription/plan/editor', [SettingsController::class, 'getPlanDetails'])->name('plan_editor');
    Route::post('/subscription/plan/save', [SettingsController::class, 'saveSubscriptionChange'])->name('subscription_save');
    
    Route::get('/user/company/Detail', [SettingsController::class, 'CurrentCompany'])->name('user_company');
    Route::get('/changeCompany/{id}', [SettingsController::class, 'changeCompany'])->name('change_company');
    
    // Pricing
    Route::get('/admin/pricing', [PriceController::class, 'index'])->name('listPrice');
    Route::get('/admin/pricing/edit/{id}', [PriceController::class, 'edit'])->name('editPrice');
    Route::post('/admin/pricing', [PriceController::class, 'store'])->name('storePrice');
    Route::post('/admin/pricing/{id}', [PriceController::class, 'update'])->name('updatePrice');
    Route::delete('/admin/pricing/{id}', [PriceController::class, 'destroy'])->name('deletePrice');

    // Plans
    Route::get('/admin/plans', [PlanController::class, 'index'])->name('listPlan');
    Route::post('/admin/plan/store', [PlanController::class, 'store'])->name('storePlan');
    Route::get('/admin/plan/edit/{id}', [PlanController::class, 'edit'])->name('editPlan');
    Route::get('/admin/plan/detail/{id}', [PlanController::class, 'show'])->name('detailPlan');
    Route::post('/admin/plan/update/{id}', [PlanController::class, 'update'])->name('updatePlan');
    Route::delete('/admin/plan/delete/{id}', [PlanController::class, 'destroy'])->name('deletePlan');
    Route::post('/admin/plan/create', [PlanController::class, 'create'])->name('plan_save');
    Route::post('/admin/workspace/plan', [PlanController::class, 'workspacePlan'])->name('workspace_plan');
    Route::get('/admin/plan/default/{id}', [PlanController::class, 'setDefaultPlan'])->name('set_defaultPlan');

    // Impersonate User 
    Route::post('/admin/user/impersonate', [UserController::class, 'changeLogInUser'])->name('change_log_in_user');

    Route::get('/user/company/pricing/{user_id}', [SettingsController::class, 'updateSubscription'])->name('updateUserSubscription');
});

require __DIR__ . '/auth.php';
