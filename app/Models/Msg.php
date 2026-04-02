<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Brick\PhoneNumber\PhoneNumber;
use Brick\PhoneNumber\PhoneNumberParseException;
use App\Models\WhatsAppUsers;
use App\Models\Message;
use App\Models\Document;
use App\Models\MessageButton;
use App\Models\Session;
use App\Models\Company;
use Carbon\Carbon;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Msg extends Model
{
    use HasFactory;

    public $api_url = 'https://api.gupshup.io';


    public function msgable()
    {
        return $this->morphTo();
    }

    protected $casts = [
        'recipient_to' => 'array',
        'recipient_cc' => 'array',
        'recipient_bcc' => 'array',
        'sent_at' => 'datetime',
        'received_at' => 'datetime',
        'is_delivered' => 'boolean',
        'is_read' => 'boolean',
    ];

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(ChatListContact::class, 'chat_list_contact_id');
    }

    /**
     * Send message to WhatsApp
     */
    public function sendWhatsAppMessage($content, $to, $account, $templateId = '' , $attachment = '', $product = [], $interactiveMessage = [])
    {   
        // remove + (plus) symbol       
        $destination = str_replace('+', '' , $to);

        // Check balance
        $canSend = $this->checkBalanceAmount($to , $account->phone_number);
        
        $company = Company::first();

        Log::info(['check status ', $canSend , $company->payment_method]);
        if(!$canSend && $company->payment_method == 'Prepaid'){
            $error = ['status' => false , 'message' => "You have insufficient balance"];
            return ['result' => $error];
        }

        if($account->service_engine == 'facebook'){

            // create URL
            $url = config('app.fb.api_url');
            $url .= $account->fb_phone_number_id . '/messages' ;

            $user = User::find($account->user_id);
            // set headers
            $headers = [
                'Authorization' => 'Bearer '. $account->fb_token,
                'Content-Type' => 'application/json',
            ];
            $post_data = [
                'messaging_product' => 'whatsapp',
                'to' => $destination,
            ];

            // set data if is template  
            if($templateId && $templateId != "undefined" ){  

                $template =  Message::join('templates', 'templates.id' , 'template_id')
                    ->where('messages.template_uid', $templateId)
                    ->where('account_id', $account->id)
                    ->first();
                
            //    $template = Template::where('template_uid' , $template)->first();
                $tempMessage = Message::where('template_uid', $templateId)->first();
                if($tempMessage) {
                    $tempButtons = MessageButton::where('message_id', $tempMessage->id)->get();
                }
                $message['name'] = strtolower(str_replace( ' ', '_', $template->name));
                $message['language'] = [ 'code' => $tempMessage->language];

                $components = [];
                /*
                // Append components
                if($template->type != 'text') {
                    $componentType = $template->type;
                    $header = $button = '';
                    if($tempMessage->attach_file) {
                        $header = [
                            'type' => 'header',
                            'parameters' => [[
                                "type" => $template->type,
                                $template->type => [
                                    'link' => $tempMessage->attach_file,
                                ]
                            ]]
                        ];
                        array_push($components , json_encode($header));
                    }

                    $templateParam = [];
                    foreach($content as $param){
                        $templateParam[] = ["type" => "text", 'text' => $param];
                    }

                    $body = [
                        'type' => 'body',
                        'parameters' => $templateParam
                    ];
                    array_push($components , json_encode($body));
                } else {
                    $templateParam = [];
                    foreach($content as $param){
                        $templateParam[] = ["type" => "text", 'text' => $param];
                    }
                    if($templateParam){
                        $body = [
                            'type' => 'body',
                            'parameters' => $templateParam
                        ];
                        array_push($components , json_encode($body));
                    }
                }
                if($tempButtons){
                    foreach($tempButtons as $key => $tempButton){
                        if($tempButton->action == 'visit_website'){
                            $button = [
                                'type' => 'button',
                                'index' => $key,
                                "sub_type" => "url",
//                                'parameters' => [[
//                                    'type' => 'text',
 //                                   'text' => $tempButton->body,
   //                             ]],
                                //"fallback_url" => $tempButton->url,
                                //"title" => $tempButton->body
                            ];
                        }
                        if($tempButton->button_type == 'Quick Reply') {
                            $button = [
                                'type' => 'button',
                                'index' => $key,
                                'sub_type' => 'quick_reply',
                                'parameters' => [[
                                    'type' => 'text',
                                    'text' => $tempButton->body,
                                ]],
                            ];
                        }
    //                    $components[] = json_encode($button);
                    }
                }
                if($components) {
                    $message['components'] = ($components);
                }
                */
                $docUrl = '';
                if($tempMessage->attach_file) {
                    $document = Document::find($tempMessage->attach_file);
                    $docUrl = url("uploads/".$document->path);
                }

                $post_data['type'] = 'template';
                if($template->type != 'text' && $template->type) {
                    $component = [
                        'type' => 'header',
                        'parameters' => [[
                                'type' => $template->type,
                                $template->type => [
                                    'link' => $docUrl, 
                                ]],
                        ]
                    ];
                    array_push($components , json_encode($component));
                }
                if($content) {
                    $templateParam = [];
                    foreach($content as $param){
                        $templateParam[] = ["type" => "text", 'text' => $param];
                    }

                    $body = [
                        'type' => 'body',
                        'parameters' => $templateParam
                    ];
                    array_push($components , json_encode($body));
                }
                if($components) {
                    $message['components'] = ($components);
                }
                $post_data['template'] = (($message));

            } else if($attachment) { 
                // set attachment
                $post_data['type'] = $attachment['type'];
                $post_data[$attachment['type']] = ['link' => $attachment['url']];

                if($attachment['type'] == 'document') {
                    $post_data[$attachment['type']]['filename'] = $content;
                }
            } else if($product) {
                $post_data['recipient_type'] = 'individual';
                $post_data['type'] = 'interactive'; 
                $post_data['interactive'] = json_encode($product);
            } else {
                $post_data['type'] = 'text'; 
                $post_data['recipient_type'] = 'individual';
                $post_data['text'] = (json_encode(['body' => $content]));
            }

            log::info(['send_message_info', $url , $headers, $post_data]);

            // send message 
            $response = Http::asForm()->withHeaders($headers)->post($url, $post_data);
            $response_body = json_decode($response->body(), true);
            log::info(['send_message_info', $response_body]);

            if(isset($response_body['messages'][0]['id'])) {
                $messageId = $response_body['messages'][0]['id'];
                $response_body = [ 
                    'status' => 'submitted',
                    'messageId' => $messageId
                ];
                if($attachment) { 
                    $response_body['msg_type'] = $attachment['type'];
                    $response_body['file_path'] = $attachment['url'];
                }
                $data['result'] = $response_body;
            } else {
                $response_body = [ 
                    'status' => 'error',
                    'error' => $response_body['error']['message'],
                ];

                $data['result'] = $response_body;
            }

            return $data;

        } else {

            $checkOptIn = (new WhatsAppUsers)->checkUserOptin($destination , $account->id);
            if(! $checkOptIn){
                $error = ['status' => false, 'message' => "Inactive user"];
                return ['result' => $error];
            }

            $url = config('app.api_url');

            $post_data = [
                'channel' => 'whatsapp',
                'source' => $account->phone_number,
                'destination' => $destination,
                'src.name' => $account->src_name,
                'disablePreview' => null
            ];

            if($templateId && $templateId != "undefined" ){  
                // Set template type object
                if($templateId == '9cfa1504-86b3-4b78-a544-a3c6530fcf5b') {     //TODO Need to fix 
                    $content[]= 'test';
                }
                $message = [
                    'id' => $templateId,
                    'params' => ($content) ? $content : [],
                ];
                $post_data['template'] = (json_encode($message));

                // Add media type template params
                $docUrl = '';
                $tempMessage = Message::where('template_uid', $templateId)
                    ->first();
                
                if($tempMessage && $tempMessage->attach_file) {
                    $docUrl = $tempMessage->attach_file;
                }
               
                if($tempMessage->header_type != 'text' && $tempMessage->header_type) {
			$mediaData['type'] =  $tempMessage->header_type;
			if($docUrl) {
				$mediaData[$tempMessage->header_type]['link'] = 'link_url';
			}
			if($tempMessage->media_id) {
				$mediaData[$tempMessage->header_type]['id'] = $tempMessage->media_id;
			}
			$postDataMessage = json_encode($mediaData);

                    $postDataMessage = str_replace('link_url' , $docUrl , $postDataMessage) ;  
                    $post_data['message'] = $postDataMessage;
                }
                $url = str_replace('msg', 'template/msg', $url);
            } else if($attachment) { 
                // Set attachment

                $post_data['message'] = (json_encode($attachment));
                $data['msg_type'] = $attachment['type'];
                $data['file_path'] = isset($attachment['previewUrl']) ? $attachment['previewUrl'] : $attachment['url'] ;

            } else {
                // Set text type object
                $message = [
                    "type" => "text",
                    "text" => $content
                ];
                $post_data['message'] = (json_encode($message));
            }

            $headers = [
                'Accept' => 'application/json',
                'apikey' => config('app.apiKey')
            ];
            if($interactiveMessage) {
                $post_data['message'] = json_encode($interactiveMessage);
            }
            log::info(['send_message_info', $url, $post_data]);
            
            $response = Http::asForm()->withHeaders($headers)->post($url, $post_data);
            $response_body = json_decode($response->body(), true);
            log::info(['send_message_result_info', $response_body]);

            if( $response_body && $response_body['status'] != 'error') {
                $data = $post_data;
                $data['account_id'] = $account->id;
                $data['content'] = $content;
            } 
            if($attachment) { 
                $response_body['msg_type'] = $attachment['type'];
                $response_body['file_path'] = isset($attachment['previewUrl']) ? $attachment['previewUrl'] : $attachment['url'] ;
            }
        }
        $data['result'] = $response_body;
        return $data;
    }

    /**
     * Send message to Instagram user
     */
    public function sendInstagramMessage($message, $context_id, $bot_name)
    {        
        $url = $this->api_url . "/sm/api/bot/{$bot_name}/msg";
        $api_key = config('app.apiKey');
        $headers = [
            'apikey' => $api_key,
        ];

        $post_data = [
            'context' => json_encode([
                'channeltype' => 'instagram',
                'contexttype' => 'p2p',
                'contextid' => $context_id,
                'botname' => $bot_name,
            ]),
            'message' => $message,
        ];
        Log::info(['send message data' => $post_data] );
        $response = Http::asForm()->withHeaders($headers)->post($url, $post_data);
        $response_body = json_decode($response->body(), true);
        Log::info( ['response' =>  $response_body]);

        if($response_body['status'] == 'success') {
            return true;
        }
        else {
            return false;
        }
    }

    /**
     * Send Insta message via facebook
     */
    public function sendInstaMessage($content, $recipient , $pageId, $token, $attachment = '')
    {
        $version = config('app.meta.graph_version');
        $url = "https://graph.facebook.com/{$version}/{$pageId}/messages";
        $messages = [];

        if (is_array($content) && isset($content['messages']) && is_array($content['messages'])) {
            $messages = array_values(array_filter($content['messages'], 'is_array'));
        } else if($attachment){
            $messages[] = [
                'attachment' => [
                    'type' => $attachment['type'],
                    'payload' => [ 'url' => $attachment['url']]
                ]
            ];
        } else {
            $messages[] = ['text' => $content];
        }

        try{
            $result = [];
            $messageIds = [];
            foreach ($messages as $message) {
                if (isset($message['quick_replies']) && is_array($message['quick_replies'])) {
                    $normalizedReplies = [];
                    foreach ($message['quick_replies'] as $reply) {
                        if (! is_array($reply)) {
                            continue;
                        }
                        $title = trim((string) ($reply['title'] ?? ''));
                        if ($title === '') {
                            continue;
                        }
                        $payload = trim((string) ($reply['payload'] ?? ''));
                        if ($payload === '') {
                            $payload = $title;
                        }
                        $normalizedReplies[] = [
                            'content_type' => 'text',
                            'title' => mb_substr($title, 0, 20),
                            'payload' => mb_substr($payload, 0, 1000),
                        ];
                    }
                    $message = [
                        'text' => (string) ($message['text'] ?? ''),
                        'quick_replies' => $normalizedReplies,
                    ];
                    Log::info('Meta quick replies payload', [
                        'recipient' => $recipient,
                        'message' => $message,
                    ]);
                }
                $post_data = [
                    'recipient' => [ 'id' => $recipient ],
                    'message' => $message,
                    'messaging_type' => 'RESPONSE',
                    'access_token' => $token,
                ];

                $response = Http::asJson()->post($url, $post_data);
                $result = json_decode($response->body(), true);

                if(isset($result['error']) && isset($result['error']['code']) && $result['error']['code'] == 100) {
                    $controlUrl = "https://graph.facebook.com/{$version}/{$pageId}/take_thread_control";
                    $controlData = [
                        'recipient' => [ 'id' => $recipient ],
                        'access_token' => $token,
                    ];
                    Http::asJson()->post($controlUrl, $controlData);
                    $response = Http::asJson()->post($url, $post_data);
                    $result = json_decode($response->body(), true);
                }

                if (isset($result['message_id'])) {
                    $messageIds[] = $result['message_id'];
                } elseif (isset($result['id'])) {
                    $messageIds[] = $result['id'];
                }
            }

            if ($messageIds !== []) {
                $result['message_ids'] = $messageIds;
                $result['message_id'] = end($messageIds);
            }
        } catch (\Throwable $e) {
            $result = [
                'error' => [
                    'message' => $e->getMessage(),
                ],
            ];
        }
        Log::info( [' Insta send message response' =>  $result]);
        return $result;
    }

    /**
     * Return Instagra profile info
     */
    public function getProfileDetail($channelid)
    {
        $endPoint = $this->api_url.'/sm/api/bot/InstaGupshupTesting/fetch_profile?';
   
        $param = [
            'context' => json_encode([
                'contextid' => $channelid,
                'channeltype' => 'instagram',
                "contexttype" => "p2p",
                "botname" =>  "InstaGupshupTesting"
            ]),
            'sender' => json_encode([
                'channeltype' => 'instagram',
                'channelid' => $channelid,
            ])
        ];

        $endPoint .= http_build_query($param);

        log::info(['url'  => $endPoint]);

        $api_key = config('app.apiKey');
        $headers = [
            'apikey' => $api_key,
        ];

        $response = Http::withHeaders($headers)->get($endPoint);
        $response_body = json_decode($response->body(), true);

        return ($response_body);
    }

    /**
     * Check balance to send message
     */
    public function checkBalanceAmount($phoneNumber, $accountNumber)
    {
        if (! Schema::hasColumns('sessions', ['account_id', 'contact_id', 'created_at'])) {
            Log::warning('Skipping session balance lookup because the sessions table does not have messaging session columns.');
            return true;
        }

        $number = PhoneNumber::parse('+'.$phoneNumber);
        $countryCode = $number->getCountryCode();
        $company = Company::first();

        $condition = [
            'account_id' => $accountNumber,
            'contact_id' => $phoneNumber,
        ];

        $session = Session::where($condition)
                ->where('created_at', '>=', Carbon::now()->subDay())
                ->first();

       
        if($session) {
            return true;
        } else {

            $sessions = Session::count();
            if( $sessions <= $company->amount_limit) {
                return true;
            } else {
                return false;
            }
            
            /*
            $price = Price::where('country_code' , $countryCode)->first();
            $minAmount = ($price && $price->business_initiated) ? $price->business_initiated : 0;

            $sessions = Session::where($condition)->count();
            if($sessions < 1000) {
                $minAmount = config('stripe.wp_msg_price');
            } else {
                $minAmount =  $minAmount + config('stripe.wp_msg_price');
            }

            $wallet = Wallet::first();
            
            $minAmount = $wallet->balance_amount - $minAmount;

            if($wallet && (-$company->amount_limit <= $minAmount)){
                return true;
            } else {
                return false;
            }
            */
        }
    }

}
