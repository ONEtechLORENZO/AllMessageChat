<?php

namespace App\Support\Assistant;

use App\Models\Account;
use App\Models\Api;
use App\Models\Automation;
use App\Models\Campaign;
use App\Models\Catalog;
use App\Models\Contact;
use App\Models\Group;
use App\Models\Import;
use App\Models\InteractiveMessage;
use App\Models\Lead;
use App\Models\Message;
use App\Models\MessageLog;
use App\Models\Opportunity;
use App\Models\Order;
use App\Models\Organization;
use App\Models\Plan;
use App\Models\Price;
use App\Models\Product;
use App\Models\SupportRequest;
use App\Models\Tag;
use Spatie\Permission\Models\Role as PermissionRole;

class AssistantDataRegistry
{
    public function aliases(): array
    {
        return [
            'contact' => ['contact', 'contacts'],
            'lead' => ['lead', 'leads'],
            'campaign' => ['campaign', 'campaigns'],
            'product' => ['product', 'products'],
            'order' => ['order', 'orders'],
            'automation' => ['automation', 'automations'],
            'interactive message' => ['interactive message', 'interactive messages'],
            'role' => ['role', 'roles', 'permissions', 'role permissions'],
            'api' => ['api', 'api key', 'api keys'],
            'support request' => ['support request', 'support requests', 'ticket', 'tickets'],
            'message' => ['message', 'messages', 'conversation', 'conversations'],
            'message log' => ['message log', 'message logs', 'logs'],
            'account' => ['account', 'accounts', 'social profile', 'social profiles'],
            'organization' => ['organization', 'organizations'],
            'tag' => ['tag', 'tags'],
            'group' => ['group', 'groups'],
            'deal' => ['deal', 'deals', 'opportunity', 'opportunities'],
            'import' => ['import', 'imports'],
            'catalog' => ['catalog', 'catalogs'],
            'price' => ['price', 'prices', 'pricing', 'billing prices'],
            'plan' => ['plan', 'plans'],
            'billing' => ['billing', 'wallet'],
        ];
    }

    public function modules(): array
    {
        return [
            'contact' => [
                'label' => 'contact',
                'model' => Contact::class,
                'preview_fields' => ['first_name', 'last_name', 'email', 'phone_number', 'id'],
                'date_fields' => ['created_at', 'updated_at', 'birth_date'],
                'navigation' => 'contacts',
            ],
            'lead' => [
                'label' => 'lead',
                'model' => Lead::class,
                'preview_fields' => ['name', 'sales_stage', 'amount', 'id'],
                'date_fields' => ['created_at', 'updated_at', 'expected_close_date'],
                'navigation' => 'leads',
            ],
            'campaign' => [
                'label' => 'campaign',
                'model' => Campaign::class,
                'preview_fields' => ['name', 'status', 'service', 'id'],
                'date_fields' => ['created_at', 'updated_at', 'scheduled_at'],
                'navigation' => 'campaigns',
            ],
            'product' => [
                'label' => 'product',
                'model' => Product::class,
                'preview_fields' => ['name', 'price', 'description', 'id'],
                'date_fields' => ['created_at', 'updated_at'],
                'navigation' => 'products',
            ],
            'order' => [
                'label' => 'order',
                'model' => Order::class,
                'preview_fields' => ['name', 'status', 'description', 'id'],
                'date_fields' => ['created_at', 'updated_at', 'due_date'],
                'navigation' => 'orders',
            ],
            'automation' => [
                'label' => 'automation',
                'model' => Automation::class,
                'preview_fields' => ['name', 'trigger_mode', 'status', 'id'],
                'date_fields' => ['created_at', 'updated_at'],
                'navigation' => 'automations',
            ],
            'interactive message' => [
                'label' => 'interactive message',
                'model' => InteractiveMessage::class,
                'preview_fields' => ['name', 'option_type', 'id'],
                'date_fields' => ['created_at', 'updated_at'],
                'navigation' => 'interactive messages',
            ],
            'role' => [
                'label' => 'role',
                'model' => PermissionRole::class,
                'preview_fields' => ['name', 'guard_name', 'id'],
                'date_fields' => ['created_at', 'updated_at'],
                'navigation' => 'roles',
            ],
            'api' => [
                'label' => 'api key',
                'model' => Api::class,
                'preview_fields' => ['name', 'api_key', 'id'],
                'date_fields' => ['created_at', 'updated_at'],
                'navigation' => 'api keys',
            ],
            'support request' => [
                'label' => 'support request',
                'model' => SupportRequest::class,
                'preview_fields' => ['subject', 'status', 'type', 'id'],
                'date_fields' => ['created_at', 'updated_at'],
                'navigation' => 'support requests',
            ],
            'message' => [
                'label' => 'message',
                'model' => Message::class,
                'preview_fields' => ['name', 'title', 'subject', 'id'],
                'date_fields' => ['created_at', 'updated_at', 'sent_at'],
                'navigation' => 'messages',
            ],
            'message log' => [
                'label' => 'message log',
                'model' => MessageLog::class,
                'preview_fields' => ['name', 'title', 'subject', 'id'],
                'date_fields' => ['created_at', 'updated_at'],
                'navigation' => 'message logs',
            ],
            'account' => [
                'label' => 'account',
                'model' => Account::class,
                'preview_fields' => ['company_name', 'name', 'service', 'id'],
                'date_fields' => ['created_at', 'updated_at'],
                'navigation' => 'accounts',
            ],
            'organization' => [
                'label' => 'organization',
                'model' => Organization::class,
                'preview_fields' => ['name', 'industry', 'email', 'phone_number', 'id'],
                'date_fields' => ['created_at', 'updated_at'],
                'navigation' => 'organizations',
            ],
            'tag' => [
                'label' => 'tag',
                'model' => Tag::class,
                'preview_fields' => ['name', 'description', 'id'],
                'date_fields' => ['created_at', 'updated_at'],
                'navigation' => 'tags',
            ],
            'group' => [
                'label' => 'group',
                'model' => Group::class,
                'preview_fields' => ['group_name', 'name', 'group_description', 'description', 'id'],
                'date_fields' => ['created_at', 'updated_at'],
                'navigation' => 'groups',
            ],
            'deal' => [
                'label' => 'deal',
                'model' => Opportunity::class,
                'preview_fields' => ['name', 'sales_stage', 'amount', 'id'],
                'date_fields' => ['created_at', 'updated_at', 'expected_close_date'],
                'navigation' => 'deals',
            ],
            'import' => [
                'label' => 'import',
                'model' => Import::class,
                'preview_fields' => ['name', 'title', 'file_name', 'status', 'id'],
                'date_fields' => ['created_at', 'updated_at'],
                'navigation' => 'imports',
            ],
            'catalog' => [
                'label' => 'catalog',
                'model' => Catalog::class,
                'preview_fields' => ['name', 'title', 'id'],
                'date_fields' => ['created_at', 'updated_at'],
                'navigation' => 'catalogs',
            ],
            'price' => [
                'label' => 'price',
                'model' => Price::class,
                'preview_fields' => ['country_code', 'user_initiated', 'business_initiated', 'message', 'media', 'id'],
                'date_fields' => ['created_at', 'updated_at'],
                'navigation' => 'pricing',
            ],
            'plan' => [
                'label' => 'plan',
                'model' => Plan::class,
                'preview_fields' => ['name', 'title', 'id'],
                'date_fields' => ['created_at', 'updated_at'],
                'navigation' => 'plans',
            ],
        ];
    }
}
