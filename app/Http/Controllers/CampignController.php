<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Campign;
use Illuminate\Http\Request;

class CampignController extends Controller
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
            'status' =>  ['label' => __('Status'), 'type' => 'text'],
            'service' =>  ['label' => __('Service'), 'type' => 'text'],
            'scheduled_at' => ['label' => __('Scheduled'), 'type' => 'text'],
        ];

        $module = new Campign();
        $listViewData = $this->listView($request, $module, $list_view_columns);

        $moduleData = [
            'singular' => __('Campign'),
            'plural' => __('Campigns'),
            'module' => 'Campign',
            'current_page' => 'Campigns', 
            // Actions
            'actions' => [
                'create' => true,
                'detail' => false,
                'edit' => true,
                'delete' => true,
                'export' => false,
                'import' => false,
                'search' => true,
                'filter' => true,
            ],
        ];
        
        $data = array_merge($moduleData, $listViewData);
        return Inertia::render('Campign/List', $data);
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
    public function store(Request $request, Campign $campign)
    {
        // if($request){
        //     $request->validate([
        //         'name' => 'required'
        //     ]);
        // }

        // $campign->name = $request->name;
        // $campign->status = 'draft';
        // $campign->save();
        $list_view_columns = [ ];

        $module = new Campign();
        $listViewData = $this->listView($request, $module, $list_view_columns);
      //  dd($listViewData);
        return Inertia::render('Campign/Form',['translator' => $listViewData['translator'], 'filter' => $listViewData['filter']]);        
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Campign  $campign
     * @return \Illuminate\Http\Response
     */
    public function show(Campign $campign)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Campign  $campign
     * @return \Illuminate\Http\Response
     */
    public function edit(Campign $campign)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Campign  $campign
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Campign $campign)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Campign  $campign
     * @return \Illuminate\Http\Response
     */
    public function destroy(Campign $campign)
    {
        //
    }
}
