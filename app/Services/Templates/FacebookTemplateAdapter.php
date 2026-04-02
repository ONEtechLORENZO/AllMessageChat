<?php

namespace App\Services\Templates;

class FacebookTemplateAdapter extends AbstractMetaTemplateAdapter
{
    public function channel(): string
    {
        return 'facebook';
    }

    protected function supportedTemplateTypes(): array
    {
        return ['text', 'media', 'card', 'carousel'];
    }

    protected function supportedButtonTypes(): array
    {
        return ['web_url', 'postback', 'phone_number'];
    }

    protected function allowedVariables(): array
    {
        return ['first_name', 'last_name', 'email', 'phone_number'];
    }
}
