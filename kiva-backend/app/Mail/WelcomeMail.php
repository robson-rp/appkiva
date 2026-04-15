<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WelcomeMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly string $displayName,
        public readonly string $appUrl,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Bem-vindo(a) ao KIVARA 🎉');
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.welcome',
            with: [
                'displayName' => $this->displayName,
                'appUrl'      => $this->appUrl,
            ],
        );
    }
}
