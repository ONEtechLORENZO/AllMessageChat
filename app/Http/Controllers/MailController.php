<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Mail;

use App\Http\Requests;
use App\Http\Controllers\Controller;
use Config;

class MailController extends Controller
{

    public function basic_email() {
        $data = array('name'=>"Virat Gandhi");

        Mail::send(['Mail.testMail'], $data, function($message) {
                $message->to('sureshrajendrasr@gmail.com', 'Suresh R')->subject
                ('Laravel Basic Testing Mail');
                $message->from('xyz@gmail.com','Virat Gandhi');
                });
        echo "Basic Email Sent. Check your inbox.";
    }
    public function html_email() {
        $data = array('name'=>"Virat Gandhi");
        
        $config = [
                'username'   => 'srmobisoft@gmail.com',
                'password'   => 'vaz@1234'
            ];

        Mail::send('mail', $data, function($message) {
                $message->to('sureshr@blackant.io', 'Tutorials Point')->subject
                ('Laravel HTML Testing Mail');
                $message->from('xyz@gmail.com','Virat Gandhi');
                });
        echo "HTML Email Sent. Check your inbox.";
    }
    public function attachment_email() {
        $data = array('name'=>"Virat Gandhi");
        Mail::send('mail', $data, function($message) {
                $message->to('abc@gmail.com', 'Tutorials Point')->subject
                ('Laravel Testing Mail with Attachment');
                $message->attach('C:\laravel-master\laravel\public\uploads\image.png');
                $message->attach('C:\laravel-master\laravel\public\uploads\test.txt');
                $message->from('xyz@gmail.com','Virat Gandhi');
                });
        echo "Email Sent with attachment. Check your inbox.";
    }
}
