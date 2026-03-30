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
        $httpFallbackEnabled = ! app()->environment(['local', 'testing'])
            || filter_var((string) env('ENABLE_HTTP_CAMPAIGN_FALLBACK', false), FILTER_VALIDATE_BOOL);

        if (! $httpFallbackEnabled) {
            return;
        }

        try {
            if (! Auth::check()) {
                return;
            }
        } catch (\Throwable $exception) {
            Log::warning('Skipping HTTP campaign fallback because auth state could not be resolved.', [
                'exception' => $exception,
            ]);
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
