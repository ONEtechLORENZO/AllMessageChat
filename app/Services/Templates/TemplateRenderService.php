<?php

namespace App\Services\Templates;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\Template;
use InvalidArgumentException;

class TemplateRenderService
{
    public function facebookAllowedVariables(): array
    {
        return [
            'first_name' => 'First Name',
            'last_name' => 'Last Name',
            'email' => 'Email',
            'phone_number' => 'Phone Number',
        ];
    }

    public function facebookSampleData(): array
    {
        return [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'phone_number' => '+39 320 000 0000',
        ];
    }

    public function isInternalSocialTemplate(?Template $template): bool
    {
        if (! $template) {
            return false;
        }

        return in_array((string) $template->service, ['facebook', 'instagram'], true)
            && is_array($template->payload_json)
            && $template->payload_json !== [];
    }

    /**
     * @return array<string, mixed>
     */
    public function renderForContact(Template $template, ?Contact $contact = null): array
    {
        $adapter = $this->resolveAdapter($template);
        $variables = $this->buildVariableContext($contact);

        return $adapter->render($template, $variables);
    }

    /**
     * @return array<string>
     */
    public function extractVariables(?Template $template): array
    {
        if (! $this->isInternalSocialTemplate($template)) {
            return [];
        }

        return $this->resolveAdapter($template)->extractVariables((array) $template->payload_json);
    }

    /**
     * @return array<string>
     */
    public function validateInternalTemplate(Template $template): array
    {
        if (! $this->isInternalSocialTemplate($template)) {
            return ['Template payload is missing or unsupported.'];
        }

        return $this->resolveAdapter($template)->validatePayload((array) $template->payload_json);
    }

    /**
     * @return array<string, mixed>
     */
    protected function buildVariableContext(?Contact $contact): array
    {
        if (! $contact) {
            return [];
        }

        $payload = $contact->toArray();

        if (! isset($payload['name']) || $payload['name'] === '') {
            $payload['name'] = trim(((string) ($payload['first_name'] ?? '')) . ' ' . ((string) ($payload['last_name'] ?? '')));
        }

        return $payload;
    }

    protected function resolveAdapter(Template $template): AbstractMetaTemplateAdapter
    {
        return match ((string) $template->service) {
            'facebook' => new FacebookTemplateAdapter(),
            'instagram' => new InstagramTemplateAdapter(),
            default => throw new InvalidArgumentException('Unsupported template channel: ' . (string) $template->service),
        };
    }

    /**
     * @return array<string, mixed>
     */
    public function defaultPayloadForChannel(string $channel, string $type): array
    {
        $safeChannel = strtolower(trim($channel));
        if (! in_array($safeChannel, ['facebook', 'instagram'], true)) {
            return ['type' => $type];
        }

        return match ($type) {
            'text' => [
                'type' => 'text',
                'body' => $safeChannel === 'facebook' ? 'Hi {first_name},' : 'Hi {{first_name}},',
            ],
            'media' => [
                'type' => 'media',
                'media_type' => 'image',
                'media_url' => '',
                'body' => '',
            ],
            'card' => [
                'type' => 'card',
                'title' => 'Card title',
                'subtitle' => '',
                'image_url' => '',
                'buttons' => [],
            ],
            'carousel' => [
                'type' => 'carousel',
                'cards' => [[
                    'title' => 'Card title',
                    'subtitle' => '',
                    'image_url' => '',
                    'buttons' => [],
                ]],
            ],
            'quick_replies' => [
                'type' => 'quick_replies',
                'body' => 'How can we help?',
                'quick_replies' => [[
                    'title' => 'Reply',
                    'payload' => 'reply',
                ]],
            ],
            default => [
                'type' => 'text',
                'body' => '',
            ],
        };
    }

    public function resolvePreviewText(?Template $template): string
    {
        if (! $this->isInternalSocialTemplate($template)) {
            return (string) ($template?->name ?? '');
        }

        $payload = (array) $template->payload_json;
        $type = (string) ($payload['type'] ?? '');

        return match ($type) {
            'text', 'quick_replies', 'media' => (string) ($payload['body'] ?? $template->name),
            'card' => (string) ($payload['title'] ?? $template->name),
            'carousel' => (string) data_get($payload, 'cards.0.title', $template->name),
            default => (string) $template->name,
        };
    }
}
