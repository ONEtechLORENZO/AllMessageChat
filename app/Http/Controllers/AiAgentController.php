<?php

namespace App\Http\Controllers;

use App\Services\IndustryAgentChatService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Throwable;

class AiAgentController extends Controller
{
    public function browse(Request $request, IndustryAgentChatService $service)
    {
        return Inertia::render('AIAgent/BrowseAgents', [
            'agents' => $service->catalog(),
            'openAiConfigured' => $service->isConfigured(),
        ]);
    }

    public function chat(Request $request, IndustryAgentChatService $service)
    {
        $validated = $request->validate([
            'agent' => ['required', 'string', 'in:loans,banking,fashion,hospitality'],
            'messages' => ['required', 'array', 'min:1'],
            'messages.*.role' => ['required', 'string', 'in:user,assistant'],
            'messages.*.content' => ['required', 'string'],
        ]);

        try {
            return response()->json($service->chat($validated['agent'], $validated['messages']));
        } catch (Throwable $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }
    }

    public function test(Request $request)
    {
        $validated = $request->validate([
            'message' => ['required', 'string'],
            'agent_name' => ['nullable', 'string'],
            'tone' => ['nullable', 'string'],
            'model' => ['nullable', 'string'],
            'system_instructions' => ['nullable', 'string'],
        ]);

        $apiKey = config('services.openai.api_key');

        if (!filled($apiKey)) {
            return response()->json([
                'reply' => 'OpenAI is not configured yet. Add OPENAI_API_KEY in .env to test custom agents.',
            ]);
        }

        $instructions = trim(implode("\n\n", array_filter([
            filled($validated['agent_name'] ?? null) ? 'Agent name: ' . $validated['agent_name'] : null,
            filled($validated['tone'] ?? null) ? 'Preferred tone: ' . $validated['tone'] : null,
            filled($validated['system_instructions'] ?? null) ? 'System instructions: ' . $validated['system_instructions'] : null,
        ])));

        try {
            $response = Http::baseUrl('https://api.openai.com/v1')
                ->withToken($apiKey)
                ->timeout((int) config('services.openai.timeout', 30))
                ->acceptJson()
                ->asJson()
                ->post('/chat/completions', [
                    'model' => $validated['model'] ?: config('services.openai.model', 'gpt-4o-mini'),
                    'messages' => array_filter([
                        $instructions !== '' ? ['role' => 'system', 'content' => $instructions] : null,
                        ['role' => 'user', 'content' => $validated['message']],
                    ]),
                ])
                ->throw()
                ->json();

            return response()->json([
                'reply' => trim((string) data_get($response, 'choices.0.message.content', 'No response.')),
            ]);
        } catch (Throwable $exception) {
            return response()->json([
                'reply' => 'Error: ' . $exception->getMessage(),
            ], 422);
        }
    }
}
