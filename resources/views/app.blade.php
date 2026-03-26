<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title inertia>{{ config('app.name', 'OneMessage') }}</title>
    <!-- Favicon -->
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <link rel="icon" href="/favicon.png" type="image/png">
    <link rel="apple-touch-icon" href="/favicon.png">

    @php
        $vite = app(\Illuminate\Foundation\Vite::class);
        $localHosts = ['localhost', '127.0.0.1', '::1'];
        $useHotVite = app()->environment('local') && in_array(request()->getHost(), $localHosts, true);

        if (! $useHotVite) {
            $vite->useHotFile(storage_path('framework/vite-disabled.hot'));
        }
    @endphp

    @routes
    @if ($useHotVite)
        @viteReactRefresh
    @endif
    @vite(['resources/js/app.jsx', 'resources/css/app.css'])
</head>

<body class="antialiased">
    @inertia
</body>

</html>
