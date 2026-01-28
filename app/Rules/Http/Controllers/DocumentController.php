<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Contact;
use App\Models\Product;
use Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;
use Cache;

class DocumentController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
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
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Document  $document
     * @return \Illuminate\Http\Response
     */
    public function show(Document $document)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Document  $document
     * @return \Illuminate\Http\Response
     */
    public function edit(Document $document)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Document  $document
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Document $document)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Document  $document
     * @return \Illuminate\Http\Response
     */
    public function destroy(Document $document)
    {
        //
    }

    /**
     * Download document 
     */
    public function downloadDocument(Request $request, $documentId)
    {
   
        $document = $this->checkCanAccess($request , $documentId);
        if($document){
            try {

                $result = Storage::disk('public_uploads')->download($document->path); //Storage::download($document->path);
                return $result;
            } catch (\Exception $e) {
                abort( 403 , $e->getMessage());
            }
        } else {
            abort('401');
        }
    }

    /**
     * Preview Document
     */
    public function previewDocument(Request $request, $documentId)
    {
        $document = $this->checkCanAccess( $request, $documentId );
        if($document){
          
            $docContent = Storage::disk('public_uploads')->get($document->path);
            $type       = Storage::disk('public_uploads')->mimeType($document->path);
      
         
            return Response::make($docContent, 200, [
              'Content-Type'        => $type,
              'Content-Disposition' => 'inline; filename="'.$document->title.'"',
            ]);
        }
    }

    /**
     * Check can access the Document
     */
    public function checkCanAccess( $request, $documentId )
    {
        $return = false;
        $currentUser = $request->user();
        $document = Document::find($documentId);

        if($document->parent_module == 'Contact'){
            $contact = Contact::where([
                'id' => $document->parent_id,
            ])->first();

            if($contact){
                $return = $document;
            }
        } else if ($document->parent_module == 'Product') {
            $product = Product::whereId($document->parent_id)->first();
            
            if($product) {
                $return = $document;
            }
        }

        return $return;
    }
}
