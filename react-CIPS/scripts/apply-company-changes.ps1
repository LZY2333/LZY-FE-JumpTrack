[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string]$ProjectPath,

  [Parameter(Mandatory = $true)]
  [string]$PatchPath
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Get-Command git -ErrorAction Stop | Out-Null

$projectRoot = (Resolve-Path -LiteralPath $ProjectPath -ErrorAction Stop).Path
$resolvedPatchPath = (Resolve-Path -LiteralPath $PatchPath -ErrorAction Stop).Path
if ((Get-Item -LiteralPath $resolvedPatchPath).Length -eq 0) {
  throw "Patch file is empty: $resolvedPatchPath"
}

$insideWorkTree = & git -C $projectRoot rev-parse --is-inside-work-tree 2>&1
if ($LASTEXITCODE -ne 0 -or $insideWorkTree.Trim() -ne 'true') {
  throw "Project path is not inside a Git work tree: $projectRoot"
}

# Ignore untracked transfer files, but never mix the patch with existing tracked changes.
& git -C $projectRoot diff --quiet HEAD -- .
$diffExitCode = $LASTEXITCODE
if ($diffExitCode -eq 1) {
  throw 'The company project already has tracked changes. Commit or save them before applying the patch.'
}
if ($diffExitCode -ne 0) {
  throw 'Unable to inspect the company project working tree.'
}

Write-Host 'Checking whether the patch matches the company project...'
& git -C $projectRoot apply --check $resolvedPatchPath
if ($LASTEXITCODE -ne 0) {
  throw 'Patch check failed. No files were changed.'
}

& git -C $projectRoot apply $resolvedPatchPath
if ($LASTEXITCODE -ne 0) {
  throw 'Patch application failed.'
}

Write-Host 'Patch applied successfully. Current project changes:'
& git -C $projectRoot status --short -- .
Write-Host 'Review the changes, run the project checks, then commit them in the company repository.'
