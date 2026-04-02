<?php

namespace App\Jobs;

use App\Http\Controllers\MsgController;
use App\Models\User;
use App\Services\GmailService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Http\Request;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendChatMessageJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 120;

    public function __construct(
        public int $userId,
        public array $payload
    ) {
    }

    public function handle(MsgController $msgController, GmailService $gmailService): void
    {
        $user = User::find($this->userId);
        if (! $user) {
            return;
        }

        $request = Request::create('/chat/send', 'POST', $this->payload);
        $request->setUserResolver(fn () => $user);

        $msgController->sendMessage($request, $gmailService);
    }
}
