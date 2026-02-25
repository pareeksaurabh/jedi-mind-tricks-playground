# PM Update Scheduled

Scheduled Platforms PM update: fetches Jira data, generates update via Claude, posts to Slack.

## Schedule

- **When**: Fridays 2pm PT (22:00 UTC)
- **Where**: `#team_platforms_pm` Slack channel
- **Workflow**: `.github/workflows/pm-update-weekly.yml`

## Required GitHub Secrets

Add these in **Settings → Secrets and variables → Actions**:

| Secret | Description |
|--------|-------------|
| `JIRA_URL` | `https://gofundme.atlassian.net` |
| `JIRA_USERNAME` | Your Atlassian email |
| `JIRA_API_TOKEN` | Atlassian API token |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude |
| `SLACK_BOT_TOKEN` | Slack Bot OAuth token (xoxb-...) with `chat:write` scope |

## Slack Bot Setup

1. Go to [api.slack.com/apps](https://api.slack.com/apps) → Create New App → From scratch
2. Add OAuth scope: `chat:write`
3. Install to workspace
4. Copy **Bot User OAuth Token** (xoxb-...) → add as `SLACK_BOT_TOKEN`
5. Invite the app to `#team_platforms_pm` (e.g. `/invite @YourAppName`)

## Local / Manual Run

```bash
cd scripts/pm-update-scheduled
cp .env.example .env   # fill in values
npm run run
```

Dry run (fetch Jira only, no Slack):

```bash
npm run test
```

Or trigger the workflow manually from **Actions → PM Update Weekly → Run workflow**.
