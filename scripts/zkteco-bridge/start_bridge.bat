@echo off
title YWCA K60 Attendance Bridge
echo ============================================================
echo   YWCA Nursery School - ZKTeco K60 Biometric Bridge Daemon
echo ============================================================
cd /d "%~dp0"

where node >nul 2>nul
if %errorlevel% neq 0 (
  echo [ERROR] Node.js is not installed or not in PATH!
  echo Please install Node.js v18 or v20 LTS (64-bit).
  pause
  exit /b 1
)

echo Starting bridge daemon...
node bridge.js
if %errorlevel% neq 0 (
  echo [ERROR] Bridge process exited with code %errorlevel%
  pause
)
