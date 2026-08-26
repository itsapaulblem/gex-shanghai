param(
  [Parameter(Mandatory = $false)]
  [string]$EnvName = "gex-shanghai-prod"
)

$ErrorActionPreference = "Stop"

Write-Host "Checking the Elastic Beanstalk environment..."
$environment = eb status $EnvName 2>&1 | Out-String
if ($LASTEXITCODE -ne 0) {
  throw "Could not access Elastic Beanstalk environment '$EnvName'. Authenticate the AWS and EB CLIs first."
}

Write-Host "Enabling one-time production demo seeding..."
eb setenv ALLOW_DEMO_SEED=true SEED_DEMO_DATA=true -e $EnvName
if ($LASTEXITCODE -ne 0) {
  throw "Elastic Beanstalk could not enable the demo seed operation."
}

try {
  Write-Host "Waiting for the environment update and checking health..."
  eb health $EnvName
} finally {
  Write-Host "Disabling demo seeding so future restarts do not reset synthetic records..."
  eb setenv ALLOW_DEMO_SEED=false SEED_DEMO_DATA=false -e $EnvName
}

Write-Host "Demo seed operation finished. Confirm counts on the public metrics endpoint and sign in with demo001@example.com."
