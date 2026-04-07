<?php

return [
    'default_locale' => 'en',

    'supported_locales' => ['en', 'it'],

    'models' => [
        [
            'value' => 'gpt-4.1',
            'label' => 'GPT-4.1',
        ],
        [
            'value' => 'gpt-4.1-mini',
            'label' => 'GPT-4.1 Mini',
        ],
        [
            'value' => 'gpt-4.1-nano',
            'label' => 'GPT-4.1 Nano',
        ],
        [
            'value' => 'gpt-4o',
            'label' => 'GPT-4o',
        ],
        [
            'value' => 'gpt-4o-mini',
            'label' => 'GPT-4o Mini',
        ],
        [
            'value' => 'o3-mini',
            'label' => 'o3 Mini',
        ],
        [
            'value' => 'o1',
            'label' => 'o1',
        ],
    ],

    'tone_presets' => [
        'professional' => [
            'labels' => [
                'en' => 'Professional',
                'it' => 'Professionale',
            ],
            'instructions' => <<<TEXT
Use a polished, reliable, business-appropriate tone.
Be clear, structured, and respectful.
Avoid slang, exaggeration, and unnecessary filler.
TEXT,
        ],

        'friendly' => [
            'labels' => [
                'en' => 'Friendly',
                'it' => 'Amichevole',
            ],
            'instructions' => <<<TEXT
Use a warm, approachable, and natural tone.
Be helpful and welcoming without becoming casual to the point of being unprofessional.
Prefer simple, human wording.
TEXT,
        ],

        'concise' => [
            'labels' => [
                'en' => 'Concise',
                'it' => 'Conciso',
            ],
            'instructions' => <<<TEXT
Be brief, direct, and efficient.
Prefer short answers and compact structure.
Avoid unnecessary explanation unless the user explicitly asks for more detail.
TEXT,
        ],

        'empathetic' => [
            'labels' => [
                'en' => 'Empathetic',
                'it' => 'Empatico',
            ],
            'instructions' => <<<TEXT
Show understanding and emotional awareness.
Acknowledge concerns before giving guidance.
Be calm, supportive, and reassuring while staying accurate.
TEXT,
        ],

        'formal' => [
            'labels' => [
                'en' => 'Formal',
                'it' => 'Formale',
            ],
            'instructions' => <<<TEXT
Use a formal, precise, and polished tone.
Prefer complete sentences and professional wording.
Avoid colloquialisms, emojis, and overly casual phrasing.
TEXT,
        ],
    ],
];
