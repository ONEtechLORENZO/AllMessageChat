param(
    [string]$PhpExe = "C:\Users\Utente\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.8.4_Microsoft.Winget.Source_8wekyb3d8bbwe\php.exe",
    [string]$MySqlExe = "C:\xampp\mysql\bin\mysqld.exe",
    [string]$MySqlDefaultsFile = "C:\xampp\mysql\bin\my.ini",
    [string]$BindHost = "127.0.0.1",
    [int]$Port = 8000,
    [switch]$StartVite
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
    Start-Process powershell -ArgumentList "-NoExit","-Command","Set-Location '$PSScriptRoot\..'; npm run dev -- --host 127.0.0.1 --port 5173"
}

Set-Location "$PSScriptRoot\.."

& $PhpExe -d memory_limit=1024M -d max_execution_time=0 artisan optimize:clear
& $PhpExe -d memory_limit=1024M -d max_execution_time=0 artisan serve --host=$BindHost --port=$Port
