param(
    [string]$PhpExe = "C:\Users\Utente\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.8.4_Microsoft.Winget.Source_8wekyb3d8bbwe\php.exe",
    [string]$MySqlExe = "C:\xampp\mysql\bin\mysqld.exe",
    [string]$MySqlDefaultsFile = "C:\xampp\mysql\bin\my.ini",
    [string]$BindHost = "127.0.0.1",
    [int]$Port = 8000,
    [switch]$StartVite,
    [switch]$Background
)

if (-not (Test-Path $PhpExe)) {
    throw "PHP executable not found at $PhpExe"
}

if (-not (Get-Process mysqld -ErrorAction SilentlyContinue)) {
    if (-not (Test-Path $MySqlExe)) {
        throw "MariaDB executable not found at $MySqlExe"
    }

    Start-Process $MySqlExe -ArgumentList "--defaults-file=$MySqlDefaultsFile","--standalone","--console"
    Start-Sleep -Seconds 3
}

if ($StartVite.IsPresent) {
    $viteArgs = @(
        "-NoProfile",
        "-Command",
        "Set-Location '$PSScriptRoot\..'; npm run dev -- --host 127.0.0.1 --port 5173"
    )

    if ($Background.IsPresent) {
        Start-Process powershell -ArgumentList $viteArgs -WindowStyle Hidden | Out-Null
    } else {
        Start-Process powershell -ArgumentList (@("-NoExit") + $viteArgs)
    }
}

Set-Location "$PSScriptRoot\.."

& $PhpExe -d memory_limit=1024M -d max_execution_time=0 artisan optimize:clear

if ($Background.IsPresent) {
    $artisanArgs = @(
        "-d", "memory_limit=1024M",
        "-d", "max_execution_time=0",
        "artisan",
        "serve",
        "--host=$BindHost",
        "--port=$Port"
    )

    Start-Process $PhpExe -ArgumentList $artisanArgs -WindowStyle Hidden | Out-Null
    Write-Output "Started Laravel server in background: http://$BindHost`:$Port"
    if ($StartVite.IsPresent) {
        Write-Output "Started Vite dev server in background: http://$BindHost`:5173"
    }
} else {
    & $PhpExe -d memory_limit=1024M -d max_execution_time=0 artisan serve --host=$BindHost --port=$Port
}
