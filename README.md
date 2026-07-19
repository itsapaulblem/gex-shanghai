
  # Shanghainese Marriage Market Website

  This is a code bundle for Shanghainese Marriage Market Website. The original project is available at https://www.figma.com/design/2wmtlaeNdoZDN6Au5uWc1H/Shanghainese-Marriage-Market-Website.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run api` in one terminal to start the local backend on port 3001.

  Run `npm run dev` in a second terminal to start the Vite frontend.

  The site is Chinese-first, and the UI includes an English translation toggle.

  ## Deploy With Docker + AWS Elastic Beanstalk

  This project can be deployed as a single Docker container. The Node server serves both the built frontend (`dist/`) and API routes.

  ### Prerequisites

  - AWS account
  - Elastic Beanstalk CLI installed (`eb --version`)
  - AWS CLI configured (`aws configure`)
  - Docker Desktop running locally

  ### Password Reset Email Setup

  The forgot-password flow configured. Set these environment variables before running the server or deploying:

  ```bash
  SMTP_HOST=smtp.your-provider.com
  SMTP_PORT=587
  SMTP_SECURE=false
  SMTP_USER=your-smtp-user
  SMTP_PASS=your-smtp-password
  SMTP_FROM="Gex Shanghai <no-reply@yourdomain.com>"
  APP_BASE_URL=https://your-deployed-site-url
  ```

  If SMTP is not configured, the server logs the reset link to the console instead of sending the email.

  ### 1) Test Container Locally

  Build and run:

  ```bash
  docker build -t gex-shanghai .
  docker run --rm -p 8080:8080 gex-shanghai
  ```

  Open `http://localhost:8080`.

  ### 2) Initialize Elastic Beanstalk (one time)

  ```bash
  eb init gex-shanghai --platform "Docker running on 64bit Amazon Linux 2023" --region us-east-1
  ```

  You can change region if needed.

  ### 3) Create Environment (one time)

  ```bash
  eb create gex-shanghai-prod --single --instance_type t3.micro
  eb setenv NODE_ENV=production
  ```

  `--single` uses one instance and is cheaper for school projects.

  ### 4) Deploy Updates

  ```bash
  eb deploy gex-shanghai-prod
  ```

  ### 5) Get The Public Link

  ```bash
  eb status gex-shanghai-prod
  eb open gex-shanghai-prod
  ```

  The environment URL shown by `eb status` is the link you can give your teacher.
  