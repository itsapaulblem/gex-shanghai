
# Shanghai People's Park Marriage Market Website

This website is an online extension of the Shanghai People's Park marriage market. It is designed for parents and families to create a child profile, browse other profiles, send connection requests, and chat after both sides agree.

## Live Website

- Production link: http://gex-shanghai-prod.eba-jd5upeub.us-east-1.elasticbeanstalk.com/

## Who This Is For

- Parents or family members helping a child look for a match.
- Users who want a Chinese-first interface with an English toggle.
- Users who want profile-based matching, approval-based connections, and private chat after approval.

## Main Features

- Account registration and sign in.
- Child profile creation and editing.
- Profile browsing with filters and keyword search.
- Incoming and outgoing connection request management.
- Private chat for approved connections.

## Quick Start

1. Open the live website.
2. Choose your interface language from the top area.
3. Register a new account or sign in to an existing account.
4. Complete the child profile.
5. Start browsing and sending connection requests.

## Account Registration

1. Open the sign-in page.
2. Switch to the registration flow.
3. Enter your email address.
4. Enter a password that meets the password rules shown in the app.
5. Create the account and continue into the app.

## Sign In

1. Open the website.
2. Enter your email and password.
3. Submit the form.

If your account already has a child profile, you will go into the main browsing flow. If not, the app sends you to profile setup first.

## Complete The Child Profile First

New users must complete the child profile before they can use locked sections like Browse or My Connections.

1. Open My Profile.
2. Fill in the required fields across all setup steps.
3. Save or submit the profile.

The profile asks for information such as:

- Basic details.
- Education and work information.
- Housing and car status.
- Personality, hobbies, and partner preferences.

## Profile Rules And Validation

- Required fields must be filled in before submission.
- Height must contain numbers only.
- Weight must contain numbers only.
- Invalid input triggers an error message before the profile is submitted.

## Browse Profiles

After the child profile is complete, you can browse other profiles.

1. Open Browse.
2. Use the keyword search box to search by items such as age, city, industry, school, or hukou.
3. Use the filters to narrow the list.
4. Open any profile card to see more detail.

## Send A Connection Request

1. Open a profile from the browse page.
2. Click the connection request button.
3. Wait for the other side to approve or reject it.

You can also cancel a pending request before it is approved.

## Manage Connections

Use My Connections to track all requests.

- Incoming: Requests received from other users.
- Outgoing: Requests you sent.
- Connected: Approved matches.

From this page you can:

- Approve a request.
- Reject a request.
- Cancel a request you sent.
- Remove an approved connection.

## Private Chat

Private chat becomes available only after a connection is approved.

1. Open My Connections.
2. Go to the Connected section.
3. Open the chat for that connection.
4. Send text messages or supported image attachments.

## Helpful Usage Notes

- Keep the child profile accurate and up to date.
- Complete the profile carefully because it controls access to the rest of the app.
- Use respectful language when chatting with other families.
- If a login attempt fails, recheck the email and password first.

## Local Development

1. Run `npm i`.
2. Run `npm run api` to start the backend.
3. Run `npm run dev` to start the frontend.
4. Open the local Vite URL shown in the terminal.

## Deployment

This project is deployed as a single Node server that serves both the API and the built frontend bundle. Production requires PostgreSQL so application data survives Elastic Beanstalk instance replacements and deployments. Local development and automated tests continue to use `.data/gex-shanghai.json` unless PostgreSQL is explicitly configured.

### Production database

Create a PostgreSQL database in Amazon RDS, preferably outside the Elastic Beanstalk environment lifecycle. Allow the Elastic Beanstalk instance security group to connect to port 5432, then configure either:

- `DATABASE_URL` with a PostgreSQL connection string; or
- `RDS_HOSTNAME`, `RDS_PORT`, `RDS_DB_NAME`, `RDS_USERNAME`, and `RDS_PASSWORD`.

RDS connections use TLS with certificate verification against the official AWS regional RDS CA bundle included during the Docker build.

The server creates its persistence table on first startup. It refuses to start with file storage when `NODE_ENV=production`, preventing an accidental non-durable deployment. `/api/health` reports the active storage backend.

To deploy updates to AWS Elastic Beanstalk:

1. Run `npm run build`.
2. Configure the RDS environment properties in Elastic Beanstalk.
3. Run `eb deploy gex-shanghai-prod`.
4. Run `eb status gex-shanghai-prod` to confirm the deployment.

### Synthetic Chinese demonstration data

The deterministic seed creates 300 fictional profiles, 650 connections, and 3,600 Chinese chat messages. All generated records are marked `synthetic`, use `example.com` addresses, and are safe to regenerate. Re-running the seed replaces only IDs beginning with `demo_` and preserves genuine accounts.

For local development:

```powershell
npm run seed:demo
```

For the configured Elastic Beanstalk environment, after deploying the PostgreSQL-backed version:

```powershell
.\seed-eb.ps1
```

The remote script enables seeding for one environment update and disables it afterward. The demonstration login is `demo001@example.com` with password `Demo!2026`. Never use that shared password for real accounts.
  
