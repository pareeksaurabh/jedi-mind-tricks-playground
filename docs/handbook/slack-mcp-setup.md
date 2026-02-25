# Slack MCP Setup — Post PM Updates to #team_platforms_pm

The official Slack MCP (`@modelcontextprotocol/server-slack`) requires a **bot token** (`xoxb-`), not a user token. Follow these steps to enable direct posting to your PM channel.

## 1. Create a Slack App

1. Go to [api.slack.com/apps](https://api.slack.com/apps) → **Create New App** → **From scratch**
2. Name it (e.g. "PM Update Bot") and select your GoFundMe workspace

## 2. Add Bot Scopes

**OAuth & Permissions** → **Bot Token Scopes** → Add:

- `channels:read` — List channels
- `channels:history` — Read channel messages
- `chat:write` — **Required for posting**
- `users:read`
- `users.profile:read`

## 3. Install to Workspace

1. **OAuth & Permissions** → **Install to Workspace** → Authorize
2. Copy the **Bot User OAuth Token** (starts with `xoxb-`)

## 4. Invite App to #team_platforms_pm

In Slack, go to `#team_platforms_pm` and run:

```
/invite @YourAppName
```

Or: channel name → Integrations → Add apps → select your app

## 5. Get Team ID and Channel ID

**Team ID** (starts with `T`):

- Open your workspace in Slack
- URL looks like `https://app.slack.com/client/T01234567/...` — the `T01234567` part is your Team ID

**Channel ID** (starts with `C`):

- Open `#team_platforms_pm` → click channel name → **Copy link**
- URL contains `.../C01234567/...` — the `C01234567` part is your Channel ID

## 6. Update .cursor/mcp.json

Replace the placeholders in the `slack` server config:

```json
"slack": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-slack"],
  "env": {
    "SLACK_BOT_TOKEN": "xoxb-your-actual-bot-token",
    "SLACK_TEAM_ID": "T01234567",
    "SLACK_CHANNEL_IDS": "C01234567"
  }
}
```

Use your actual values. `SLACK_CHANNEL_IDS` can be multiple channels separated by commas.

## 7. Restart Cursor

Fully quit and reopen Cursor so it picks up the Slack MCP.

## 8. Test

Run `/pm-update-slack` — it should generate the update and post it to `#team_platforms_pm`.
