<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Plan;
use App\Models\Company;
use App\Models\Account;
use App\Models\User;
use App\Models\Msg;
use Illuminate\Http\Request;
use App\Models\Automation;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class PlanController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $list_view_columns = [
            'plan' => ['label' => __('Name'), 'type' => 'text'],
            // 'description' =>  ['label' => __('Description'), 'type' => 'textarea'],
            'price' =>  ['label' => __('Amount'), 'type' => 'text'],
            // 'billing_period' => ['label' => __('Billing Period'), 'type' => 'dropdown'],
            'plan_id' => ['label' => __('Price Model'), 'type' => 'dropdown'],
        ];

        $module = new Plan();

        $listViewData = $this->listView($request, $module, $list_view_columns);

        $moduleData = [
            'singular' => __('Plan'),
            'plural' => __('Plans'),
            'module' => 'Plan',
            'current_page' => 'Plans',
            // Actions
            'actions' => [
                'create' => true,
                'detail' => true,
                'edit' => true,
                'delete' => true,
                'export' => false,
                'import' => false,
                'search' => true,
                'filter' => true,
                'select_field' => true
            ],
        ];

        $data = array_merge($moduleData, $listViewData);
        return Inertia::render('Plans/List', $data);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create(Request $request)
    {
        $field_name = [
            'plan',
            'price',
            'target',
            'setup_workspace',
            'monthly_workspace',
            'channels',
            'accounts',
            'offical_whatsapp',
            'unoffical_whatsapp',
            'facebook',
            'users',
            'include_users',
            'extra_users',
            'crm_contacts',
            'chat_cost',
            'per_message',
            'per_allegato',
            'fatturazione',
            'contacts',
            'lists_tags',
            'custom_fields',
            'multichannel_chat',
            'campaigns',
            'workflow',
            'opportunities',
            'category',
            'orders',
            'lead_webhook',
            'integrations',
            'api',
            'custom_integrations',
            'plan_id'
        ];

        if ($request->plan) {

            $plans = [];

            foreach ($field_name as $field) {
                $plans[$field] = $request->$field;
            }

            // Insert record value into the table
            if ($request->id) {
                DB::table('plans')->where('id', $request->id)->update($plans);
            } else {
                DB::table('plans')->insert($plans);
            }
        }

        return Redirect::route('detailPlan', ['id' => $request->plan_id]);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request, Plan $plan)
    {

        $request->validate([
            'name' => 'required|max:255',
            'description' => 'required',
            'amount' => 'required',
            'billing_period' => 'required',
            'pricing_model' => 'required',
            'currency' => 'required',
        ]);

        $stripe = new \Stripe\StripeClient(config('stripe.stripe_secret'));

        // Create a Plan
        $create_plan = $stripe->products->create([
            'name' => $request->name,
            'description' => $request->description,
        ]);

        // Attach plan price details
        $plan_price = $stripe->prices->create([
            'unit_amount' => $request->amount * 100,
            'currency' => strtolower($request->currency),
            'recurring' => ['interval' => $request->billing_period],
            'product' => $create_plan->id,
        ]);

        $plan->name = $request->name;
        $plan->description = $request->description;
        $plan->amount = $request->amount;
        $plan->currency = $request->currency;
        $plan->billing_period = $request->billing_period;
        $plan->pricing_model = $request->pricing_model;
        $plan->stripe_id =  $create_plan->id;
        $plan->price_id = $plan_price->id;
        $plan->save();

        return Redirect::route('detailPlan', [
            'id' => $plan->id,
            'translator' => Controller::getTranslations(),

        ]);
    }

    /**
     * Display the specified resource. 
     *
     * @param  \App\Models\Plan  $plan
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request)
    {
        if ($request->id) {

            $subscription_plan = '';
            $workspaces = [];

            $plan = Plan::findOrFail($request->id);

            if (!$plan) {
                about('401');
            }
            $headers = $this->getModuleHeader(1, 'Plan');

            // Get plan record value
            $subscription_plan = DB::table('plans')->where('plan_id', $request->id)->first();

            // Get all related plan workspace
            $plan_workspace = DB::table('plan_workspaces')->where('plan_id', $request->id)->get(['company_id']);

            if ($plan_workspace) {
                $workspaces[] = Company::first();
            }

            return Inertia::render('Plans/Detail', [
                'module' => 'Plan',
                'record' => $plan,
                'headers' => $headers,
                'subscription_plan' => $subscription_plan,
                'workspaces' => $workspaces,

                'translator' => [
                    'Detail' => __('Detail'),
                    'Edit'  => __('Edit'),
                    'Plan Detail' => __('Plan Detail'),
                    'Workspace' => __('Workspace'),
                ],

            ]);
        }
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Plan  $plan
     * @return \Illuminate\Http\Response
     */
    public function edit(Request $request, $id)
    {
        $plan = Plan::find($id);

        if (!$plan) {
            abort(401);
        }

        return response()->json(['status' => true, 'record' => $plan]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Plan  $plan
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $plan = Plan::find($id);

        $request->validate([
            'name' => 'required|max:255',
            'description' => 'required',
            'amount' => 'required',
            'billing_period' => 'required',
            'pricing_model' => 'required',
        ]);

        if ($plan) {
            $stripe = new \Stripe\StripeClient(config('stripe.stripe_secret'));

            $update_plan = $stripe->products->update($plan->stripe_id, [
                'name' => $request->name,
                'description' => $request->description
            ]);

            $plan->name = $request->name;
            $plan->description = $request->description;
            $plan->save();

            return Redirect::route('listPlan');
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Plan  $plan
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request, $id)
    {
        $plan = Plan::find($id);
        $errors = '';

        if ($plan->stripe_id) {

            $stripe = new \Stripe\StripeClient(config('stripe.stripe_secret'));

            // Delete the Plan
            try {
                $stripe->products->delete(
                    $plan->stripe_id,
                    []
                );
            } catch (\Stripe\Exception\InvalidRequestException $e) {
                $errors = $e->getMessage();
            } catch (Exception $e) {
                $errors = $e->getMessage();
            }
        }

        if ($errors) {
            return redirect()->back()->withErrors(['message' => $errors]);
        }

        $plan->delete();

        return Redirect::route('listPlan');
    }

    public function workspacePlan(Request $request)
    {

        if ($request->plan_id) {

            $plan['plan_id'] = $request->plan_id;
            $plan['company_id'] = $request->value;

            DB::table('plan_workspaces')->insert($plan);

            return Redirect::route('detailPlan', ['id' => $request->plan_id]);
        }
    }

    public function setDefaultPlan(Request $request, $id)
    {

        if ($id) {

            $flag = '';
            $subscriptionRecords = DB::table('plans')->get();
            $plans = [];
            $count = [];

            foreach ($subscriptionRecords as $record) {
                $plans[] = $record;

                if ($id == $record->id) {
                    $flag = $record->default_plan;
                }
                if ($record->default_plan == 'true') {
                    $count[] = $record->default_plan;
                }
            }

            if ($flag == 'true') {
                DB::table('plans')->where('id', $id)->update(['default_plan' => 'false']);

                return response()->json(['status' => true, 'show' => false]);
            }

            if (count($count) < 4) {
                DB::table('plans')->where('id', $id)->update(['default_plan' => 'true']);

                return response()->json(['status' => true, 'show' => true]);
            }

            return response()->json(['status' => true, 'message' => true]);
        }
    }

    /**
     * Return plan usage data
     */
    public function getPlanDetail(Request $request, $plan)
    {

        $user = $request->user();
        $company =  Company::first();
        $accounts = Account::select('id')->get();
        $accountId = [];
        foreach ($accounts as $account) {
            $accountId[] = $account->id;
        }

        $users = User::count();

        $activeUsers = User::where('status', true)->count();
        $automations = Automation::count();

        $plan = DB::table('plans')->where('plan_id', $company->plan)->first();

        $messages = Msg::select(DB::raw('count(distinct(msgable_id)) as category_count, service '))
            ->where(['account_id' => $accountId])
            ->groupBy(['service'])
            ->get();
        $category = ['whatsapp' => 0, 'instagram' => 0];
        foreach ($messages as $message) {
            $category[$message->service] = $message->category_count + $category[$message->service];
        }

        $planUser = ($plan && $plan->users) ? (int)$plan->users : 0;
        $fatturazione = ($plan && $plan->fatturazione) ? (int)$plan->fatturazione : 0;
        $offical_whatsapp = ($plan && $plan->offical_whatsapp) ? (int)$plan->offical_whatsapp : 0;
        // $offical_whatsapp = ($plan && $plan->users) ? $plan->users : 0;

        $planData = [
            'user' => ['label' => 'Users', 'current' => $users, 'limit' => $planUser, 'percentage' => ($planUser != 0) ? ($users / $planUser) * 100 : 0],
            'monthly_active_user' => ['label' => 'Active users', 'current' => $activeUsers, 'limit' => $planUser, 'percentage' => ($planUser != 0) ? ($users / $planUser) * 100 : 0],
            'automations' => ['label' => 'Automations', 'current' => $automations, 'limit' => $fatturazione, 'percentage' => ($fatturazione != 0) ? ($automations / $plan->fatturazione) * 100 : 0],
            'whatsapp' => ['label' => 'Whatsapp number', 'current' => $category['whatsapp'], 'limit' => $offical_whatsapp, 'percentage' => ($offical_whatsapp != 0) ? ($category['whatsapp'] / $plan->offical_whatsapp) * 100 : 0],
            'instagram' => ['label' => 'Instagram accounts', 'current' => $category['instagram'], 'limit' => $offical_whatsapp, 'percentage' => ($offical_whatsapp != 0) ? ($category['instagram'] / $plan->offical_whatsapp) * 100 : 0],
        ];

        return response()->json(['price' => ($plan) ? $plan->price : 0, 'plan_data' => $planData]);
    }

    public function deleteCustomPlan(Request $request)
    {

        $plan_workspace = DB::table('plan_workspaces')
            ->where('plan_id', $request->plan_id)
            ->delete();

        return Redirect::route('detailPlan', ['id' => $request->plan_id]);
    }

    public function companyCurrentPlan(Request $request)
    {

        $flag = false;
        $company = Company::first();
        $company_plan = $company->plan;
        $paymentMethod = $company->payment_method;
        $result = ['remain' => '-', 'access' => true];

        if ($paymentMethod == 'Prepaid') {
            $plan = Plan::where('plan_id', $company_plan)->first();
            $current_users = User::count();
            $max_users = $plan->users;

            if ($max_users != '-') {
                $remaining_user = $max_users - $current_users;

                if ($max_users > $current_users) {
                    $flag = true;
                }

                $result = ['remain' => $remaining_user, 'access' => $flag, 'max_user' => $max_users];
            }
        }

        return response()->json(['status' => true, 'result' => $result]);
    }

    public function subMenu()
    {

        $company = Company::first();
        $plan = Plan::where('plan_id', $company->plan)->first();

        $navigations = [
            'Dashboard' => [
                'name' => 'Dashboard',
                'show' => true
            ],
            'Conversations' => [
                'name' => 'Conversations',
                'submenu' => [
                    'Chats' => 'chat_conversation',
                    'Campaigns' => 'campaigns',
                    'Social Profiles' => 'social_profile'
                ],
                'show' => false
            ],
            'CRM' => [
                'name' => 'CRM',
                'submenu' => [
                    'Leads' =>  'crm_leads',
                    'Contacts' => 'crm_contacts',
                    'Organizations' => 'crm_organizations',
                    'Fields' => 'Fields',
                    'Tags' => 'Tags',
                    'Lists' => 'Lists'
                ],
                'show' => false
            ],
            'Sales' => [
                'name' => 'Sales',
                'submenu' => [
                    'Deals' => 'crm_deals',
                    'Orders' => 'sale_orders',
                    'Products' => 'product_category',
                    'Catalogs' => 'catalogs'
                ],
                'show' => false
            ],
            'Automations' => [
                'name' => 'Automations',
                'access' => 'workflows',
                'show' => false
            ],
            'Reports' => [
                'name' => 'Reports',
                'show' => true
            ]

        ];

        foreach ($navigations as $key => $navigation) {
            if (!$navigation['show']) {
                if ($key == 'Automations') {
                    $name = $navigation['access'];
                    if (isset($plan->$name) && $plan->$name == 'true') {
                        $navigations[$key]['show'] = true;
                    }
                } else {
                    $submenu = $navigation['submenu'];
                    $status = true;
                    foreach ($submenu as $header => $name) {
                        if ($key === 'Conversations' && $header === 'Campaigns') {
                            continue;
                        }
                        if (isset($plan->$name) && $plan->$name == 'false') {
                            unset($navigations[$key]['submenu'][$header]);
                            $status = false;
                        }
                    }
                    if (count($navigations[$key]['submenu'])) {
                        $navigations[$key]['show'] = true;
                    }
                    if (!$status && $key == 'CRM') {
                        $navigations[$key]['show'] = false;
                    }
                }
            }
        }

        return response()->json(['status' => true, 'menu' => $navigations]);
    }

    public function updatePlan(Request $request)
    {

        $user = $request->user();
        $company = Company::first();
        $stripe_public_key = config('stripe.stripe_key');
        $plans = DB::table('plans')->where('default_plan', 'true')->get();

        return Inertia::render('PlanComponent', [
            'user' => $user,
            'company' => $company,
            'stripe_public_key' => $stripe_public_key,
            'plans' => $plans,
            'translator' => Controller::getTranslations(),
            'status' => 'update'
        ]);
    }
}
