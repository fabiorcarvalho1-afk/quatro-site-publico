$project = Split-Path -Parent $MyInvocation.MyCommand.Path
$port = 8087
$url = "http://127.0.0.1:$port/index.html"

try {
  $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 3
  if ($response.StatusCode -eq 200) {
    Write-Host "Site ja esta ativo em $url"
    return
  }
} catch {
  # O servidor ainda nao respondeu; tenta iniciar abaixo.
}

$activeProcess = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue |
  Where-Object { $_.State -eq "Listen" } |
  Select-Object -First 1

if ($activeProcess) {
  Write-Host "A porta $port ja esta em uso. Abra $url ou finalize o processo antes de reiniciar."
  return
}

Start-Process -FilePath "node" -ArgumentList "local-server.cjs" -WorkingDirectory $project -WindowStyle Hidden
Start-Sleep -Seconds 2

try {
  $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 5
  if ($response.StatusCode -eq 200) {
    Write-Host "Site iniciado em $url"
    return
  }
} catch {
  Write-Error "Nao foi possivel iniciar o site na porta $port."
}
