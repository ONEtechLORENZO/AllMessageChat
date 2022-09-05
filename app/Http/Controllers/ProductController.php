<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use App\Models\Field;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;
use Cache;

class ProductController extends Controller
{
    public $limit = 15;

    public $default_sort_by = 'created_at';

    public $default_sort_order = 'desc';

   

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        
        $module = new Product();
        $list_view_columns = $module->getListViewFields();
        $listViewData = $this->listView($request, $module, $list_view_columns);

        $moduleData = [
            'singular' => __('Product'),
            'plural' => __('Products'),
            'module' => 'Product',
            'current_page' => 'Products', 
            // Actions
            'actions' => [
                'create' => true,                
                'edit' => true,
                'delete' => true,                
                'search' => true,                
                'select_field'=>true,
            ],
        ];
        
        $data = array_merge($moduleData, $listViewData);
        return Inertia::render('Product/List', $data);
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
    public function store(Request $request)
    {
        $product_id = $this->saveProduct($request);
        
        if($request->parent_module == 'Chat') {
            return Redirect::route('chat_list');
        } else if($request->parent_id){
            $url = route('detail'. $request->parent_module).'?id='.$request->parent_id.'&page=1';
            return Redirect::to($url);
        } else {
            return Redirect::route('listProduct', $product_id);
        }
    }

    public function getContactData(Request $request)
    {
        $product = Product::findOrFail($request->id);
        echo json_encode(['record' => $product]);
        die;
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Product  $product
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request, $product_id)
    {
        $product = Product::findOrFail($request->id);
       
        $companyId = Cache::get('selected_company_'. $request->user()->id);
        $headers = $this->getModuleHeader($companyId , 'Product');
        
        return Inertia::render('Product/Detail', [
            'Product' => $product,            
            'headers' => $headers,
            'translator' => [
                'Detail' => __('Detail'),
                'Notes' => __('Notes'),
                'Edit'  =>__('Edit')
                ]

        ]);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Product  $product
     * @return \Illuminate\Http\Response
     */
   

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Product  $product
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request)
    {
        $product_id = $this->saveProduct($request);
        return Redirect::route('listProduct', $product_id);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Product  $product
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request, $productId)
    {
        $product = Product::find($productId);
        $product->delete();
        return Redirect::route('listProduct');
    }

    /**
     * Return product Detail
     */
    public function getOpportunityData(Request $request)
    {
        $product =Product::findOrFail($request->id);
        echo json_encode(['record' => $product]);
        die;
    }

  

   

   
   
    public function saveProduct($request){

        if ($request->id) {
            $request->validate([
                'name' => 'required|max:255',                
            ]);
            $product = Product::findOrFail($request->id);
        } else {
            $request->validate([
                'name' => 'required|max:255',                
            ]);
            $product = new Product();
        }
     
        $fields = Field::where('module_name', 'Product')
            ->where('user_id', $request->user()->id)
            ->get(['field_name', 'is_custom']);

        if ($fields) {
            $custom_field = [];
            foreach ($fields as $record) {
                $field = $record['field_name'];
                $custom = $record['is_custom'];
                if ($request->has($field) && ($custom == '0' || !$custom)) {
                    $product->$field = $request->$field;
                }
  
                if($custom == '1'){
                    if($request->custom){
                        foreach($request->custom as $key => $value){
                            $custom_field[$key] = $value;
                        }
                    }
                }
            }
            if ($custom_field) {
                $product->custom = $custom_field;
            }
            
            $product->company_id = Cache::get('selected_company_'. $request->user()->id);
            $product->save();

            if($request->parent_id){
               
            }
        }

        return $product->id;
    }
    

   
}
