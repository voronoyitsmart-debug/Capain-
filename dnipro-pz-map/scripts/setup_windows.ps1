# Dnipro for Project Zomboid B42 - one-time setup on Windows.
#
#   powershell -ExecutionPolicy Bypass -File dnipro-pz-map\scripts\setup_windows.ps1
#
# 1. downloads KnoxMap at the exact version the Dnipro changes were made against,
# 2. lays the Dnipro changes over it (Ukrainian architecture, data reader fix),
# 3. fetches knoxlots.exe (the fast map compiler with no size limit) from KnoxMap's release,
# 4. turns KnoxMap's self-update off (it would overwrite the Dnipro changes),
# 5. runs KnoxMap's own Setup.bat: Python, PZ Mapping Tools, tiles from YOUR copy of the game.
param(
    [string]$KnoxDir = "$env:USERPROFILE\KnoxMap-Dnipro"
)
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$Here = Split-Path -Parent $MyInvocation.MyCommand.Path
$Pack = Split-Path -Parent $Here
$Commit = (Get-Content "$Pack\knoxmap-overlay\KNOXMAP_COMMIT.txt" -Raw).Trim()
Write-Host "KnoxMap folder : $KnoxDir"
Write-Host "KnoxMap commit : $Commit"

# 1. KnoxMap source at the pinned commit
if (-not (Test-Path "$KnoxDir\knoxmap.py")) {
    $zip = Join-Path $env:TEMP "knoxmap-$Commit.zip"
    $tmp = Join-Path $env:TEMP "knoxmap-src-$Commit"
    Write-Host "Downloading KnoxMap ..."
    Invoke-WebRequest "https://codeload.github.com/spytheeuclidean-a11y/knoxmap/zip/$Commit" -OutFile $zip
    if (Test-Path $tmp) { Remove-Item $tmp -Recurse -Force }
    Expand-Archive $zip -DestinationPath $tmp -Force
    $src = Get-ChildItem $tmp -Directory | Select-Object -First 1
    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $KnoxDir) | Out-Null
    Move-Item $src.FullName $KnoxDir
}

# 2. the Dnipro changes
Write-Host "Applying the Dnipro changes ..."
Copy-Item "$Pack\knoxmap-overlay\files\*" $KnoxDir -Recurse -Force

# 3. knoxlots.exe (and knoxroute.exe) from the newest KnoxMap release for Windows
if (-not (Test-Path "$KnoxDir\knoxlots.exe")) {
    Write-Host "Downloading knoxlots.exe from KnoxMap's release ..."
    try {
        $rel = Invoke-RestMethod "https://api.github.com/repos/spytheeuclidean-a11y/knoxmap/releases/latest" `
            -Headers @{ 'User-Agent' = 'dnipro-pz-map-setup' }
        $asset = $rel.assets | Where-Object { $_.name -like '*windows.zip' } | Select-Object -First 1
        $rzip = Join-Path $env:TEMP $asset.name
        Invoke-WebRequest $asset.browser_download_url -OutFile $rzip
        Add-Type -AssemblyName System.IO.Compression.FileSystem
        $z = [IO.Compression.ZipFile]::OpenRead($rzip)
        foreach ($e in $z.Entries) {
            if ($e.Name -in @('knoxlots.exe', 'knoxroute.exe')) {
                [IO.Compression.ZipFileExtensions]::ExtractToFile($e, (Join-Path $KnoxDir $e.Name), $true)
                Write-Host "  got $($e.Name) ($($rel.tag_name))"
            }
        }
        $z.Dispose()
    } catch {
        Write-Warning "Could not fetch knoxlots.exe: $_"
        Write-Warning "Download KnoxMap-...-windows.zip from https://github.com/spytheeuclidean-a11y/knoxmap/releases and copy knoxlots.exe into $KnoxDir"
    }
}

# 4. settings: no self-update, read the map data from this pack
$cfgPath = "$KnoxDir\knoxmap_config.json"
$cfg = @{}
if (Test-Path $cfgPath) {
    $old = Get-Content $cfgPath -Raw | ConvertFrom-Json
    $old.PSObject.Properties | ForEach-Object { $cfg[$_.Name] = $_.Value }
}
$cfg['auto_update'] = $false
$cfg['pbf_file'] = (Resolve-Path "$Pack\data\dnipro_area_fixed.osm.pbf").Path
($cfg | ConvertTo-Json) | Set-Content -Encoding UTF8 $cfgPath

# 5. KnoxMap's own setup (finds Project Zomboid, extracts tiles from your game)
Write-Host "Running KnoxMap Setup.bat ..."
Push-Location $KnoxDir
try { & cmd /c "Setup.bat" } finally { Pop-Location }
Write-Host ""
Write-Host "Done. Now build a map with:  dnipro-pz-map\scripts\make_map.bat core"
