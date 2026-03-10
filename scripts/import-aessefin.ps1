param(
    [string]$DumpPath = ".\aessefin.sql",
    [string]$EnvPath = ".\.env",
    [string]$MySqlExe = "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Get-EnvValue {
    param(
        [string]$Content,
        [string]$Key
    )

    $match = [regex]::Match($Content, "(?m)^$([regex]::Escape($Key))=(.*)$")
    if (-not $match.Success) {
        return $null
    }

    $value = $match.Groups[1].Value.Trim()
    if (
        ($value.StartsWith("'") -and $value.EndsWith("'")) -or
        ($value.StartsWith('"') -and $value.EndsWith('"'))
    ) {
        return $value.Substring(1, $value.Length - 2)
    }

    return $value
}

function New-MySqlArgs {
    param(
        [string]$DbHost,
        [string]$Port,
        [string]$Username,
        [string]$Password,
        [string[]]$ExtraArgs = @()
    )

    $args = @("--protocol=TCP", "-h", $DbHost, "-P", $Port, "-u", $Username)
    if ($Password) {
        $args += "-p$Password"
    }

    return $args + $ExtraArgs
}

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$resolvedDumpPath = if ([System.IO.Path]::IsPathRooted($DumpPath)) {
    $DumpPath
} else {
    Join-Path $repoRoot $DumpPath
}
$resolvedEnvPath = if ([System.IO.Path]::IsPathRooted($EnvPath)) {
    $EnvPath
} else {
    Join-Path $repoRoot $EnvPath
}

if (-not (Test-Path $resolvedDumpPath)) {
    throw "SQL dump not found at '$resolvedDumpPath'. Put aessefin.sql in the project root or pass -DumpPath."
}

if (-not (Test-Path $resolvedEnvPath)) {
    throw ".env file not found at '$resolvedEnvPath'."
}

if (-not (Test-Path $MySqlExe)) {
    throw "mysql.exe not found at '$MySqlExe'. Pass -MySqlExe with the correct path."
}

$envContent = Get-Content $resolvedEnvPath -Raw
$dbHost = Get-EnvValue -Content $envContent -Key "DB_HOST"
$dbPort = Get-EnvValue -Content $envContent -Key "DB_PORT"
$dbName = Get-EnvValue -Content $envContent -Key "DB_DATABASE"
$dbUser = Get-EnvValue -Content $envContent -Key "DB_USERNAME"
$dbPassword = Get-EnvValue -Content $envContent -Key "DB_PASSWORD"

if (-not $dbHost) { $dbHost = "127.0.0.1" }
if (-not $dbPort) { $dbPort = "3306" }

if (-not $dbName -or -not $dbUser) {
    throw "Missing DB_DATABASE or DB_USERNAME in '$resolvedEnvPath'."
}

$adminArgs = New-MySqlArgs -DbHost $dbHost -Port $dbPort -Username $dbUser -Password $dbPassword -ExtraArgs @(
    "-e",
    "DROP DATABASE IF EXISTS ``$dbName``; CREATE DATABASE ``$dbName`` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
)

Write-Host "Recreating local database '$dbName' on ${dbHost}:$dbPort..."
& $MySqlExe @adminArgs
if ($LASTEXITCODE -ne 0) {
    throw "Failed to recreate database '$dbName'."
}

$importArgs = New-MySqlArgs -DbHost $dbHost -Port $dbPort -Username $dbUser -Password $dbPassword -ExtraArgs @($dbName)
$argString = ($importArgs | ForEach-Object {
    if ($_ -match '[\s"]') {
        '"' + ($_ -replace '"', '\"') + '"'
    } else {
        $_
    }
}) -join " "

$quotedMySqlExe = '"' + $MySqlExe + '"'
$quotedDumpPath = '"' + $resolvedDumpPath + '"'

Write-Host "Importing '$resolvedDumpPath' into '$dbName'..."
cmd.exe /c "$quotedMySqlExe $argString < $quotedDumpPath"
if ($LASTEXITCODE -ne 0) {
    throw "Import failed."
}

Write-Host "Database import completed successfully."
