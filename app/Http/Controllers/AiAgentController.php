<?php

namespace App\Http\Controllers;

use App\Models\AiAgent;
use App\Services\AiAgentInstructionResolver;
use App\Services\AiAgentPlaygroundService;
use App\Services\IndustryAgentChatService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Throwable;

class AiAgentController extends Controller
{
    public function choose(Request $request)
    {
        $agents = AiAgent::query()
            ->where('user_id', $request->user()->id)
            ->orderByDesc('updated_at')
            ->get(['id', 'key', 'name']);

        return Inertia::render('AIAgent/ChooseAgent', [
            'agents' => $agents,
        ]);
    }

    public function browse(Request $request, IndustryAgentChatService $service)
    {
        return Inertia::render('AIAgent/BrowseAgents', [
            'agents' => $service->catalog(),
            'openAiConfigured' => $service->isConfigured(),
        ]);
    }

    public function create(Request $request, AiAgentPlaygroundService $playgroundService)
    {
        $locale = $this->normalizeLocale($request->user()?->language);
        $agentId = $request->query('agent');
        $agent = null;

        if ($agentId) {
            $agent = AiAgent::query()
                ->where('user_id', $request->user()->id)
                ->where('id', $agentId)
                ->first();
        }

        $tonePresets = collect(config('ai_agents.tone_presets', []))
            ->map(function (array $preset, string $key) use ($locale) {
                return [
                    'value' => $key,
                    'label' => $preset['labels'][$locale]
                        ?? $preset['labels']['en']
                        ?? Str::headline(str_replace('_', ' ', $key)),
                ];
            })
            ->values()
            ->all();

        $models = collect(config('ai_agents.models', []))
            ->map(fn(array $model) => [
                'value' => $model['value'],
                'label' => $model['label'],
            ])
            ->values()
            ->all();

        return Inertia::render('AIAgent/CreateAgent', [
            'agent' => $agent,
            'tonePresets' => $tonePresets,
            'models' => $models,
            'defaultLocale' => $locale,
            'openAiConfigured' => $playgroundService->isConfigured(),
        ]);
    }

    public function store(Request $request, AiAgentPlaygroundService $playgroundService)
    {
        $validated = $request->validate([
            'key' => ['required', 'string', 'regex:/^agnt_[A-Za-z0-9]{26}$/'],
            'name' => ['required', 'string', 'max:120'],
            'tone_preset_key' => [
                'required',
                'string',
                Rule::in(array_keys(config('ai_agents.tone_presets', []))),
            ],
            'model' => [
                'required',
                'string',
                Rule::in($playgroundService->allowedModels()),
            ],
            'system_instructions' => ['nullable', 'string', 'max:20000'],
            'locale' => [
                'nullable',
                'string',
                Rule::in(config('ai_agents.supported_locales', ['en', 'it'])),
            ],
        ]);

        $existing = AiAgent::query()
            ->where('key', $validated['key'])
            ->first();

        if ($existing && (int) $existing->user_id !== (int) $request->user()->id) {
            return response()->json([
                'message' => 'This agent key already belongs to another user.',
            ], 422);
        }

        $agent = AiAgent::query()->updateOrCreate(
            [
                'key' => $validated['key'],
                'user_id' => $request->user()->id,
            ],
            [
                'name' => $validated['name'],
                'tone_preset_key' => $validated['tone_preset_key'],
                'model' => $validated['model'],
                'system_instructions' => $validated['system_instructions'] ?? null,
                'locale' => $this->normalizeLocale(
                    $validated['locale'] ?? $request->user()?->language
                ),
            ]
        );

        return response()->json([
            'success' => true,
            'agent' => [
                'id' => $agent->id,
                'key' => $agent->key,
                'name' => $agent->name,
                'tone_preset_key' => $agent->tone_preset_key,
                'model' => $agent->model,
                'system_instructions' => $agent->system_instructions,
                'locale' => $agent->locale,
            ],
            'message' => 'Agent saved successfully.',
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

    public function test(
        Request $request,
        AiAgentInstructionResolver $instructionResolver,
        AiAgentPlaygroundService $playgroundService
    ) {
        $validated = $request->validate([
            'messages' => ['required', 'array', 'min:1'],
            'messages.*.role' => ['required', 'string', 'in:user,assistant'],
            'messages.*.content' => ['required', 'string'],
            'agent_name' => ['nullable', 'string', 'max:120'],
            'tone_preset_key' => [
                'required',
                'string',
                Rule::in(array_keys(config('ai_agents.tone_presets', []))),
            ],
            'model' => [
                'required',
                'string',
                Rule::in($playgroundService->allowedModels()),
            ],
            'system_instructions' => ['nullable', 'string', 'max:20000'],
            'locale' => [
                'nullable',
                'string',
                Rule::in(config('ai_agents.supported_locales', ['en', 'it'])),
            ],
        ]);

        if (! $playgroundService->isConfigured()) {
            return $playgroundService->streamError(
                'OpenAI is not configured yet. Add OPENAI_ONE_API_KEY in .env to test custom agents.',
                422
            );
        }

        $instructions = $instructionResolver->resolve([
            'agent_name' => $validated['agent_name'] ?? null,
            'tone_preset_key' => $validated['tone_preset_key'],
            'system_instructions' => $validated['system_instructions'] ?? null,
            'locale' => $validated['locale'] ?? null,
            'fallback_locale' => $request->user()?->language,
        ]);

        try {
            return $playgroundService->stream(
                $validated['messages'],
                $instructions,
                $validated['model']
            );
        } catch (Throwable $exception) {
            return $playgroundService->streamError(
                'OpenAI request failed: ' . $exception->getMessage(),
                422
            );
        }
    }

    private function normalizeLocale(?string $locale): string
    {
        $value = Str::of((string) $locale)->lower()->trim()->value();

        if (in_array($value, ['it', 'it-it', 'it_it', 'italian', 'italiano'], true)) {
            return 'it';
        }

        return 'en';
    }
}
