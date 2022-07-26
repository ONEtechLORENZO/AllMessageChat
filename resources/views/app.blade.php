<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title inertia>{{ config('app.name', 'OneMessage') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com"> 
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin> 
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">

        <!-- Styles -->
        <link rel="stylesheet" href="{{ url('css/app.css') }}?v=1.7.11">
        <link rel="stylesheet" href="{{ url('css/notie.min.css') }}?v=1.7.11">

        <!-- Scripts -->
        @routes

        <script src="{{ url('js/app.js') }}?v=1.7.11" defer></script>

    </head>
    <body class="font-sans antialiased">
        @inertia

        @env ('local')
            <script src="{{ url('js/bundle.js') }}"></script>
        @endenv
    </body>
</html>
