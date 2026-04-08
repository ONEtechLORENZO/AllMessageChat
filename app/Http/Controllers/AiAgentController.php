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
        if (! $playgroundService->isConfigured()) {
            return response()->json([
                'message' => 'OpenAI is not configured yet. Add OPENAI_ONE_API_KEY in .env before saving agents.',
            ], 422);
        }

        $validated = $request->validate([
            'agent_id' => ['nullable', 'integer'],
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
            'system_instructions' => ['required', 'string', 'max:20000'],
            'locale' => [
                'nullable',
                'string',
                Rule::in(config('ai_agents.supported_locales', ['en', 'it'])),
            ],
        ]);

        $requestedAgent = null;

        if (filled($validated['agent_id'] ?? null)) {
            $requestedAgent = AiAgent::query()
                ->where('id', $validated['agent_id'])
                ->first();

            if (! $requestedAgent) {
                return response()->json([
                    'message' => 'The selected agent could not be found.',
                ], 404);
            }
        }

        $existingByKey = AiAgent::query()
            ->where('key', $validated['key'])
            ->first();

        $duplicateByName = AiAgent::query()
            ->whereRaw('LOWER(name) = ?', [Str::lower($validated['name'])])
            ->when(
                $requestedAgent,
                fn($query) => $query->where('id', '!=', $requestedAgent->id)
            )
            ->orderByDesc('updated_at')
            ->first();

        $agent = $requestedAgent
            ?? $existingByKey
            ?? $duplicateByName
            ?? new AiAgent([
                'key' => $validated['key'],
            ]);

        $agent->fill([
            'name' => $validated['name'],
            'tone_preset_key' => $validated['tone_preset_key'],
            'model' => $validated['model'],
            'system_instructions' => $validated['system_instructions'],
            'locale' => $this->normalizeLocale(
                $validated['locale'] ?? $request->user()?->language
            ),
        ]);

        if (! filled($agent->key)) {
            $agent->key = $validated['key'];
        }

        $agent->save();

        $instructions = app(AiAgentInstructionResolver::class)->resolve([
            'agent_name' => $agent->name,
            'tone_preset_key' => $agent->tone_preset_key,
            'system_instructions' => $agent->system_instructions,
            'locale' => $agent->locale,
            'fallback_locale' => $request->user()?->language,
        ]);

        try {
            $assistant = $playgroundService->syncAssistant($agent, $instructions);
        } catch (Throwable $exception) {
            return response()->json([
                'message' => 'OpenAI assistant sync failed: ' . $exception->getMessage(),
            ], 422);
        }

        $agent->forceFill([
            'assistant_id' => data_get($assistant, 'id'),
            'openai_synced_at' => now(),
        ])->save();

        return response()->json([
            'success' => true,
            'agent' => [
                'id' => $agent->id,
                'key' => $agent->key,
                'name' => $agent->name,
                'assistant_id' => $agent->assistant_id,
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
        AiAgentPlaygroundService $playgroundService
    ) {
        $validated = $request->validate([
            'agent_id' => ['required', 'integer'],
            'message' => ['required', 'string'],
            'thread_id' => ['nullable', 'string', 'max:120'],
        ]);

        if (! $playgroundService->isConfigured()) {
            return $playgroundService->streamError(
                'OpenAI is not configured yet. Add OPENAI_ONE_API_KEY in .env to test custom agents.',
                422
            );
        }

        $agent = AiAgent::query()
            ->where('id', $validated['agent_id'])
            ->first();

        if (! $agent) {
            return $playgroundService->streamError('The selected agent could not be found.', 404);
        }

        if (! filled($agent->assistant_id)) {
            return $playgroundService->streamError(
                'This agent is missing its OpenAI assistant ID. Save it again to resync.',
                422
            );
        }

        try {
            return $playgroundService->streamAssistantReply(
                $agent,
                $validated['message'],
                $validated['thread_id'] ?? null
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
