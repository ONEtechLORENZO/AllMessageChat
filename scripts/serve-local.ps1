param(
    [string]$PhpExe = "C:\Users\Utente\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.8.4_Microsoft.Winget.Source_8wekyb3d8bbwe\php.exe",
    [string]$Host = "127.0.0.1",
    [int]$Port = 8000
)

if (-not (Test-Path $PhpExe)) {
    throw "PHP executable not found at $PhpExe"
}

$env:PHP_MEMORY_LIMIT = "512M"
$env:PHP_MAX_EXECUTION_TIME = "0"

& $PhpExe artisan serve --host=$Host --port=$Port
