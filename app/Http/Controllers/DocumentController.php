<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Contact;
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
        $canDownload = false;
        $currentUser = $request->user();
        $companyId = Cache::get('selected_company_'. $currentUser->id);
        $document = Document::find($documentId);

        if($document->parent_module == 'Contact'){
            $contact = Contact::where([
                'id' => $document->parent_id,
                'company_id' => $companyId,
            ])->first();

            if($contact){
                $canDownload = true;
            }
        }
        if($canDownload){
            try {
                $result = Storage::download($document->path);
                return $result;
            } catch (\Exception $e) {
                abort( 403 , $e->getMessage());
            }
        } else {
            abort('401');
        }
    }
}
