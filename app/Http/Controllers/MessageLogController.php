<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Auth;
use App\Models\MessageLog;
use App\Models\IncomingUrl;
use App\Models\MessageResponse;
use App\Models\Account;
use App\Models\Template;
use DateTime;

class MessageLogController extends Controller
{

    /**
     * Message log List view
     */
    public function list(Request $request)
    {
        $limit = 10;
        $condition = '';
        $user = Auth::user();
        if (isset($_GET['key'])) {
            $condition = $request->get('key');
        }

        $messageLogs = MessageLog::select('direction', 'message_logs.created_at', 'display_name', 'content', 'sender', 'destinations', 'message_logs.status')
            ->rightJoin('accounts', 'accounts.id', 'account_id')
            ->orderBy('message_logs.id', 'desc')
            ->where('message_logs.user_id', $user->id)
            ->where(function ($query) use ($condition) {
                if ($condition != '') {
                    $query->where('content',  'like', '%' . $condition . '%');
                    $query->orWhere('message_logs.status', 'like', '%' . $condition . '%');
                }
            })
            ->paginate($limit);

        $totalMessages = $messageLogs->total();

        $name = $user->name;
        $currentPage = (isset($_GET['page'])) ? $_GET['page'] : 1;

        return Inertia::render('Messages/List', [
            'messages' => $messageLogs,
            'user_name' => $name,
            'currentPage' => $currentPage,
            'totalMessages' => $totalMessages,
            'limit' => $limit,
        ]);
    }

    /**
     * Search Keyword  
     */
    public function searchContent(Request $request)
    {
        $limit = 10;
        $keyWord = $request->get('key');

        //      DB::enableQueryLog();
        $messageLogs = MessageLog::select('direction', 'message_logs.created_at', 'display_name', 'content', 'sender', 'destinations', 'message_logs.status')
            ->rightJoin('accounts', 'accounts.id', 'account_id')
            ->orderBy('message_logs.id', 'desc')
            //    ->where('message_logs.user_id', $user->id)
            ->where(function ($query) use ($keyWord) {
                if ($keyWord['messageContent']) {
                    $query->where('content',  'like', '%' . $keyWord['messageContent'] . '%');
                    $query->orWhere('destinations', 'like', '%' . $keyWord['messageContent'] . '%');
                }
            })
            ->where(function ($query) use ($keyWord) {
                if ($keyWord['messageDirection']) {
                    $query->where('direction', $keyWord['messageDirection']);
                }
                if ($keyWord['messageStatus']) {
                    $query->where('message_logs.status', $keyWord['messageStatus']);
                }
            })
            ->paginate($limit);

        $return = [
            'messages' => $messageLogs,
            'currentPage' => $messageLogs->currentPage(),
            'totalMessages' => $messageLogs->total(),
            'limit' => $limit,
        ];
        echo json_encode($return);
        die;
    }

    /**
     * Set Destination for message
     */
    public function destination(Request $request)
    {
        return Inertia::render('Messages/Destination', ['messages' => []]);
    }

    /**
     * Message Configuration
     */
    public function messageConfig()
    {

        $post_data = file_get_contents("php://input");
        $data = json_decode($post_data);

        error_log(print_r('Incoming Response', true));
        error_log(print_r($post_data, true));

        if (isset($data->destination) && $this->origin == $data->destination) {
            $this->incomingMessageResponse($data);
        } else {

            $messageLog = MessageLog::where('messageId', $data->messageId)->first();

            if (isset($data->resultDescription) && str_contains($data->resultDescription, 'Message failed')) {
                $messageLog->status = 'Failed';
            } else {
                $messageLog->status = 'Delivered';
            }
            $messageLog->type = $data->messageType;
            $messageLog->save();

            $response = new MessageResponse();
            $response->message_id = $data->messageId;
            $response->ref_id = $data->refId;
            $response->type = $data->messageType;
            $response->response = $data->resultDescription;
            $response->save();
        }

        // Update CRM Record
    }

    public function sendMessageResponse($data)
    {
        $postData = [];
        $messageId = $data->messageId;

        $messageLog = MessageLog::where('messageId', $messageId)->first();
        if ($messageLog) {
            $date = new DateTime();
            $postData['reference'] = $messageLog->refId;
            $postData['messageContext'] = $messageLog->content;
            $postData['from'] = ['number' => $messageLog->sender, 'name' => $messageLog->sender];
            $postData['to'] = ['number' => json_decode($messageLog->destinations)[0]];
            $postData['message'] = ['text' => $messageLog->content, 'media' => ['mediaUri' => '', 'contentType' => $messageLog->type, 'title' => '']];
            $postData['custom'] = (object)[];
            $postData['groupings'] = ['', '', ''];
            $postData['time'] = $date->format('Y-m-d H:i:s');
            $postData['timeUtc'] = $date->format('Y-m-d\TH:i:s');
            $postData['channel'] = 'WhatsApp';

            error_log(print_r('Send Message Response - ' . $messageLog->content, true));

            $callBackUrl = IncomingUrl::where('account_id', $messageLog->account_id)->first();
            $curl = curl_init();
            curl_setopt_array($curl, array(
                CURLOPT_URL => $callBackUrl->incoming_url,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_ENCODING => '',
                CURLOPT_MAXREDIRS => 10,
                CURLOPT_TIMEOUT => 0,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                CURLOPT_CUSTOMREQUEST => 'POST',
                CURLOPT_POSTFIELDS => json_encode($postData),
                CURLOPT_HTTPHEADER => array(
                    'Content-Type: application/json',
                    'operation: login',
                    'username: '. config('crmUserName'),
                    'accessKey: '. config('crmAccessKey')
                ),
            ));

            $response = curl_exec($curl);
            curl_close($curl);
            return $response;
        }
    }

    /**
     * Store incoming message response
     */
    public function incomingMessageResponse($data)
    {

        if ($this->origin == $data->destination) {

            $getAccount = Account::where('phone_number', $data->destination)->first();
            $accountId = $getAccount->id;
            $user_id = $getAccount->user_id;


            $messageLog = MessageLog::where('messageId', $data->messageId)->first();
            if (!$messageLog) {
                $messageLog = new MessageLog();
            }
            $messageLog->direction = 'In';
            $messageLog->channel = $data->content->type;
            $messageLog->type = $data->content->message->contentType;
            $messageLog->content = $data->content->message->text;
            $messageLog->sender = $data->source;
            $messageLog->status = 'Incoming';
            $messageLog->user_id = $user_id;
            $messageLog->refId = $data->route->refId;
            $messageLog->messageId = $data->messageId;
            $messageLog->destinations = json_encode(array($data->destination));
            $messageLog->country = '';
            $messageLog->account_id = $accountId;
            $messageLog->save();
            return true;
        }
    }

    /**
     * Save Message log
     */
    public function saveMessageLog($data)
    {
        $id = Auth::id();
        $accountId = '';
        if (isset($_POST['account_number'])) {
            $getAccount = Account::where('phone_number', $_POST['account_number'])->first();
            $accountId = $getAccount->id;
        }
        $messageLog = new MessageLog();
        $messageLog->account_id = $accountId;
        $messageLog->channel = 'WhatsApp';
        $messageLog->content = isset($data['subject']) ? $data['subject'] : '';
        $messageLog->direction = 'Out';
        $messageLog->sender = $data['source'];
        $messageLog->country = 'India';
        $messageLog->status = 'Queued';
        $messageLog->user_id = $id;
        $messageLog->refId = $data['refId'];
        $messageLog->messageId = $data['result']->messageIds[0];
        $messageLog->destinations = json_encode($data['destinations']);
        $messageLog->save();

        return true;
    }

    /**
     * Send Messages using API from CRM
     */
    public function sendMessage(Request $request)
    {
        $data['authorization'] = config('app.token');
        $data['apiKey'] = config('app.apiKey');

        $data['platFormId'] = config('app.platFormId');
        $data['platFormParentId'] = config('app.platFormParentId');
        $data['priority'] = 'NORMAL';
        $data['source'] = $_POST['account_number'];
        $data['destinations'] = array($_POST['destination']);
        $data['subject'] = $_POST['content'];
        $data['refId'] = mt_rand(10000000, 99999999);

        // Post message to Whatsapp with linkmobility
        $curl = curl_init();
        curl_setopt_array($curl, array(
            CURLOPT_URL => config('app.linkMobURL'), 
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 0,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => 'POST',
            CURLOPT_POSTFIELDS => '{
                    "platformId":"' . $data['platFormId'] . '",
                    "platformPartnerId":"' . $data['platFormParentId'] . '",
                    "priority":"' . $data['priority'] . '",
                    "eventReportGates":[
                    "zxMLiFn6"
                    ],
                    "refId":"' . $data['refId'] . '",
                    "source":"' . $data['source'] . '",
                    "destinations":' . json_encode($data['destinations']) . ' ,
                    "messages":[
                    {
                        "type":"text",
                        "previewUrl": false,
                        "text": {
                            "body": "' . $data['subject'] . '"
                        }
                    }]
                    }',
            CURLOPT_HTTPHEADER => array(
                'x-api-key: ' . $data['apiKey'],
                'Authorization: ' . $data['authorization'],
                'Content-Type: application/json'
            ),
        ));

        $response = curl_exec($curl);
        curl_close($curl);

        if ($response) {
            $result = json_decode($response);
            $data['result'] = $result;
            $this->saveMessageLog($data);
        }
        echo json_encode($result);
        die;
    }

    /**
     * Send message with template
     */
    public function sendTemplateMessage(Request $request)
    {

        if (isset($_POST['account_number'])) {
            $getAccount = Account::where('phone_number', $_POST['account_number'])->first();
            $account_id = $getAccount->id;
        }
        $template_id = $_POST['template'];
        $template = Template::where('account_id', $account_id)
            ->where('id', $template_id)
            ->where('account_id', $account_id)
            ->first();

        $data['authorization'] = config('app.token');
        $data['apiKey'] = config('app.apiKey');

        $data['platFormId'] = config('app.platFormId');
        $data['platFormParentId'] = config('app.platFormParentId');
        $data['priority'] = 'NORMAL';
        $data['source'] = $_POST['account_number'];
        $data['destinations'] = array($_POST['destination']);
        $data['refId'] = mt_rand(10000000, 99999999);

        $data['name_space'] = $template->template_name_space; 
        $data['temp_name'] = $template->template_name; 
        $curl = curl_init();
        curl_setopt_array($curl, array(
            CURLOPT_URL => config('app.linkMobURL'),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 0,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => 'POST',
            CURLOPT_POSTFIELDS => '{

                    "platformId":"' . $data['platFormId'] . '",
                    "platformPartnerId":"' . $data['platFormParentId'] . '",
                    "priority":"' . $data['priority'] . '",
                    "eventReportGates":[
                    "zxMLiFn6"
                    ],
                    "refId":"' . $data['refId'] . '",
                    "source":"' . $data['source'] . '",
                    "destinations":' . json_encode($data['destinations']) . ' ,

                    "messages": [
                    {
                    "type": "template",
                    "template": {
                        "namespace": "' . $data['name_space'] . '",
                        "name": "' . $data['temp_name'] . '",
                        "language": {
                            "code": "en"
                        }
                    }
                    }
                    ]
                    }',
            CURLOPT_HTTPHEADER => array(
                'Content-Type: application/json',
                'x-api-key: ' . $data['apiKey'],
                'Authorization: ' . $data['authorization'],
            ),
        ));

        $response = curl_exec($curl);
        curl_close($curl);
        if ($response) {
            $result = json_decode($response);
            $data['result'] = $result;
            $this->saveMessageLog($data);
        }
        echo json_encode($result);
        die;
    }

    /** 
     * Return templates list
     */
    public function getTemplates(Request $request)
    {
        $user = $request->user();
        $getTemplates = Template::leftJoin('accounts', 'accounts.id', 'account_id')
            ->where('user_id', $user->id)
            ->get();

        echo json_encode($getTemplates);
    }
}
