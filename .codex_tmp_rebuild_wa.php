<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$controller = app(App\Http\Controllers\MsgController::class);
$method = new ReflectionMethod($controller, 'ensureConversationIndexForService');
$method->setAccessible(true);
$method->invoke($controller, 1, 'whatsapp');

echo json_encode([
  'whatsapp_chat_count' => App\Models\ChatListContact::where('account_id', 1)->where('channel', 'whatsapp')->count(),
  'facebook_chat_count' => App\Models\ChatListContact::where('account_id', 14)->where('channel', 'facebook')->count(),
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
