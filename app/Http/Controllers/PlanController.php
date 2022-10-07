<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Plan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;

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
            'name' => ['label' => __('Name'), 'type' => 'text'],
            'description' =>  ['label' => __('Description'), 'type' => 'textarea'],
            'amount' =>  ['label' => __('Amount'), 'type' => 'text'],
            'billing_period' => ['label' => __('Billing Period'), 'type' => 'dropdown'],
            'pricing_model' => ['label' => __('Price Model'), 'type' => 'dropdown'],
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
                'select_field'=>true
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
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request,Plan $plan)
    {
        $request->validate([
            'name' => 'required|max:255|unique:stripe_plans',
            'description' => 'required',
            'amount' => 'required',
            'billing_period' => 'required',
            'pricing_model' => 'required',
        ]);

        $plan->name = $request->name;
        $plan->description = $request->description;
        $plan->amount = $request->amount;
        $plan->billing_period = $request->billing_period;
        $plan->pricing_model = $request->pricing_model;
        $plan->save();
        
        $url = route('detailPlan').'id?='. $plan->id;
        return Redirect::to($url);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Plan  $plan
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request)
    {
        if($request->id) {

           $plan = Plan::findOrFail($request->id);
           
           if(!$plan) {
             about('401');
           }
           $headers = $this->getModuleHeader(1 , 'Plan');

           return Inertia::render('Plans/Detail', [
            'record' => $plan,            
            'headers' => $headers,

            'translator' => [
                'Detail' => __('Detail'),
                'Edit'  =>__('Edit')
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
    public function edit(Plan $plan)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Plan  $plan
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Plan $plan)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Plan  $plan
     * @return \Illuminate\Http\Response
     */
    public function destroy(Plan $plan)
    {
        //
    }
}
