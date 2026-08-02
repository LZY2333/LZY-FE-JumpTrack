[CmdletBinding()]
param(
  [string]$ProjectPath = '',
  [string]$OutputPath = ''
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Get-Command git -ErrorAction Stop | Out-Null

if ([string]::IsNullOrWhiteSpace($ProjectPath)) {
  $ProjectPath = Join-Path $PSScriptRoot '..'
}

$projectRoot = (Resolve-Path -LiteralPath $ProjectPath -ErrorAction Stop).Path
$insideWorkTree = & git -C $projectRoot rev-parse --is-inside-work-tree 2>&1
if ($LASTEXITCODE -ne 0 -or $insideWorkTree.Trim() -ne 'true') {
  throw "Project path is not inside a Git work tree: $projectRoot"
}
$gitCommonDirectory = (& git -C $projectRoot rev-parse --git-common-dir 2>&1).Trim()
if ($LASTEXITCODE -ne 0) {
  throw 'Unable to locate the Git object database.'
}
if (-not [IO.Path]::IsPathRooted($gitCommonDirectory)) {
  $gitCommonDirectory = [IO.Path]::GetFullPath((Join-Path $projectRoot $gitCommonDirectory))
}
$gitObjectsPath = Join-Path $gitCommonDirectory 'objects'

if ([string]::IsNullOrWhiteSpace($OutputPath)) {
  $desktopPath = [Environment]::GetFolderPath([Environment+SpecialFolder]::Desktop)
  $timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
  $OutputPath = Join-Path $desktopPath "react-seed3-changes-$timestamp.patch"
} elseif (-not [IO.Path]::IsPathRooted($OutputPath)) {
  $OutputPath = Join-Path (Get-Location).Path $OutputPath
}

$patchPath = [IO.Path]::GetFullPath($OutputPath)
$projectBoundary = [IO.Path]::GetFullPath($projectRoot).TrimEnd('\') + '\'
if ($patchPath.StartsWith($projectBoundary, [StringComparison]::OrdinalIgnoreCase)) {
  throw 'OutputPath must be outside the project directory so the patch cannot include itself.'
}
if (Test-Path -LiteralPath $patchPath) {
  throw "Patch file already exists: $patchPath"
}

$patchDirectory = Split-Path -Parent $patchPath
if (-not (Test-Path -LiteralPath $patchDirectory)) {
  New-Item -ItemType Directory -Path $patchDirectory -Force | Out-Null
}

# Build the patch with an isolated temporary index. The real staging area and object database are never changed.
$temporaryIndexPath = Join-Path ([IO.Path]::GetTempPath()) ("react-seed3-index-$([guid]::NewGuid().ToString('N'))")
$temporaryObjectsPath = Join-Path ([IO.Path]::GetTempPath()) ("react-seed3-objects-$([guid]::NewGuid().ToString('N'))")
$previousIndexPath = [Environment]::GetEnvironmentVariable('GIT_INDEX_FILE', 'Process')
$previousObjectPath = [Environment]::GetEnvironmentVariable('GIT_OBJECT_DIRECTORY', 'Process')
$previousAlternateObjectPaths = [Environment]::GetEnvironmentVariable('GIT_ALTERNATE_OBJECT_DIRECTORIES', 'Process')

try {
  New-Item -ItemType Directory -Path $temporaryObjectsPath | Out-Null
  $env:GIT_INDEX_FILE = $temporaryIndexPath
  $env:GIT_OBJECT_DIRECTORY = $temporaryObjectsPath
  $alternateObjectPaths = @($gitObjectsPath)
  if (-not [string]::IsNullOrWhiteSpace($previousObjectPath)) {
    $alternateObjectPaths += $previousObjectPath
  }
  if (-not [string]::IsNullOrWhiteSpace($previousAlternateObjectPaths)) {
    $alternateObjectPaths += $previousAlternateObjectPaths
  }
  $env:GIT_ALTERNATE_OBJECT_DIRECTORIES = $alternateObjectPaths -join [IO.Path]::PathSeparator

  & git -C $projectRoot read-tree HEAD
  if ($LASTEXITCODE -ne 0) {
    throw 'Unable to initialize the temporary Git index from HEAD.'
  }

  # Intent-to-add makes untracked text files visible to git diff without writing their content to .git/objects.
  & git -C $projectRoot add --intent-to-add -- .
  if ($LASTEXITCODE -ne 0) {
    throw 'Unable to collect local project changes.'
  }

  & git -C $projectRoot diff --quiet HEAD -- .
  $diffExitCode = $LASTEXITCODE
  if ($diffExitCode -eq 0) {
    throw 'No local changes were found in the project.'
  }
  if ($diffExitCode -ne 1) {
    throw 'Unable to inspect local project changes.'
  }

  $outputArgument = "--output=$patchPath"
  & git -C $projectRoot diff --relative $outputArgument HEAD -- .
  if ($LASTEXITCODE -ne 0) {
    throw 'Unable to generate the patch file.'
  }

  if (-not (Test-Path -LiteralPath $patchPath) -or (Get-Item -LiteralPath $patchPath).Length -eq 0) {
    throw 'Git produced an empty patch file.'
  }

  Write-Host 'Patch contents:'
  & git -C $projectRoot diff --relative --stat HEAD -- .
  Write-Host "Patch created: $patchPath"
} finally {
  if ($null -eq $previousIndexPath) {
    Remove-Item Env:GIT_INDEX_FILE -ErrorAction SilentlyContinue
  } else {
    $env:GIT_INDEX_FILE = $previousIndexPath
  }
  if ($null -eq $previousObjectPath) {
    Remove-Item Env:GIT_OBJECT_DIRECTORY -ErrorAction SilentlyContinue
  } else {
    $env:GIT_OBJECT_DIRECTORY = $previousObjectPath
  }
  if ($null -eq $previousAlternateObjectPaths) {
    Remove-Item Env:GIT_ALTERNATE_OBJECT_DIRECTORIES -ErrorAction SilentlyContinue
  } else {
    $env:GIT_ALTERNATE_OBJECT_DIRECTORIES = $previousAlternateObjectPaths
  }

  if (Test-Path -LiteralPath $temporaryIndexPath) {
    Remove-Item -LiteralPath $temporaryIndexPath -Force
  }
  $temporaryLockPath = "$temporaryIndexPath.lock"
  if (Test-Path -LiteralPath $temporaryLockPath) {
    Remove-Item -LiteralPath $temporaryLockPath -Force
  }
  if (Test-Path -LiteralPath $temporaryObjectsPath) {
    Remove-Item -LiteralPath $temporaryObjectsPath -Recurse -Force
  }
}
