<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class AuthUserSetLocale
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle($request, Closure $next)
    {
        try {
            if (Auth::check()) {
                app()->setLocale(Auth::user()->language);
            }
        } catch (\Throwable $exception) {
            Log::warning('Skipping locale resolution because auth state could not be loaded.', [
                'exception' => $exception,
            ]);
        }

        return $next($request);
    }
}
