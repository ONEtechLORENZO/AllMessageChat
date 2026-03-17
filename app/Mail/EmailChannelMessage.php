<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EmailChannelMessage extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        private readonly string $emailSubject,
        private readonly string $body,
        private readonly string $fromAddress,
        private readonly string $fromName = '',
        private readonly ?string $textBody = null,
        private readonly bool $isHtml = false,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new \Illuminate\Mail\Mailables\Address($this->fromAddress, $this->fromName),
            subject: $this->emailSubject ?: '(no subject)',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'Mail.EmailChannelMessageHtml',
            text: 'Mail.EmailChannelMessageText',
            with: [
                'html' => $this->renderHtmlBody(),
                'text' => $this->renderTextBody(),
            ],
        );
    }

    protected function renderHtmlBody(): string
    {
        if ($this->isHtml) {
            return $this->body;
        }

        return nl2br(e($this->body));
    }

    protected function renderTextBody(): string
    {
        if ($this->textBody !== null && $this->textBody !== '') {
            return $this->textBody;
        }

        if (! $this->isHtml) {
            return $this->body;
        }

        $text = preg_replace('/<\s*br\s*\/?>/i', PHP_EOL, $this->body);
        $text = preg_replace('/<\s*\/p\s*>/i', PHP_EOL . PHP_EOL, $text ?? '');
        $text = strip_tags($text ?? '');

        return trim(html_entity_decode($text, ENT_QUOTES | ENT_HTML5));
    }
}
