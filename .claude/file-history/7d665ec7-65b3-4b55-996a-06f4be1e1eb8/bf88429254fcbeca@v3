# Windows 环境初始化（需以管理员身份运行，或开启开发者模式）
# 用法: PowerShell -ExecutionPolicy Bypass -File scripts\setup.ps1

$RepoDir = (Resolve-Path "$PSScriptRoot\..").Path
Write-Host "📁 仓库路径: $RepoDir"

function New-Link {
    param($Path, $Target)
    if (Test-Path $Path) { Remove-Item $Path -Force -Recurse }
    New-Item -ItemType SymbolicLink -Path $Path -Target $Target | Out-Null
}

# Claude：整个 .claude 目录软链到 repo
$ClaudeSrc = "$RepoDir\.claude"
$ClaudeDst = "$env:USERPROFILE\.claude"
if ((Test-Path $ClaudeDst) -and -not (Get-Item $ClaudeDst).LinkType) {
    Write-Host "⚠️  ~/.claude 是真实目录，请手动将内容移入 $ClaudeSrc 后再运行"
    exit 1
}
New-Link $ClaudeDst $ClaudeSrc
Write-Host "✅ Claude 软链完成 (~\.claude -> repo\.claude)"

# repo\.claude\skills 软链到 repo\skills
New-Link "$ClaudeSrc\skills" "$RepoDir\skills"
Write-Host "✅ repo\.claude\skills 软链完成"

# Codex
$CodexDir = "$env:USERPROFILE\.codex"
New-Item -ItemType Directory -Force -Path $CodexDir | Out-Null
New-Link "$CodexDir\skills" "$RepoDir\skills"
Write-Host "✅ Codex 软链完成"

Write-Host "🎉 setup 完成"
