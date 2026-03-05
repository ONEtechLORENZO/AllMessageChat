<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title inertia>{{ config('app.name', 'OneMessage') }}</title>

    @routes
    @viteReactRefresh
    @vite(['resources/js/app.jsx', 'resources/css/app.css'])
</head>

<body class="antialiased">
    @inertia
</body>

</html>