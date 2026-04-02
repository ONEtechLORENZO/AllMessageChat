<?php

namespace App\Services\Templates;

use App\Models\Template;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;

abstract class AbstractMetaTemplateAdapter
{
    protected const VARIABLE_PATTERN = '/{{\s*([a-zA-Z0-9_]+)\s*}}|{\s*([a-zA-Z0-9_]+)\s*}/';

    abstract public function channel(): string;

    /**
     * @return array<string>
     */
    abstract protected function supportedTemplateTypes(): array;

    /**
     * @return array<string>
     */
    abstract protected function supportedButtonTypes(): array;

    /**
     * @return array<string>
     */
    protected function allowedVariables(): array
    {
        return [];
    }

    /**
     * @return array<string, int>
     */
    protected function limits(): array
    {
        return [
            'body' => 1000,
            'title' => 80,
            'subtitle' => 80,
            'buttons' => 3,
            'quick_replies' => 11,
            'carousel_cards' => 10,
            'button_title' => 20,
            'postback' => 1000,
        ];
    }

    /**
     * @return array<string>
     */
    public function validatePayload(array $payload): array
    {
        $errors = [];
        $type = (string) ($payload['type'] ?? '');

        if (! in_array($type, $this->supportedTemplateTypes(), true)) {
            return ['Unsupported template type for ' . $this->channel() . '.'];
        }

        $limits = $this->limits();

        switch ($type) {
            case 'text':
                $errors = array_merge($errors, $this->validateTextPayload($payload, $limits));
                break;
            case 'media':
                $errors = array_merge($errors, $this->validateMediaPayload($payload, $limits));
                break;
            case 'card':
                $errors = array_merge($errors, $this->validateCardPayload($payload, $limits));
                break;
            case 'carousel':
                $cards = array_values(array_filter((array) ($payload['cards'] ?? []), 'is_array'));
                if ($cards === []) {
                    $errors[] = 'Carousel templates require at least one card.';
                }
                if (count($cards) > $limits['carousel_cards']) {
                    $errors[] = 'Carousel templates can include up to ' . $limits['carousel_cards'] . ' cards.';
                }
                foreach ($cards as $index => $card) {
                    $cardErrors = $this->validateCardPayload($card, $limits, false);
                    foreach ($cardErrors as $cardError) {
                        $errors[] = 'Card ' . ($index + 1) . ': ' . $cardError;
                    }
                }
                break;
            case 'quick_replies':
                $errors = array_merge($errors, $this->validateQuickReplyPayload($payload, $limits));
                break;
        }

        $errors = array_merge($errors, $this->validateVariableUsage($payload));

        return array_values(array_unique($errors));
    }

    /**
     * @return array{messages: array<int, array<string, mixed>>}
     */
    public function render(Template $template, array $variables = []): array
    {
        $payload = $template->payload_json;
        if (! is_array($payload)) {
            throw new TemplateAdapterException('Template payload is missing.');
        }

        $errors = $this->validatePayload($payload);
        if ($errors !== []) {
            throw new TemplateAdapterException(implode(' ', $errors));
        }

        $rendered = $this->replacePayloadVariables($payload, $variables);
        $type = (string) ($rendered['type'] ?? '');

        $messages = match ($type) {
            'text' => [[
                'text' => (string) ($rendered['body'] ?? ''),
            ]],
            'media' => $this->renderMediaMessages($rendered),
            'card' => [[
                'attachment' => [
                    'type' => 'template',
                    'payload' => [
                        'template_type' => 'generic',
                        'elements' => [$this->buildGenericElement($rendered)],
                    ],
                ],
            ]],
            'carousel' => [[
                'attachment' => [
                    'type' => 'template',
                    'payload' => [
                        'template_type' => 'generic',
                        'elements' => array_map(
                            fn (array $card) => $this->buildGenericElement($card),
                            array_values((array) ($rendered['cards'] ?? []))
                        ),
                    ],
                ],
            ]],
            'quick_replies' => [[
                'text' => (string) ($rendered['body'] ?? ''),
                'quick_replies' => array_values(array_filter(array_map(function (array $quickReply) {
                    $title = trim((string) ($quickReply['title'] ?? ''));
                    if ($title === '') {
                        return null;
                    }

                    $payload = trim((string) ($quickReply['payload'] ?? ''));
                    if ($payload === '') {
                        $payload = $title;
                    }

                    return [
                        'content_type' => 'text',
                        'title' => mb_substr($title, 0, 20),
                        'payload' => mb_substr($payload, 0, 1000),
                    ];
                }, array_values((array) ($rendered['quick_replies'] ?? []))), function ($reply) {
                    return is_array($reply);
                })),
            ]],
            default => throw new TemplateAdapterException('Unsupported template type for ' . $this->channel() . '.'),
        };

        return ['messages' => $messages];
    }

    protected function replacePayloadVariables(array $payload, array $variables): array
    {
        $replace = function ($value) use (&$replace, $variables) {
            if (is_array($value)) {
                return array_map($replace, $value);
            }

            if (! is_string($value)) {
                return $value;
            }

            return preg_replace_callback(self::VARIABLE_PATTERN, function ($matches) use ($variables) {
                $key = (string) (($matches[1] ?? '') !== '' ? $matches[1] : ($matches[2] ?? ''));
                $value = Arr::get($variables, $key);

                if ($value === null || $value === '') {
                    return '';
                }

                return is_scalar($value) ? (string) $value : '';
            }, $value) ?? $value;
        };

        return $replace($payload);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    protected function renderMediaMessages(array $payload): array
    {
        $messages = [];
        $body = trim((string) ($payload['body'] ?? ''));

        if ($body !== '') {
            $messages[] = ['text' => $body];
        }

        $messages[] = [
            'attachment' => [
                'type' => (string) ($payload['media_type'] ?? 'image'),
                'payload' => [
                    'url' => (string) ($payload['media_url'] ?? ''),
                    'is_reusable' => false,
                ],
            ],
        ];

        return $messages;
    }

    /**
     * @return array<string, mixed>
     */
    protected function buildGenericElement(array $payload): array
    {
        $element = [
            'title' => (string) ($payload['title'] ?? ''),
        ];

        $subtitle = trim((string) ($payload['subtitle'] ?? ''));
        if ($subtitle !== '') {
            $element['subtitle'] = $subtitle;
        }

        $imageUrl = trim((string) ($payload['image_url'] ?? ''));
        if ($imageUrl !== '') {
            $element['image_url'] = $imageUrl;
        }

        $buttons = array_values(array_filter((array) ($payload['buttons'] ?? []), 'is_array'));
        if ($buttons !== []) {
            $element['buttons'] = array_map(function (array $button) {
                $type = (string) ($button['type'] ?? '');

                return match ($type) {
                    'web_url' => [
                        'type' => 'web_url',
                        'title' => (string) ($button['title'] ?? ''),
                        'url' => (string) ($button['url'] ?? ''),
                    ],
                    'postback' => [
                        'type' => 'postback',
                        'title' => (string) ($button['title'] ?? ''),
                        'payload' => (string) ($button['payload'] ?? ''),
                    ],
                    'phone_number' => [
                        'type' => 'phone_number',
                        'title' => (string) ($button['title'] ?? ''),
                        'payload' => (string) ($button['phone_number'] ?? ''),
                    ],
                    default => throw new TemplateAdapterException('Unsupported button type for ' . $this->channel() . '.'),
                };
            }, $buttons);
        }

        return $element;
    }

    /**
     * @return array<string>
     */
    protected function validateTextPayload(array $payload, array $limits): array
    {
        $body = trim((string) ($payload['body'] ?? ''));
        $errors = [];

        if ($body === '') {
            $errors[] = 'Text templates require body text.';
        }

        if (mb_strlen($body) > $limits['body']) {
            $errors[] = 'Body text exceeds the supported length for ' . $this->channel() . '.';
        }

        return $errors;
    }

    /**
     * @return array<string>
     */
    protected function validateMediaPayload(array $payload, array $limits): array
    {
        $errors = [];
        $mediaType = (string) ($payload['media_type'] ?? '');
        $mediaUrl = trim((string) ($payload['media_url'] ?? ''));
        $body = trim((string) ($payload['body'] ?? ''));

        if (! in_array($mediaType, ['image', 'video'], true)) {
            $errors[] = 'Media templates support image or video only.';
        }

        if ($mediaUrl === '') {
            $errors[] = 'Media templates require a media URL.';
        }

        if ($body !== '' && mb_strlen($body) > $limits['body']) {
            $errors[] = 'Optional media body text exceeds the supported length.';
        }

        return $errors;
    }

    /**
     * @return array<string>
     */
    protected function validateCardPayload(array $payload, array $limits, bool $allowMissingType = true): array
    {
        $errors = [];
        $title = trim((string) ($payload['title'] ?? ''));
        $subtitle = trim((string) ($payload['subtitle'] ?? ''));
        $buttons = array_values(array_filter((array) ($payload['buttons'] ?? []), 'is_array'));

        if (! $allowMissingType && isset($payload['type'])) {
            unset($payload['type']);
        }

        if ($title === '') {
            $errors[] = 'Cards require a title.';
        }

        if (mb_strlen($title) > $limits['title']) {
            $errors[] = 'Card title exceeds the supported length.';
        }

        if ($subtitle !== '' && mb_strlen($subtitle) > $limits['subtitle']) {
            $errors[] = 'Card subtitle exceeds the supported length.';
        }

        if (count($buttons) > $limits['buttons']) {
            $errors[] = 'Cards support up to ' . $limits['buttons'] . ' buttons.';
        }

        foreach ($buttons as $index => $button) {
            $buttonType = (string) ($button['type'] ?? '');
            if (! in_array($buttonType, $this->supportedButtonTypes(), true)) {
                $errors[] = 'Button ' . ($index + 1) . ' uses an unsupported action.';
                continue;
            }

            $titleValue = trim((string) ($button['title'] ?? ''));
            if ($titleValue === '') {
                $errors[] = 'Button ' . ($index + 1) . ' requires a title.';
            } elseif (mb_strlen($titleValue) > $limits['button_title']) {
                $errors[] = 'Button ' . ($index + 1) . ' title is too long.';
            }

            if ($buttonType === 'web_url' && trim((string) ($button['url'] ?? '')) === '') {
                $errors[] = 'Button ' . ($index + 1) . ' requires a URL.';
            }

            if ($buttonType === 'postback') {
                $payloadValue = trim((string) ($button['payload'] ?? ''));
                if ($payloadValue === '') {
                    $errors[] = 'Button ' . ($index + 1) . ' requires a postback value.';
                } elseif (mb_strlen($payloadValue) > $limits['postback']) {
                    $errors[] = 'Button ' . ($index + 1) . ' postback value is too long.';
                }
            }

            if ($buttonType === 'phone_number' && trim((string) ($button['phone_number'] ?? '')) === '') {
                $errors[] = 'Button ' . ($index + 1) . ' requires a phone number.';
            }
        }

        return $errors;
    }

    /**
     * @return array<string>
     */
    protected function validateQuickReplyPayload(array $payload, array $limits): array
    {
        $errors = $this->validateTextPayload($payload, $limits);
        $quickReplies = array_values(array_filter((array) ($payload['quick_replies'] ?? []), 'is_array'));

        if ($quickReplies === []) {
            $errors[] = 'Quick replies require at least one reply option.';
        }

        if (count($quickReplies) > $limits['quick_replies']) {
            $errors[] = 'Quick replies support up to ' . $limits['quick_replies'] . ' options.';
        }

        foreach ($quickReplies as $index => $quickReply) {
            $title = trim((string) ($quickReply['title'] ?? ''));

            if ($title === '') {
                $errors[] = 'Quick reply ' . ($index + 1) . ' requires a label.';
                continue;
            }

            if (mb_strlen($title) > $limits['button_title']) {
                $errors[] = 'Quick reply ' . ($index + 1) . ' label is too long.';
            }
        }

        return $errors;
    }

    /**
     * @return array<string>
     */
    public function extractVariables(array $payload): array
    {
        return Collection::make($payload)
            ->dot()
            ->reject(fn ($value, $key) => str_contains((string) $key, 'fallback_values'))
            ->filter(fn ($value) => is_string($value))
            ->flatMap(function (string $value) {
                preg_match_all(self::VARIABLE_PATTERN, $value, $matches, PREG_SET_ORDER);

                return array_map(function (array $match) {
                    return (string) (($match[1] ?? '') !== '' ? $match[1] : ($match[2] ?? ''));
                }, $matches);
            })
            ->filter()
            ->unique()
            ->values()
            ->all();
    }

    /**
     * @return array<string>
     */
    protected function validateVariableUsage(array $payload): array
    {
        $allowedVariables = $this->allowedVariables();
        if ($allowedVariables === []) {
            return [];
        }

        $errors = [];
        $usedVariables = $this->extractVariables($payload);

        foreach ($usedVariables as $variable) {
            if (! in_array($variable, $allowedVariables, true)) {
                $errors[] = '{' . $variable . '} is not supported. Use First Name, Last Name, Email, or Phone Number only.';
            }
        }

        return $errors;
    }
}
