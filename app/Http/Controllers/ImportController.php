<?php

namespace App\Http\Controllers;

use App\Models\Field;
use Illuminate\Http\Request;
use League\Csv\Statement;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use League\Csv\Reader;
use App\Models\Import;
use Cache;

class ImportController extends Controller
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
        $user_id = $request->user()->id;

        // List view columns to show
        $list_view_columns = [
            'name' => ['label' => __('Name'), 'type' => 'text'],
            'module_name' =>  ['label' => __('Module Name'), 'type' => 'text'],
            'status' =>  ['label' => __('status'), 'type' => 'text'],
            'created_at' => ['label' => __('Created At'), 'type' => 'text'],
        ];

        $search = $request->has('search') && $request->get('search') ? $request->get('search') : '';
        $sort_by = $request->has('sort_by') && $request->get('sort_by') ? $request->get('sort_by') : $this->default_sort_by;
        $sort_order = $request->has('sort_order') && $request->get('sort_order') ? $request->get('sort_order') : $this->default_sort_order;

        if($search) {
            $records = Import::orderBy($sort_by, $sort_order)
                        ->where('user_id', $user_id)
                        ->where(function ($query) use ($search, $list_view_columns) {    
                            foreach($list_view_columns as $field_name => $field_info) {
                                $query->orWhere($field_name, 'like', '%' . $search . '%');
                            }
                        })
                        ->paginate($this->limit);
        }
        else {
            $records = Import::orderBy($sort_by, $sort_order)->paginate($this->limit);
        }

        return Inertia::render('Import/List', [
            'records' => $records->items(),
            'singular' => __('Import'),
            'plural' => __('Imports'),
            'module' => 'Import',
            'add_link' => route('new_import'),
            'add_button_text' => __('New Import'),
            // Actions
            'actions' => [
                'create' => true,
                'detail' => true,
                'edit' => false,
                'delete' => true,
                'export' => false,
                'import' => false,
                'search' => true,
                'select_field'=>true
            ],
            'translator' => [
                'No records' =>__('No records'),
                'Search' =>__('Search'),
                'Are you sure you want to delete the record?' => __('Are you sure you want to delete the record?'),
            ],
            'search' => $search,
            'list_view_columns' => $list_view_columns,
            // Sorting
            'sort_by' => $sort_by,
            'sort_order' => $sort_order,
            // Paginator
            'paginator' => [
                'firstPageUrl' => $records->url(1),
                'previousPageUrl' => $records->previousPageUrl(),
                'nextPageUrl' => $records->nextPageUrl(),
                'lastPageUrl' => $records->url($records->lastPage()),  
                'currentPage' => $records->currentPage(),
                'total' => $records->total(),
                'count' => $records->count(),
                'lastPage' => $records->lastPage(),
                'perPage' => $records->perPage(),
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        return Inertia::render('Import/Form',['translator' => [
            
            'STEP 1' =>__('STEP 1'),
            'STEP 2' =>__('STEP 2'),            
            'Import' => __('Import'),
            'Mapping' =>__('Mapping'),
            'Name' => __('Name'),
            'Upload a CSV file' => __('Upload a CSV file'),
            'Cancel' => __('Cancel'),
            'Next'=> __('Next'),
            'No records' =>__('No records')


            ]]);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request, $id)
    {
        $user_id = $request->user()->id;
        $import = Import::where('user_id', $user_id)
                    ->where('id', $id)
                    ->first();

        if(!$import) {
            abort(401);
        }

        $import->delete();
        return Redirect::route('listImport');
    }

    /**
     * Store the file and return the headers and module fields
     * 
     * @return \Illuminate\Http\Response
     */
    public function handleFileImport(Request $request) 
    {

        $module_name = 'Contact';
        $user_id = $request->user()->id;
        $company_id = Cache::get('selected_company_'.$user_id);
        $fields = Field::where('module_name', $module_name)
            ->where('user_id', $user_id)
            ->where('company_id', $company_id)
            ->get();

        // Store the file
        $file = $request->file('fileUpload');
        $fileName = $file->getClientOriginalName();
        $destinationPath = storage_path() . '/import_file';
        $file->move($destinationPath,$fileName);

        $attachFilePath = ['url' => asset('import_file/' . $fileName), 'path' => $destinationPath . '/' . $fileName];
        $filePath = $attachFilePath['path'];

        // Get CSV headers
        $handle = Reader::createFromPath($filePath, "r");
        $handle->setHeaderOffset(0);
        $headers = $handle->getHeader();

        // Get total records count
        $records = Statement::create()->process($handle);
        $total_recordCount = count($records);

        // Create a new record
        $import = new Import();
        $import->name = $request->get('name');
        $import->module_name = $module_name;
        $import->file_path = $filePath;
        $import->status = 'draft';
        $import->mapping = '';
        $import->total_records = $total_recordCount;
        $import->imported_records = 0;
        $import->error_message = '';
        $import->offset = 0;
        $import->user_id = $user_id;
        $import->company_id = $company_id;
        $import->save();

        $id = $import->id;

        return Inertia::render('Import/Form', ['id' => $id, 'csvHeader' => $headers, 'Onestepfield' => $fields]);
    }

    /**
     * Create/Update a resource.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {    
       
        $user_id = $request->user()->id;
        $status = $request->status;
        if($status == 'draft') {
           $field = $request->editOneStepfield;
           $record_id = $request->id;
        }
        else {
            $field = $request->get('Onestepfield');
            $record_id = $request->get('id');
        }

        $import = Import::where('user_id', $user_id)
                    ->where('id', $record_id)
                    ->first();

        if(!$import) {
            abort(401);
        }

        $mapping_value = [];
        foreach($field as $key => $value) {
            $mapping_value[$value['field_name']] = $request->get($value['field_name']);
        }
       
        $mapping_field = base64_encode(serialize($mapping_value));
 
        Import::where('id', $record_id)
            ->where('user_id', $user_id)
            ->update([
                'status' => 'new',
                'mapping' => $mapping_field
            ]);
   
        return Redirect::route('listImport');
    }

    /**
     * Display the specified resource
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request, $id)
    {
     
        $user_id = $request->user()->id;
        $import = Import::where('user_id', $user_id)
                    ->where('id', $id)
                    ->first();

        if(!$import) {
            abort(401);
        }

        $module = $import->module_name;
        $status = $import->status;

        // Get module fields
        $moduleFields = Field::where('module_name', $module)
            ->where('user_id', $user_id)
            ->get();

        $fields = [];
        foreach($moduleFields as $key => $value) {
            $fields[] = ['field_name' => $value->field_name , 'field_label' => $value->field_label];
        }

        $headers = [];
        if($status == 'draft') {
            // Get CSV Headers
            $filePath = $import->file_path;
            $handle = Reader::createFromPath($filePath, "r");
            $handle->setHeaderOffset(0);
            $headers = $handle->getHeader();
        }
        else {
            $mapping = $import->mapping;
            $decode_mapping = unserialize(base64_decode($mapping));
            foreach($decode_mapping as $key => $value) {
                if($value == '') {
                    $headers[] = ['value' => $key, 'label' => "-"];
                }else{
                    $headers[] = ['value' => $key, 'label' => $value];
                }  
            } 
        }

        return Inertia::render('Import/Form',['id' => $id, 'editcsvHeader' => $headers, 'editOneStepfield' => $fields, 'status' => $status]);
    }
}