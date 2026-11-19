# 把 demo-mall 的 sql/seed 部署到本机 sdss 种子根（不进入造数插件包）。
# 默认目标：%ProgramData%\sdss\seed ；可用 SDSS_SEED_ROOT 覆盖。
$ErrorActionPreference = "Stop"
$Src = Split-Path -Parent $MyInvocation.MyCommand.Path
$Dest = if ($env:SDSS_SEED_ROOT) { $env:SDSS_SEED_ROOT } else { Join-Path $env:ProgramData "sdss\seed" }
if (-not (Test-Path (Join-Path $Src "scenarios\manifest.json"))) {
    Write-Error "missing scenarios/manifest.json under $Src"
}
New-Item -ItemType Directory -Force -Path $Dest | Out-Null
Copy-Item -Recurse -Force (Join-Path $Src "*") $Dest
Write-Host "Deployed seed tree -> $Dest"
Write-Host "Ensure scenarios/manifest.json has baseline[]; then: sdss seed.list --config ..."
