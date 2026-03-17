<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use App\Models\Campaign;
use App\Models\Contact;
use App\Models\Account;
use App\Models\Message;
use App\Models\Msg;
use App\Models\Template;
use App\Http\Controllers\Controller;
use App\Http\Controllers\MsgController;

class HandleCampaign extends Command
{

    public $limit = 1;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'command:HandleCampaign';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'handle campaign scheduling';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    protected function resolveWhatsAppTemplateId($templateReference): string
    {
        if (! $templateReference) {
            return '';
        }

        $message = Message::where('template_id', $templateReference)
            ->whereNotNull('template_uid')
            ->where('template_uid', '!=', '')
            ->first();

        return $message?->template_uid ?: (string) $templateReference;
    }

    protected function resolveEmailTemplate(Campaign $campaign): ?Template
    {
        return Template::where('account_id', $campaign->account_id)
            ->where('id', $campaign->template_id)
            ->where(function ($query) {
                $query->where('service', 'email')
                    ->orWhere('category', 'EMAIL');
            })
            ->first();
    }

    protected function resolveEmailBody(Template $template): string
    {
        if (! empty($template->html_body)) {
            return (string) $template->html_body;
        }

        if (! empty($template->text_body)) {
            return (string) $template->text_body;
        }

        $message = Message::where('template_id', $template->id)
            ->where('language', 'email')
            ->first();

        if ($message?->body) {
            return (string) $message->body;
        }

        return '';
    }

    protected function resolveEmailTextBody(Template $template): string
    {
        if (! empty($template->text_body)) {
            return (string) $template->text_body;
        }

        $message = Message::where('template_id', $template->id)
            ->where('language', 'email')
            ->first();

        if ($message?->footer_content) {
            return (string) $message->footer_content;
        }

        return '';
    }

    protected function resolveEmailSubject(Template $template): string
    {
        return (string) ($template->email_subject ?: $template->name ?: '(no subject)');
    }

    protected function resolveEmailDestination(Contact $contact): string
    {
        if (! empty($contact->email)) {
            return (string) $contact->email;
        }

        $primaryEmail = collect($contact->emails ?? [])
            ->sortByDesc(fn ($email) => (int) ($email->is_primary ?? 0))
            ->first();

        return (string) ($primaryEmail->emails ?? '');
    }

    protected function getNextDueCampaign(array $excludedCampaignIds = []): ?Campaign
    {
        return Campaign::whereIn('status', ['Inprogress', 'new'])
            ->when(count($excludedCampaignIds), function ($query) use ($excludedCampaignIds) {
                $query->whereNotIn('id', $excludedCampaignIds);
            })
            ->whereNotNull('scheduled_at')
            ->where('scheduled_at', '<=', now())
            ->orderByRaw("case when status = 'Inprogress' then 0 else 1 end")
            ->orderBy('scheduled_at')
            ->orderBy('id')
            ->first();
    }

    protected function markCampaignFailed(Campaign $campaign, string $reason): void
    {
        Log::error(sprintf('Campaign %d failed: %s', $campaign->id, $reason));

        $campaign->status = 'Failed';
        $campaign->save();
    }

    protected function sendResponseSuccessful($response): bool
    {
        if ($response === true) {
            return true;
        }

        if ($response === false || ! is_array($response)) {
            return false;
        }

        $status = strtolower((string) ($response['status'] ?? ''));
        $resultStatus = strtolower((string) ($response['result']['status'] ?? ''));

        if (in_array($status, ['success', 'queued'], true)) {
            return true;
        }

        if (in_array($resultStatus, ['submitted', 'success', 'queued'], true)) {
            return true;
        }

        if ($status === 'failed' || $resultStatus === 'error') {
            return false;
        }

        return isset($response['messageId']) || isset($response['result']['messageId']);
    }

    protected function processCampaign(Campaign $campaign): int
    {
        $channel = $campaign->service;
        $template = $campaign->template_id;
        $conditions = $campaign->conditions;
        $offset = (int) ($campaign->offset ?? 0);
        $searchData = json_decode($conditions);

        $count = 0;
        $module = new Contact();
        $account = Account::find($campaign->account_id);
        $limit = $this->limit;

        if (! $account) {
            $this->markCampaignFailed($campaign, 'Account not found.');
            return 0;
        }

        $fields = [
            'first_name' => ['label' => __('First Name'), 'type' => 'text'],
            'last_name' =>  ['label' => __('Last Name'), 'type' => 'text'],
            'email' =>  ['label' => __('Email'), 'type' => 'text'],
            'phone_number' => ['label' => __('Phone number'), 'type' => 'phone_number'],
            'instagram_username' => ['label' => __('Instagram Username'), 'type' => 'text'],
        ];

        $controller = new Controller();
        $contacts = $controller->getContactRecords($module, $fields, $searchData, $limit, $offset);
        $msg = new Msg();
        $msgController = new MsgController();
        $whatsAppTemplateId = $this->resolveWhatsAppTemplateId($template);
        $emailTemplate = $channel === 'email'
            ? $this->resolveEmailTemplate($campaign)
            : null;

        if ($channel === 'email' && ! $emailTemplate) {
            $this->markCampaignFailed($campaign, 'Email template not found for selected account/template.');
            return 0;
        }

        if (! count($contacts)) {
            $campaign->status = 'Completed';
            $campaign->save();
            return 0;
        }

        foreach ($contacts as $contact) {
            $response = null;
            $sendAttempted = false;

            if ($channel == 'whatsapp') {
                $mobileNumber = $contact->phone_number;

                if ($mobileNumber) {
                    $sendAttempted = true;
                    $response = $msg->sendWhatsAppMessage('', $mobileNumber, $account, $whatsAppTemplateId);
                }
            } else if ($channel == 'email') {
                $destination = $this->resolveEmailDestination($contact);

                if ($destination && $emailTemplate) {
                    $sendAttempted = true;
                    $response = $msgController->sendEmailMessage(
                        $this->resolveEmailBody($emailTemplate),
                        $destination,
                        $account,
                        $this->resolveEmailSubject($emailTemplate),
                        $this->resolveEmailTextBody($emailTemplate),
                        true,
                    );
                }
            } else {
                $instagramId = $contact->instagram_id;

                if ($instagramId) {
                    $sendAttempted = true;
                    $response = $msg->sendInstagramMessage('', $instagramId, $account->src_name, $template);
                }
            }

            if ($sendAttempted && ! $this->sendResponseSuccessful($response)) {
                $reason = is_array($response)
                    ? (string) ($response['error'] ?? $response['result']['message'] ?? $response['result']['error'] ?? 'Delivery failed.')
                    : 'Delivery failed.';

                $this->markCampaignFailed($campaign, $reason);
                return 0;
            }

            $count++;
        }

        $campaign->offset = $offset + $count;
        $campaign->status = 'Inprogress';
        $campaign->save();

        return $count;
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $processedCampaignIds = [];

        while ($campaign = $this->getNextDueCampaign($processedCampaignIds)) {
            $processedCampaignIds[] = $campaign->id;

            $processedCount = $this->processCampaign($campaign);

            if ($processedCount > 0) {
                break;
            }
        }

        return self::SUCCESS;
    }
}
