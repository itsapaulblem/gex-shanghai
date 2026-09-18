# gex-shanghai session summary — 2026-09-08 to 2026-09-18

Reconstructed summary of this Claude Code conversation (not a raw log export — no tool exposes the underlying session file directly).

## 1. GitHub Pages CI failure
- User reported a failing `actions/jekyll-build-pages@v1` run: `Error: No such file or directory @ dir_chdir0 - /github/workspace/docs`.
- Root cause: commit `de2ca746` ("Undo github page") deleted the `docs/` folder, but the repo's GitHub Pages settings still pointed to `/docs` with Jekyll build enabled.
- No `.github/workflows/*.yml` existed — this was GitHub's built-in Pages deployment triggered by repo settings, not a workflow file.
- User chose to disable Pages in repo Settings rather than restore `docs/`. Advised manual steps (Settings → Pages → Source → None) since repo settings aren't changeable via CLI.

## 2. Initial code review ("is this website build properly, lacking features, room for improvement")
- Confirmed `npm run build` initially failed with a Vite "HTML proxy module not found" error — turned out to be a stale `node_modules/.vite` cache, not a real bug. Clearing it fixed the build.
- `npm test` passed all 8 existing tests.
- Findings:
  - Password hashing is plain SHA-256 (with salt), not bcrypt/scrypt/argon2 — fast to brute-force offline.
  - Sessions never expired.
  - Auth token could travel via URL query string as a fallback to the Authorization header.
  - No login rate-limiting (OTP had a 5-attempt cap; login didn't).
  - Frontend is one 2,945-line file (`src/app/MarketMvpApp.tsx`).
  - JS bundle exceeds 500KB after minification.
  - No CI pipeline (`.github/workflows` didn't exist).
  - Test coverage was thin (8 tests, all backend, zero frontend tests).
  - Mailer (`server/services/mailer.js`) silently falls back to console.log when Resend/SMTP aren't configured, and callers ignore the return value — looks like success from outside.
  - `deploy-eb.ps1` didn't run tests before building/deploying.

## 3. Repo cleanup ("remove stale/unused files, clean up, update README")
- Untracked `dist/` (build output) from git, added `dist/` to `.gitignore` — Dockerfile/README already expected `npm run build` to regenerate it.
- Removed `pnpm-workspace.yaml` (stale template scaffold; project uses npm exclusively).
- Deleted `assignment1/` entirely per explicit user instruction (unrelated Hadoop/MapReduce coursework, untracked).
- Deleted local caches: `.npm-cache/` (9MB) and 5 of 7 old `.elasticbeanstalk/app_versions/*.zip` files (kept the 2 most recent for rollback).
- Updated `README.md` to note `dist/` is git-ignored and built on demand.
- Committed as `0a4fe47a` — "Clean up repo: stop tracking build output and unused pnpm scaffold".

## 4. EB deploy commands
- Provided: `npm run build` → `eb deploy gex-shanghai-prod` → `eb status gex-shanghai-prod`, per README.

## 5. Further improvement review
- Flagged: no CI, thin test coverage, mailer silent-fallback gap, `deploy-eb.ps1` missing a test step before build. Reiterated the earlier security/structural items as still open.

## 6. Implementation round 1
- **CI pipeline**: added `.github/workflows/ci.yml` (npm ci → npm test → npm run build on push/PR to main).
- **Session expiry**: `server/services/auth.js` — sessions now carry `expiresAt` (30-day TTL), `resolveSession` rejects/evicts expired sessions with sliding renewal on use, `login` reuses valid sessions or issues fresh ones.
- **Test coverage added**: session expiry test in `test/regressions.test.js`; new `test/mailer.test.js` (documents the log-fallback behavior); new `test/profile-search.test.js` (4 tests: empty query, Chinese→English translation, multi-token AND matching, numeric field search).
- **Found while writing tests**: a real bug in `shared/profile-search.js` — the search corpus unconditionally appended the literal strings `city`, `hukou`, `school`, `industry`, `education`, `income`, `height`, so searching those English words matched every profile regardless of content.
- **`deploy-eb.ps1`**: added `npm test` before `npm run build`, aborting deployment on test failure.

## 7. "Find more feature bugs, especially search"
- Investigated `shared/profile-search.js`, `server/services/profiles.js`, and the frontend's parallel filtering logic in `MarketMvpApp.tsx`.
- Found:
  1. (already known) corpus pollution bug.
  2. **Dataset-narrowing bug**: `refreshBrowse` sent `search`/`gender` to the server on sort-change and manual-refresh, permanently replacing the full profile list with a server-narrowed subset — clearing filters afterward wouldn't restore excluded profiles until a full reload.
  3. Non-numeric income (e.g. "面议") silently excludes profiles from salary-filtered results — flagged as a design gap, not clearly a bug.
  4. `getProfile` (`server/services/profiles.js`) returned the raw, unsanitized, uncloned profile object (bypassing `toProfileResponse`, skipping `presence` decoration) when the viewer had no profile of their own.
  5. Corrected an earlier claim: chat image uploads DO have a 2.5MB size cap (`chat.js`) — retracted the "no size cap" finding.
  6. Reviewed `connections.js` and `chat.js` fully — no further bugs found there.

## 8. "Fix all the bugs... find all feature bugs and fix them all"
- Fixed:
  1. `shared/profile-search.js` — removed the literal field-name pollution from the corpus.
  2. `server/services/profiles.js` — `getProfile` now always returns `toProfileResponse(...)`, matching `listProfiles`'s access model.
  3. `src/app/MarketMvpApp.tsx` — `refreshBrowse` now only sends `sort` to the server; all other filters stay client-side against the full list, so the dataset never silently shrinks.
- Added regression tests for both fixes (extended `test/profile-search.test.js` and `test/regressions.test.js`).
- Verified: full build + all 16 tests passing.

## 9. Staggered commits (per explicit request)
Split the accumulated changes into 7 focused commits instead of one:
1. `e028e345` — Add CI pipeline
2. `bd941e65` — Run test suite before building in deploy-eb.ps1
3. `7291e1b5` — Make sessions expire after 30 days
4. `6257dbe9` — Add test coverage for mailer's silent log fallback
5. `1173ab61` — Fix two search bugs: corpus pollution and dataset narrowing on refresh
6. `4b2e0a21` — Fix getProfile returning a raw, unsanitized profile object
7. `8329ff44` — Add regression tests for session expiry and getProfile sanitization

