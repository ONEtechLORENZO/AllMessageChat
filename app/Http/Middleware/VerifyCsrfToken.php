<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array
     */
    protected $except = [
        '/incoming',
        '/incoming-cm',
        '/fb-whatsapp',
        '/integrations/meta/webhook',
        '/integrations/instagram/webhook',
        '/stripe-incoming',
        '/v1/send-wa-message',
        '/fb-insta'

    ];
}
