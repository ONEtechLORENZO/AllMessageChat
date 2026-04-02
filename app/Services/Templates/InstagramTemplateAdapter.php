<?php

namespace App\Services\Templates;

class InstagramTemplateAdapter extends AbstractMetaTemplateAdapter
{
    public function channel(): string
    {
        return 'instagram';
    }

    protected function supportedTemplateTypes(): array
    {
        return ['text', 'media', 'card', 'carousel'];
    }

    protected function supportedButtonTypes(): array
    {
        return ['web_url', 'postback'];
    }
}
