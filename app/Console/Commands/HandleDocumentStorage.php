<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Document;
use App\Models\Msg;
use Carbon\Carbon;
use DB;

class HandleDocumentStorage extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'command:HandleDocumentStorage';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Delete document automatically  after 30 days';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $limit = 100;
        //get before 30 days of documents         
        $documents = DB::table('msgs')
                    ->rightJoin('documents', 'documents.id', '=', 'msgs.file_path')
                    ->whereDate("msgs.created_at", "<", Carbon::today()->subDays(30))
                    ->orderBy('msgs.id', 'asc')
                    ->limit($limit)
                    ->get();

        if(count($documents)) {
            foreach($documents as $document) {
                $documentId = $document->id;
                $file_path = public_path().'/uploads/'.$document->path;

                if(file_exists($file_path)) {
                    //delete the file from local storage
                    unlink($file_path);

                    //delete document related message
                    // $msg = Msg::where('file_path', $documentId)->first();
                    // $msg->delete();

                    //delete this document record
                    $document = Document::find($documentId);
                    $document->delete();
                }
            }
        }
    }
}
