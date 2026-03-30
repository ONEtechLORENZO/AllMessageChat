<?php

namespace App\Services;

use App\Http\Controllers\Controller;
use App\Http\Controllers\MsgController;
use App\Models\Account;
use App\Models\Campaign;
use App\Models\Contact;
use App\Models\Message;
use App\Models\Msg;
use App\Models\Template;
use App\Models\WhatsAppUsers;
use App\Services\Templates\TemplateAdapterException;
use App\Services\Templates\TemplateRenderService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class CampaignExecutionService
{
    protected int $contactBatchSize = 1;

    protected array $defaultTemplateFieldOrder = [
        'first_name',
        'last_name',
        'email',
        'phone_number',
        'instagram_username',
    ];

    public function runDueCampaigns(int $maxProcessedCampaigns = 1): int
    {
        return Cache::lock('campaign-execution', 55)->get(function () use ($maxProcessedCampaigns) {
            $processedCampaignIds = [];
            $processedCampaignCount = 0;

            while ($campaign = $this->getNextDueCampaign($processedCampaignIds)) {
                $processedCampaignIds[] = $campaign->id;

                $processedCount = $this->processCampaign($campaign);

                if ($processedCount > 0) {
                    $processedCampaignCount++;

                    if ($processedCampaignCount >= $maxProcessedCampaigns) {
                        break;
                    }
                }
            }

            return $processedCampaignCount;
        }) ?? 0;
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

    protected function resolveWhatsAppTemplateMessage($templateReference, ?int $accountId = null): ?Message
    {
        if (! $templateReference) {
            return null;
        }

        return Message::when($accountId, function ($query) use ($accountId) {
            $query->join('templates', 'templates.id', '=', 'messages.template_id')
                ->where('templates.account_id', $accountId)
                ->select('messages.*');
        })
            ->where(function ($query) use ($templateReference) {
                $query->where('messages.template_id', $templateReference)
                    ->orWhere('messages.template_uid', $templateReference);
            })
            ->orderBy('messages.id')
            ->first();
    }

    protected function decodeWhatsAppTemplateMapping(?Message $message): array
    {
        if (! $message || ! $message->example) {
            return [];
        }

        if (base64_decode($message->example, true) !== false) {
            $decoded = unserialize(base64_decode($message->example), ['allowed_classes' => false]);

            return is_array($decoded) ? $decoded : [];
        }

        return is_array($message->example) ? $message->example : [];
    }

    protected function extractTemplatePlaceholderIndexes(?string $body): array
    {
        if (! $body) {
            return [];
        }

        preg_match_all('/{{\s*(\d+)\s*}}/', $body, $matches);

        if (! isset($matches[1])) {
            return [];
        }

        $indexes = array_values(array_unique(array_map('intval', $matches[1])));
        sort($indexes);

        return $indexes;
    }

    protected function resolveContactFieldValue(Contact $contact, string $fieldName): string
    {
        $value = data_get($contact, $fieldName);

        if ($value === null && str_starts_with($fieldName, 'custom.')) {
            $value = data_get($contact->custom ?? [], substr($fieldName, 7));
        }

        if ($value === null && str_starts_with($fieldName, 'custom->')) {
            $value = data_get($contact->custom ?? [], substr($fieldName, 8));
        }

        return is_scalar($value) ? (string) $value : '';
    }

    protected function resolveWhatsAppTemplateParams(Contact $contact, ?Message $templateMessage): array
    {
        if (! $templateMessage) {
            return [];
        }

        $controller = new Controller();
        $placeholderIndexes = $this->extractTemplatePlaceholderIndexes($templateMessage->body);
        $sampleMapping = $this->decodeWhatsAppTemplateMapping($templateMessage);
        $params = [];

        if ($sampleMapping) {
            if (array_is_list($sampleMapping)) {
                foreach ($sampleMapping as $value) {
                    $params[] = $controller->replaceFieldValue((string) $value, $contact);
                }

                return $params;
            }

            foreach ($placeholderIndexes as $position => $placeholderIndex) {
                $mappingValue = $sampleMapping[(string) $placeholderIndex]
                    ?? $sampleMapping[$placeholderIndex]
                    ?? null;

                if ($mappingValue === null) {
                    $fallbackField = $this->defaultTemplateFieldOrder[$position] ?? null;
                    $mappingValue = $fallbackField ? '{{' . $fallbackField . '}}' : '';
                }

                $resolved = $controller->replaceFieldValue((string) $mappingValue, $contact);
                $params[] = $resolved;
            }

            return $params;
        }

        foreach ($placeholderIndexes as $position => $placeholderIndex) {
            $fieldName = $this->defaultTemplateFieldOrder[$position] ?? null;
            $params[] = $fieldName ? $this->resolveContactFieldValue($contact, $fieldName) : '';
        }

        return $params;
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

    protected function resolveSocialTemplateBody($templateReference): string
    {
        if (! $templateReference) {
            return '';
        }

        $message = Message::where('template_id', $templateReference)
            ->orderBy('id')
            ->first();

        if ($message?->body) {
            return (string) $message->body;
        }

        $template = Template::find($templateReference);
        if ($template?->text_body) {
            return (string) $template->text_body;
        }

        if ($template?->html_body) {
            return strip_tags((string) $template->html_body);
        }

        return (string) ($template?->name ?? '');
    }

    protected function resolveInternalSocialTemplate($templateReference, ?int $accountId = null, ?string $channel = null): ?Template
    {
        if (! $templateReference || ! $accountId || ! $channel) {
            return null;
        }

        return Template::where('id', $templateReference)
            ->where('account_id', $accountId)
            ->where('service', $channel)
            ->whereNotNull('payload_json')
            ->first();
    }

    protected function resolveSocialDestination(Contact $contact, string $channel, ?Account $account = null): string
    {
        return match ($channel) {
            'facebook' => (string) ($contact->facebook_username ?? ''),
            'instagram' => $this->resolveInstagramDestination($contact, $account),
            default => '',
        };
    }

    protected function resolveInstagramDestination(Contact $contact, ?Account $account = null): string
    {
        $destination = trim((string) ($contact->instagram_username ?? ''));

        if (
            (string) ($account?->connection_model ?? '') === 'instagram_login'
            && $destination !== ''
            && ! preg_match('/^\d+$/', $destination)
        ) {
            return '';
        }

        return $destination;
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

        return isset($response['messageId'])
            || isset($response['message_id'])
            || isset($response['result']['messageId']);
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

        if (! $account) {
            $this->markCampaignFailed($campaign, 'Account not found.');
            return 0;
        }

        $fields = [
            'first_name' => ['label' => __('First Name'), 'type' => 'text'],
            'last_name' => ['label' => __('Last Name'), 'type' => 'text'],
            'email' => ['label' => __('Email'), 'type' => 'text'],
            'phone_number' => ['label' => __('Phone number'), 'type' => 'phone_number'],
            'instagram_username' => ['label' => __('Instagram Username'), 'type' => 'text'],
        ];

        $controller = new Controller();
        $contacts = $controller->getContactRecords($module, $fields, $searchData, $this->contactBatchSize, $offset);
        $msg = new Msg();
        $msgController = new MsgController();
        $whatsAppTemplateId = $this->resolveWhatsAppTemplateId($template);
        $whatsAppTemplateMessage = $channel === 'whatsapp'
            ? $this->resolveWhatsAppTemplateMessage($template, (int) $campaign->account_id)
            : null;
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
                    $response = $msg->sendWhatsAppMessage(
                        $this->resolveWhatsAppTemplateParams($contact, $whatsAppTemplateMessage),
                        $mobileNumber,
                        $account,
                        $whatsAppTemplateId
                    );
                }
            } elseif ($channel == 'email') {
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
            } elseif (in_array($channel, ['instagram', 'facebook'], true)) {
                $destination = $this->resolveSocialDestination($contact, $channel, $account);

                if ($destination) {
                    $sendAttempted = true;
                    $internalTemplate = $this->resolveInternalSocialTemplate($template, (int) $campaign->account_id, $channel);
                    $messageBody = $this->resolveSocialTemplateBody($template);
                    $renderedPayload = null;

                    if ($internalTemplate) {
                        try {
                            $renderedPayload = app(TemplateRenderService::class)->renderForContact($internalTemplate, $contact);
                        } catch (TemplateAdapterException $e) {
                            $this->markCampaignFailed($campaign, $e->getMessage());
                            return 0;
                        }
                    }

                    if ($channel === 'instagram' && (string) ($account->connection_model ?? '') === 'instagram_login') {
                        try {
                            $response = app(\App\Services\MetaIntegrationService::class)->sendInstagramMessage(
                                $account,
                                $destination,
                                $renderedPayload ?: $messageBody
                            );
                        } catch (\Throwable $e) {
                            $this->markCampaignFailed($campaign, $e->getMessage());
                            return 0;
                        }
                    } elseif ($account->service_engine === 'facebook') {
                        $metaIntegrationService = app(\App\Services\MetaIntegrationService::class);
                        $pageToken = (new WhatsAppUsers())->getFbPageAccessToken($account);

                        if (! $pageToken) {
                            $this->markCampaignFailed($campaign, 'Unable to retrieve the Meta page access token.');
                            return 0;
                        }

                        $response = $msg->sendInstaMessage(
                            $renderedPayload ?: $messageBody,
                            $destination,
                            $account->fb_phone_number_id,
                            $pageToken
                        );

                        $responseError = $response['error']['message'] ?? $response['error'] ?? '';
                        if ($channel === 'facebook' && $metaIntegrationService->isMetaAccessTokenInvalid($responseError)) {
                            $refreshedPageToken = $metaIntegrationService->refreshFacebookPageAccessToken($account);

                            if ($refreshedPageToken !== '') {
                                $response = $msg->sendInstaMessage(
                                    $renderedPayload ?: $messageBody,
                                    $destination,
                                    $account->fb_phone_number_id,
                                    $refreshedPageToken
                                );
                                $responseError = $response['error']['message'] ?? $response['error'] ?? '';
                            }

                            if ($metaIntegrationService->isMetaAccessTokenInvalid($responseError)) {
                                $metaIntegrationService->markFacebookReconnectRequired(
                                    $account,
                                    'Facebook session expired. Connect Facebook again to continue.'
                                );
                                $this->markCampaignFailed($campaign, 'Facebook session expired. Connect Facebook again to continue.');
                                return 0;
                            }
                        }
                    } else {
                        $response = $msg->sendInstagramMessage($messageBody, $destination, $account->src_name);
                    }
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
}
