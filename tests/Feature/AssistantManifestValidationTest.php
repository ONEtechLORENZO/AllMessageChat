<?php

namespace Tests\Feature;

use App\Services\InputAnalysisService;
use App\Services\OpenAiAssistantService;
use App\Support\Assistant\AssistantActionAuthorizer;
use App\Support\Assistant\AssistantRecordResolver;
use Mockery;
use Tests\TestCase;

class AssistantManifestValidationTest extends TestCase
{
    protected function tearDown(): void
    {
        Mockery::close();

        parent::tearDown();
    }

    public function test_contact_create_missing_fields_come_from_manifest(): void
    {
        $payload = $this->postAssistantCommand('create a contact');

        $payload->assertOk()
            ->assertJsonPath('assistant_response.intent', 'create_contact')
            ->assertJsonPath('assistant_response.status', 'needs_input')
            ->assertJsonPath('tool_result.ok', false)
            ->assertJsonPath('tool_result.error_code', 'missing_fields')
            ->assertJsonPath('tool_result.missing_fields.0', 'name')
            ->assertJsonPath('message', $payload->json('assistant_response.reply'));
    }

    public function test_campaign_create_missing_name_uses_manifest_validation(): void
    {
        $payload = $this->postAssistantCommand('create a campaign');

        $payload->assertOk()
            ->assertJsonPath('assistant_response.intent', 'create_campaign')
            ->assertJsonPath('tool_result.error_code', 'missing_fields')
            ->assertJsonPath('tool_result.missing_fields.0', 'name');
    }

    public function test_update_flow_validates_field_from_manifest(): void
    {
        $payload = $this->postAssistantCommand('update product 1 status to active');

        $payload->assertOk()
            ->assertJsonPath('assistant_response.intent', 'update_record')
            ->assertJsonPath('tool_result.ok', false)
            ->assertJsonPath('tool_result.error_code', 'validation_failed');

        $this->assertArrayHasKey('field', $payload->json('tool_result.validation_errors'));
    }

    public function test_delete_flow_requires_confirmation_from_manifest(): void
    {
        $payload = $this->postAssistantCommand('delete product 1');

        $payload->assertOk()
            ->assertJsonPath('assistant_response.intent', 'delete_record')
            ->assertJsonPath('assistant_response.status', 'needs_input')
            ->assertJsonPath('tool_result.ok', false)
            ->assertJsonPath('tool_result.error_code', 'missing_fields')
            ->assertJsonPath('tool_result.confirmation_required', true);

        $this->assertContains('confirmation', $payload->json('tool_result.missing_fields'));
    }

    public function test_continuation_flow_reuses_state_and_applies_manifest_validation(): void
    {
        $start = $this->postAssistantCommand('delete contact');
        $assistantState = $start->json('assistant_state');

        $start->assertOk()
            ->assertJsonPath('tool_result.error_code', 'missing_fields');

        $continue = $this->postAssistantCommand('5', $assistantState);

        $continue->assertOk()
            ->assertJsonPath('assistant_response.intent', 'delete_record')
            ->assertJsonPath('tool_result.error_code', 'missing_fields')
            ->assertJsonPath('tool_result.confirmation_required', true);

        $this->assertContains('confirmation', $continue->json('tool_result.missing_fields'));
    }

    public function test_legacy_response_fields_are_still_present(): void
    {
        $payload = $this->postAssistantCommand('create a role');

        $payload->assertOk()
            ->assertJsonPath('assistant_response.intent', 'create_role')
            ->assertJsonPath('tool_result.ok', false);

        $this->assertSame($payload->json('assistant_response.reply'), $payload->json('message'));
        $this->assertSame($payload->json('assistant_response.action'), $payload->json('action'));
    }

    public function test_api_and_support_request_families_use_manifest_validation(): void
    {
        $api = $this->postAssistantCommand('create an api key');
        $support = $this->postAssistantCommand('create a support request');

        $api->assertOk()
            ->assertJsonPath('assistant_response.intent', 'create_api')
            ->assertJsonPath('tool_result.error_code', 'missing_fields')
            ->assertJsonPath('tool_result.missing_fields.0', 'name');

        $support->assertOk()
            ->assertJsonPath('assistant_response.intent', 'create_support_request')
            ->assertJsonPath('tool_result.error_code', 'missing_fields');

        $this->assertContains('subject', $support->json('tool_result.missing_fields'));
        $this->assertContains('type', $support->json('tool_result.missing_fields'));
        $this->assertContains('description', $support->json('tool_result.missing_fields'));
    }

    public function test_manifest_valid_but_domain_invalid_record_resolution_is_normalized(): void
    {
        $payload = $this->postAssistantCommand('update product 999 price to 10');

        $payload->assertOk()
            ->assertJsonPath('assistant_response.intent', 'update_record')
            ->assertJsonPath('tool_result.error_code', 'not_found');
    }

    public function test_permission_failure_is_normalized_in_update_pipeline(): void
    {
        $this->withoutMiddleware();
        $this->mockAssistantServices();

        $recordResolver = Mockery::mock(AssistantRecordResolver::class);
        $recordResolver->shouldReceive('resolve')->andReturn([
            'ok' => true,
            'error_code' => null,
            'message' => '',
            'record' => new \App\Models\Product(['id' => 1]),
        ]);
        $this->app->instance(AssistantRecordResolver::class, $recordResolver);

        $authorizer = Mockery::mock(AssistantActionAuthorizer::class);
        $authorizer->shouldReceive('authorize')->andReturn([
            'ok' => false,
            'error_code' => 'permission_denied',
            'message' => 'You do not have permission to modify that record.',
            'missing_fields' => [],
            'validation_errors' => [],
            'confirmation_required' => false,
        ]);
        $this->app->instance(AssistantActionAuthorizer::class, $authorizer);

        $payload = $this->postJson(route('assistant.command'), [
            'command' => 'update product 1 price to 99',
            'page' => [
                'url' => '/dashboard',
                'component' => 'Dashboard/Index',
                'title' => 'Dashboard',
                'module' => 'dashboard',
                'props' => [],
            ],
        ]);

        $payload->assertOk()
            ->assertJsonPath('assistant_response.intent', 'update_record')
            ->assertJsonPath('tool_result.error_code', 'permission_denied');
    }

    private function postAssistantCommand(string $command, ?array $assistantState = null)
    {
        $this->withoutMiddleware();
        $this->mockAssistantServices();

        return $this->postJson(route('assistant.command'), [
            'command' => $command,
            'page' => [
                'url' => '/dashboard',
                'component' => 'Dashboard/Index',
                'title' => 'Dashboard',
                'module' => 'dashboard',
                'props' => [],
            ],
            'assistant_state' => $assistantState,
        ]);
    }

    private function mockAssistantServices(): void
    {
        $analysis = Mockery::mock(InputAnalysisService::class);
        $analysis->shouldReceive('analyze')->andReturn(null);
        $this->app->instance(InputAnalysisService::class, $analysis);

        $assistant = Mockery::mock(OpenAiAssistantService::class);
        $assistant->shouldReceive('decide')->andReturn(null);
        $this->app->instance(OpenAiAssistantService::class, $assistant);
    }
}
