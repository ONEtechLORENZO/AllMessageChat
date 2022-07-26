<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use League\Csv\Statement;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use League\Csv\Reader;
use App\Models\Import;
use App\Models\Contact;

class ImportController extends Controller
{
    public function importData(Request $request){
        
        $query = DB::select('select id,name,module_name,status,created_at from imports');
        return Inertia::render('Import/import',['data' => $query]);   
    }

    public function newImport(Request $request){
        return Inertia::render('Import/createImport');
    }

    public function deleteImport(Request $request, $id){
   
        Import::where('id',$id)->delete();
        return redirect('/import');
    }

    public function getRecordFile(Request $request) {
        
        $fields =  DB::select('select field_name, field_label from fields');

        $file = $request->file('fileUpload');
        $fileName = $file->getClientOriginalName();
        $destinationPath = storage_path().'/import_file' ;
        $file->move($destinationPath,$fileName);
        $attachFilePath = ['url' => asset('import_file/'.$fileName), 'path' => $destinationPath.'/'.$fileName];
        $filePath = $attachFilePath['path'];

        $handle = Reader::createFromPath($filePath, "r");
        $handle->setHeaderOffset(0);
        $header = $handle->getHeader(); //returns the CSV header record
        $records = Statement::create()->process($handle);
        $total_recordCount = count($records); //return the total number of records found

        $import = new Import();
        $import->name = $request->get('name');
        $import->module_name = "Contact";
        $import->file_path = $filePath;
        $import->status = 'draft';
        $import->mapping = '';
        $import->total_records = $total_recordCount;
        $import->imported_records = 0;
        $import->error_message = '';
        $import->offset = 0;
        $import->user_id = $request->user()->id;
        $import->save();
        $id = $import->id;

        return Inertia::render('Import/createImport',['id' => $id, 'csvHeader' => $header, 'Onestepfield' => $fields]);
    }

    public function importFileSave(Request $request){
        
        $status = $request->status;
        if($status == 'draft'){
           $field = $request->editOneStepfield;
           $record_id = $request->id;
        }else{
            $field = $request->get('Onestepfield');
            $record_id = $request->get('id');
        }
        $mapping_value = [];
        foreach($field as $key=>$value){
            $mapping_value[$value['field_name']] = $request->get($value['field_name']);
        }
        $mapping_field = base64_encode(serialize($mapping_value));
 
        Import::where('id',$record_id)->update([
              'status' => 'new',
              'mapping' => $mapping_field                
        ]);
   
        return Redirect::route('import');      

    }

    public function EditImport(Request $request, $id){
      
         $import = Import::find($id);
         $module = $import->module_name;
         $status = $import->status;
         $fields = DB::select("select field_name,field_label from fields where module_name='{$module}'");
         $field = [];
         foreach($fields as $key => $value){
             $field[] = ['field_name' => $value->field_name , 'field_label' => $value->field_label];
         }

         $header = [];
         if($status == 'draft'){
            $filePath = $import->file_path;
            $handle = Reader::createFromPath($filePath, "r");
            $handle->setHeaderOffset(0);
            $header = $handle->getHeader(); //returns the CSV header record     
         }else{
             
            $mapping = $import->mapping;
            $decode_mapping = unserialize(base64_decode($mapping));

            foreach($decode_mapping as $key => $value){
                if($value == ''){
                    $header[] = ['value' => $key, 'label' => "-"];
                }else{
                    $header[] = ['value' => $key, 'label' => $value];
                }  
            } 
         }
    
         return Inertia::render('Import/createImport',['id' => $id, 'editcsvHeader' => $header, 'editOneStepfield' => $field ,'status' => $status]);
    }

}
