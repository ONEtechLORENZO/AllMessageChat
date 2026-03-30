<?php

namespace App\Services\Templates;

use App\Models\Template;

class WhatsAppTemplateAdapter
{
    /**
     * @return array<string, mixed>
     */
    public function render(Template $template): array
    {
        return [
            'channel' => 'whatsapp',
            'template_uid' => $template->template_uid,
            'name' => $template->name,
        ];
    }
}
