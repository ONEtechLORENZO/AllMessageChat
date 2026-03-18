<?php

namespace App\Http\Middleware;

use App\Services\CampaignExecutionService;
use Closure;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class RunDueCampaigns
{
    public function handle($request, Closure $next)
    {
        return $next($request);
    }

    public function terminate($request, $response): void
    {
        if (! Auth::check()) {
            return;
        }

        try {
            app(CampaignExecutionService::class)->runDueCampaigns();
        } catch (\Throwable $exception) {
            Log::error('Unable to process due campaigns from HTTP fallback.', [
                'exception' => $exception,
            ]);
        }
    }
}
