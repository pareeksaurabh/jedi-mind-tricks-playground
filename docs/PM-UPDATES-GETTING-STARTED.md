# PM Updates — Getting Started

Platforms weekly PM updates: Jira boards (Identity, Integrity, Explore, DevEx, Quality Engg, Comms), Cursor commands, and Slack posting.

## 1. Clone the repo

```bash
git clone https://github.com/pareeksaurabh/jedi-mind-tricks-playground.git
cd jedi-mind-tricks-playground
```

Or if you already have it:

```bash
git pull origin main
```

## 2. Configure credentials

### Option A: Post to Slack via script

1. Go to `scripts/pm-update-scheduled/`
2. Copy the example env: `cp .env.example .env`
3. Edit `.env` and add:
   - `JIRA_URL` — `https://gofundme.atlassian.net`
   - `JIRA_USERNAME` — Your Atlassian email
   - `JIRA_API_TOKEN` — Atlassian API token (from [id.atlassian.com](https://id.atlassian.com/manage-profile/security/api-tokens))
   - `SLACK_BOT_TOKEN` — Bot token (xoxb-...) from [api.slack.com](https://api.slack.com/apps) → Your app → OAuth & Permissions
   - `ANTHROPIC_API_KEY` — (optional for script; only if using full `run.js` with Claude)

4. Install dependencies: `cd scripts/pm-update-scheduled && npm install`

### Option B: Use Cursor commands (no Slack posting until bot is set up)

1. Copy `.cursor/mcp.json.example` to `.cursor/mcp.json` (if exists)
2. Add your Jira credentials to the `mcp-atlassian` section
3. For Slack: add `SLACK_BOT_TOKEN`, `SLACK_TEAM_ID`, `SLACK_CHANNEL_IDS` to the `slack` section — see `docs/handbook/slack-mcp-setup.md`

## 3. Run a PM update

### Via script (from project root)

```bash
./scripts/post-pm-update.sh
```

Or fetch Jira only (no Slack):

```bash
cd scripts/pm-update-scheduled
node run.js --jira-only
```

### Via Cursor

Use the pm-update commands: `/pm-update`, `/pm-update-executive`, `/pm-update-detailed`, `/pm-update-slack`.

## 4. Slack bot (for posting)

You need a **Bot User OAuth Token** (xoxb-...), not an App-level token (xapp-).

1. [api.slack.com/apps](https://api.slack.com/apps) → Create New App → From scratch
2. Add scope: `chat:write`
3. **Install to Workspace** (required — token only appears after install)
4. Copy Bot User OAuth Token
5. Invite app to `#team_platforms_pm`: `/invite @YourAppName`
6. Add token to `.env` or `.cursor/mcp.json`

## Boards

| Team | Board ID |
|------|----------|
| Identity | 239 |
| Integrity | 404 |
| Explore | 319 |
| DevEx | 916 |
| Quality Engg | 895 |
| Comms | 349 |

## More

- **Agent config** (board config, templates, workflow): [`.cursor/agents/pm-updates.md`](../.cursor/agents/pm-updates.md) — used by Cursor pm-update commands
- **Scheduled run (GitHub Actions)**: `.github/workflows/pm-update-weekly.yml` — add secrets in repo Settings
- **Full docs**: `docs/handbook/slack-mcp-setup.md`, `docs/handbook/cursor-mcp-integrations.md`
