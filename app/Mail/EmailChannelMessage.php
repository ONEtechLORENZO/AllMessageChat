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
            htmlString: nl2br(e($this->body)),
        );
    }
}
