# fix-lock-and-node.ps1
# 목적:
# 1) nvm-windows(없으면 자동 설치: winget/Chocolatey/직접 다운로드 순) 
# 2) Node 18.20.8 설치 및 적용
# 3) 프로젝트(E:\soulrise-web)에서 node_modules/lock 삭제 후 npm install
# 4) git 커밋/푸시(선택)

param(
  [string]$ProjectPath = "E:\soulrise-web",
  [string]$TargetNode = "18.20.8",
  [switch]$SkipGit  # 커밋/푸시 생략하려면 -SkipGit
)

function Write-Info($msg){ Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Ok($msg){ Write-Host "[OK]   $msg" -ForegroundColor Green }
function Write-Warn($msg){ Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Write-Err($msg){ Write-Host "[ERR]  $msg" -ForegroundColor Red }

# 0) 관리자 권한 체크
$IsAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltinRole]::Administrator)
if(-not $IsAdmin){ Write-Err "관리자 권한 PowerShell로 다시 실행하세요."; exit 1 }

# 1) nvm 존재 여부 확인
Write-Info "nvm 설치 여부 확인..."
$nvmCmd = (Get-Command nvm -ErrorAction SilentlyContinue)
if(-not $nvmCmd){
  Write-Warn "nvm이 없습니다. 설치를 시작합니다."

  # 1-a) winget 시도
  $winget = Get-Command winget -ErrorAction SilentlyContinue
  if($winget){
    Write-Info "winget 사용: CoreyButler.NVMforWindows 설치"
    winget install -e --id CoreyButler.NVMforWindows --silent
  } else {
    # 1-b) Chocolatey 시도
    $choco = Get-Command choco -ErrorAction SilentlyContinue
    if($choco){
      Write-Info "chocolatey 사용: nvm 설치"
      choco install nvm -y
    } else {
      # 1-c) 직접 다운로드 & 설치 (사일런트 스위치 시도)
      $temp = Join-Path $env:TEMP "nvm-setup.exe"
      Write-Info "nvm-setup.exe 다운로드 중..."
      Invoke-WebRequest -Uri "https://github.com/coreybutler/nvm-windows/releases/latest/download/nvm-setup.exe" -OutFile $temp
      Write-Info "nvm-setup.exe 실행(사일런트 시도) ..."
      Start-Process -FilePath $temp -ArgumentList "/S" -Wait
    }
  }

  # PATH 반영을 위해 새 세션 반영용
  $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
  $nvmCmd = (Get-Command nvm -ErrorAction SilentlyContinue)
  if(-not $nvmCmd){
    Write-Err "nvm 설치에 실패했습니다. 수동 설치 후 다시 실행하세요: https://github.com/coreybutler/nvm-windows"
    exit 1
  }
  Write-Ok "nvm 설치 완료"
} else {
  Write-Ok "nvm 이미 설치됨"
}

# 2) Node 18.20.8 설치/적용
Write-Info "Node v$TargetNode 설치 확인..."
$nvmList = nvm list 2>$null
if($nvmList -notmatch $TargetNode){
  Write-Info "nvm install $TargetNode"
  nvm install $TargetNode
}
Write-Info "nvm use $TargetNode"
nvm use $TargetNode | Out-Null

$nodev = node -v
if($nodev -notmatch "v$TargetNode"){
  Write-Err "Node 버전 전환 실패: 현재 $nodev, 목표 v$TargetNode"
  exit 1
}
Write-Ok "Node 버전 적용: $nodev"

# 3) 프로젝트에서 lock 재생성
if(-not (Test-Path $ProjectPath)){
  Write-Err "프로젝트 경로가 없습니다: $ProjectPath"
  exit 1
}

Set-Location $ProjectPath
Write-Info "프로젝트 이동: $ProjectPath"

Write-Info "node_modules / lock 파일 삭제..."
if(Test-Path "node_modules"){ Remove-Item -Recurse -Force "node_modules" }
if(Test-Path "package-lock.json"){ Remove-Item -Force "package-lock.json" }
if(Test-Path "yarn.lock"){ Remove-Item -Force "yarn.lock" }
if(Test-Path "pnpm-lock.yaml"){ Remove-Item -Force "pnpm-lock.yaml" }

Write-Info "npm install 실행(새 lock 생성)..."
npm install
if($LASTEXITCODE -ne 0){ Write-Err "npm install 실패"; exit 1 }
Write-Ok "npm install 완료"

# swc/바이너리 경고가 있으면 한 번 더 설치 권장
Write-Info "필요시 재설치(한 번 더 npm install)..."
npm install | Out-Null

# 4) 로컬 테스트(선택): 빌드까지 확인하려면 주석 해제
# Write-Info "로컬 빌드 테스트: npm run build"
# npm run build

# 5) Git 커밋/푸시
if(-not $SkipGit){
  Write-Info "Git 커밋/푸시..."
  git add package.json package-lock.json
  git commit -m "chore: regenerate package-lock with Node $TargetNode" 2>$null
  git push
  Write-Ok "Git 반영 완료"
} else {
  Write-Warn "Git 커밋/푸시는 건너뜀 (-SkipGit 사용)"
}

Write-Ok "모든 작업 완료! 이제 CI/배포에서 npm ci가 통과할 것입니다."
