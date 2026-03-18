<?php

namespace App\Support\Assistant;

use App\Models\Api;
use App\Models\Automation;
use App\Models\Campaign;
use App\Models\Contact;
use App\Models\InteractiveMessage;
use App\Models\Lead;
use App\Models\Order;
use App\Models\Product;
use App\Models\SupportRequest;
use Illuminate\Database\Eloquent\Model;
use Spatie\Permission\Models\Role as PermissionRole;

class AssistantRecordResolver
{
    public function resolve(string $module, string $recordId): array
    {
        $modelClass = $this->modelClassFor($module);
        if (!$modelClass) {
            return $this->failure('unsupported_action', "Record resolution is not configured for {$module}.");
        }

        /** @var Model|null $record */
        $record = $modelClass::query()->find($recordId);
        if (!$record) {
            return $this->failure('not_found', "I could not find that {$module}.");
        }

        return [
            'ok' => true,
            'error_code' => null,
            'message' => '',
            'record' => $record,
        ];
    }

    private function modelClassFor(string $module): ?string
    {
        return match ($module) {
            'contact', 'contacts' => Contact::class,
            'lead', 'leads' => Lead::class,
            'campaign', 'campaigns' => Campaign::class,
            'product', 'products' => Product::class,
            'order', 'orders' => Order::class,
            'automation', 'automations' => Automation::class,
            'interactive message', 'interactive_messages' => InteractiveMessage::class,
            'role', 'roles' => PermissionRole::class,
            'api', 'apis' => Api::class,
            'support request', 'support_requests' => SupportRequest::class,
            default => null,
        };
    }

    private function failure(string $errorCode, string $message): array
    {
        return [
            'ok' => false,
            'error_code' => $errorCode,
            'message' => $message,
            'record' => null,
        ];
    }
}
