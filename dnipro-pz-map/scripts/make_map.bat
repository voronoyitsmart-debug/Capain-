@echo off
rem Build and install one Dnipro map into %USERPROFILE%\Zomboid\mods
rem   make_map.bat test   - a 3.6 x 3.6 km block of the centre (~10 min)
rem   make_map.bat core   - central Dnipro, both banks, ~9 x 8 km (~1 hour)
rem   make_map.bat full   - everything on the screenshot, ~32 x 47 km (many hours, ~50 GB free disk)
rem Optional second argument: generate | build | compile | install (one step only).
setlocal
set PYTHONUTF8=1
set "PACK=%~dp0.."
if "%KNOXDIR%"=="" set "KNOXDIR=%USERPROFILE%\KnoxMap-Dnipro"
set "WHICH=%~1"
if "%WHICH%"=="" set "WHICH=core"
if /i "%WHICH%"=="test" set "CFG=test_center"
if /i "%WHICH%"=="core" set "CFG=dnipro_core"
if /i "%WHICH%"=="full" set "CFG=dnipro_full"
if "%CFG%"=="" (
  echo Unknown map "%WHICH%". Use test, core or full.
  exit /b 2
)
set "STAGE=%~2"
if "%STAGE%"=="" set "STAGE=all"
"%KNOXDIR%\.venv\Scripts\python.exe" "%PACK%\scripts\run_pipeline.py" "%KNOXDIR%" "%PACK%\configs\%CFG%.json" --stage %STAGE%
if errorlevel 1 (
  echo.
  echo FAILED - see %KNOXDIR%\logs\knoxmap.log
  exit /b 1
)
echo.
echo Done. In Project Zomboid: Mods - enable the Dnipro map, then start a NEW game on it.
