<?php

namespace Tests\Unit;

use App\Models\Contact;
use App\Models\Order;
use App\Models\SupportRequest;
use App\Support\Assistant\AssistantPersistenceMapper;
use Tests\TestCase;

class AssistantPersistenceMapperTest extends TestCase
{
    public function test_contact_name_maps_to_first_and_last_name(): void
    {
        $payload = app(AssistantPersistenceMapper::class)->mapCreatePayload('contacts', [
            'name' => 'John Doe',
            'email' => 'john@example.com',
        ]);

        $this->assertSame('John', $payload['first_name']);
        $this->assertSame('Doe', $payload['last_name']);
        $this->assertSame('john@example.com', $payload['email']);
    }

    public function test_template_language_maps_to_languages_array_and_slug_name(): void
    {
        $payload = app(AssistantPersistenceMapper::class)->mapCreatePayload('templates', [
            'account_id' => 5,
            'category' => 'marketing',
            'language' => 'en',
            'name' => 'Spring Promo',
        ]);

        $this->assertSame('spring_promo', $payload['name']);
        $this->assertSame(['en'], $payload['languages']);
        $this->assertSame('MARKETING', $payload['category']);
    }

    public function test_update_payload_mapping_works_for_multiple_modules(): void
    {
        $contactPayload = app(AssistantPersistenceMapper::class)->mapUpdatePayload('contacts', new Contact(['id' => 1]), 'name', 'Mario Rossi');
        $orderPayload = app(AssistantPersistenceMapper::class)->mapUpdatePayload('orders', new Order(['id' => 2, 'name' => 'Renewal', 'status' => 'Open']), 'status', 'Paid');
        $supportPayload = app(AssistantPersistenceMapper::class)->mapUpdatePayload('support_requests', new SupportRequest(['id' => 3, 'subject' => 'Billing', 'type' => 'billing', 'description' => 'x', 'status' => 'Open']), 'status', 'Closed');

        $this->assertSame('Mario', $contactPayload['first_name']);
        $this->assertSame('Rossi', $contactPayload['last_name']);
        $this->assertSame('Paid', $orderPayload['status']);
        $this->assertSame('Closed', $supportPayload['status']);
    }
}
