param(
  [int]$Port = 8765
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$prefix = "http://localhost:$Port/"

function Send-Text($response, $statusCode, $contentType, [string]$text) {
  $bytes = [System.Text.Encoding]::UTF8.GetBytes($text)
  $response.StatusCode = $statusCode
  $response.ContentType = $contentType
  $response.ContentLength64 = $bytes.Length
  $response.OutputStream.Write($bytes, 0, $bytes.Length)
}

function Send-Bytes($response, $statusCode, $contentType, [byte[]]$bytes) {
  $response.StatusCode = $statusCode
  $response.ContentType = $contentType
  $response.ContentLength64 = $bytes.Length
  $response.OutputStream.Write($bytes, 0, $bytes.Length)
}

function Get-ContentType([string]$ext) {
  switch ($ext.ToLower()) {
    ".html" { return "text/html; charset=utf-8" }
    ".css"  { return "text/css; charset=utf-8" }
    ".js"   { return "application/javascript; charset=utf-8" }
    ".json" { return "application/json; charset=utf-8" }
    default { return "application/octet-stream" }
  }
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)
try {
  $listener.Start()
} catch {
  Write-Host "Could not start server on $prefix"
  Write-Host $_.Exception.Message
  Write-Host "Stop the process using port $Port, or run: .\server.ps1 -Port 8766"
  exit 1
}

Write-Host "Open Text server ready at $prefix"
Write-Host "Press Ctrl+C to stop."

while ($listener.IsListening) {
  $context = $listener.GetContext()
  $request = $context.Request
  $response = $context.Response
  $response.Headers["Cache-Control"] = "no-store"

  try {
    $localPath = [Uri]::UnescapeDataString($request.Url.LocalPath)
    $relative = $localPath.TrimStart("/")
    if ([string]::IsNullOrWhiteSpace($relative)) { $relative = "index.html" }
    $fullPath = [IO.Path]::GetFullPath((Join-Path $Root ($relative -replace "/", [IO.Path]::DirectorySeparatorChar)))
    $rootFull = [IO.Path]::GetFullPath($Root)

    if ($fullPath.StartsWith($rootFull, [StringComparison]::OrdinalIgnoreCase) -and (Test-Path $fullPath -PathType Leaf)) {
      $bytes = [IO.File]::ReadAllBytes($fullPath)
      Send-Bytes $response 200 (Get-ContentType ([IO.Path]::GetExtension($fullPath))) $bytes
    } else {
      Send-Text $response 404 "text/plain; charset=utf-8" "Not found"
    }
  } catch {
    try {
      Send-Text $response 500 "text/plain; charset=utf-8" $_.Exception.Message
    } catch {}
  } finally {
    $response.OutputStream.Close()
  }
}
