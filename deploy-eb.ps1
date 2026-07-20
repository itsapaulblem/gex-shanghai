param(
  [Parameter(Mandatory = $false)]
  [string]$AppName = "gex-shanghai",

  [Parameter(Mandatory = $false)]
  [string]$EnvName = "gex-shanghai-prod",

  [Parameter(Mandatory = $false)]
  [string]$Region = "us-east-1"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path "Dockerfile")) {
  throw "Dockerfile not found in current directory. Run this script from the project root."
}

if (-not (Test-Path ".ebignore")) {
  Write-Warning ".ebignore not found. EB may package only Git-tracked files and miss untracked deployment files."
}

Write-Host "Checking required CLIs..."
eb --version | Out-Host
aws --version | Out-Host

Write-Host "Building frontend bundle..."
npm run build

Write-Host "Building Docker image locally (sanity check)..."
docker build -t $AppName .

if (-not (Test-Path ".elasticbeanstalk\config.yml")) {
  Write-Host "Initializing Elastic Beanstalk app..."
  eb init $AppName --platform "Docker running on 64bit Amazon Linux 2023" --region $Region
}

$envExists = $false
eb status $EnvName *> $null
if ($LASTEXITCODE -eq 0) {
  $envExists = $true
}

if (-not $envExists) {
  Write-Host "Creating Elastic Beanstalk environment..."
  eb create $EnvName --single --instance_type t3.micro
  eb setenv NODE_ENV=production
}

Write-Host "Deploying latest version..."
eb deploy $EnvName

Write-Host "Environment status and URL:"
eb status $EnvName | Out-Host

Write-Host "Opening deployed app in browser..."
eb open $EnvName
