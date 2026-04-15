<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword as BaseResetPassword;
use Illuminate\Notifications\Messages\MailMessage;

class ResetPasswordNotification extends BaseResetPassword
{
    protected function resetUrl(mixed $notifiable): string
    {
        $frontendUrl = rtrim(config('app.frontend_url', config('app.url')), '/');

        return $frontendUrl . '/reset-password?' . http_build_query([
            'token' => $this->token,
            'email' => $notifiable->getEmailForPasswordReset(),
        ]);
    }

    public function toMail(mixed $notifiable): MailMessage
    {
        $expireMinutes = config('auth.passwords.' . config('auth.defaults.passwords') . '.expire', 60);
        $resetUrl      = $this->resetUrl($notifiable);

        return (new MailMessage)
            ->subject('Recuperar Password — KIVARA')
            ->view('emails.reset-password', [
                'resetUrl'      => $resetUrl,
                'expireMinutes' => $expireMinutes,
            ]);
    }
}
