# Cursor MCP Integrations: Confluence, Jira, Slack, Google Docs/Slides

This guide explains how to connect **Confluence**, **Jira**, **Slack**, and **Google Drive** (Docs, Slides) to Cursor via the Model Context Protocol (MCP) so the AI can use your docs and tickets to improve PRDs and code.

## Overview

| Source | How Cursor accesses it | Best for |
|--------|-------------------------|----------|
| **Confluence** | Ragie and/or Atlassian MCP | PRD context, design docs, runbooks |
| **Jira** | Ragie and/or Atlassian MCP | Tickets, acceptance criteria, specs |
| **Slack** | Ragie and/or Slack MCP | Threads, decisions, clarifications; post PM updates to channels |
| **Google Drive (Docs/Slides)** | Ragie only | Specs, PRDs, presentations |

- **Ragie**: One RAG pipeline. You connect Confluence, Jira, Slack, and Google Drive in the Ragie dashboard; Cursor gets a single MCP that searches across all of them. Ideal for “find anything about X” and feeding PRD/request refinement.
- **Atlassian MCP**: Direct Jira/Confluence APIs (JQL, get issue, Confluence pages). Ideal for “list my tickets”, “get issue PROJ-123”, “compare code to this ticket”.

You can use **both**: Ragie for broad context, Atlassian MCP for structured Jira/Confluence actions.

---

## Option A: Ragie (Google Drive, Jira, Slack, Confluence in one place)

Ragie’s MCP server gives Cursor access to whatever you connect in Ragie (Google Drive, Jira, Slack, Confluence, Notion, etc.) via natural-language search.

### 1. Ragie account and data sources

1. Sign up: [Ragie](https://secure.ragie.ai/sign-up).
2. In the Ragie dashboard, connect:
   - **Google Drive** (Docs, Slides, Sheets live in Drive)
   - **Jira** (your instance)
   - **Slack** (workspace/channels you want in scope)
   - **Confluence** (spaces you want indexed)
3. Optionally set import mode to **hi_res** for docs with images/tables; use **fast** for text-only and faster indexing.
4. Create an **API key** in the dashboard: [Ragie API keys](https://secure.ragie.ai/api-keys).

### 2. Cursor config (Ragie only)

Copy the example config and set your key:

```bash
cp .cursor/mcp.json.example .cursor/mcp.json
```

Edit `.cursor/mcp.json` and keep only the `ragie` server (or leave both if you also use Atlassian MCP). Set:

- `RAGIE_API_KEY`: your Ragie API key
- `RAGIE_PARTITION`: (optional) partition ID if you use partitions to limit what Cursor can search

Example (Ragie only):

```json
{
  "mcpServers": {
    "ragie": {
      "command": "npx",
      "args": ["-y", "@ragieai/mcp-server"],
      "env": {
        "RAGIE_API_KEY": "your_actual_ragie_api_key",
        "RAGIE_PARTITION": ""
      }
    }
  }
}
```

If Cursor reports an error with the `npx` command, use a shell script instead:

1. Create `scripts/ragie-mcp.sh`:

   ```bash
   #!/usr/bin/env bash
   export RAGIE_API_KEY="your_actual_ragie_api_key"
   export RAGIE_PARTITION=""
   npx -y @ragieai/mcp-server
   ```

2. `chmod +x scripts/ragie-mcp.sh`
3. In Cursor: **Settings → Cursor Settings → MCP Servers**, add a server that runs this script.

---

## Option B: Atlassian MCP (Jira + Confluence direct API)

The [sooperset/mcp-atlassian](https://github.com/sooperset/mcp-atlassian) server gives Cursor direct Jira (JQL, get issue) and Confluence (read pages) tools.

### 1. Atlassian API token

1. Go to [Atlassian API tokens](https://id.atlassian.com/manage-profile/security/api-tokens).
2. Create a token; use it for both Jira and Confluence.
3. Use your **Atlassian account email** (not username) for `CONFLUENCE_USERNAME` and `JIRA_USERNAME`.

### 2. Cursor config (Atlassian)

**Requirement**: Docker installed and running.

In `.cursor/mcp.json` (create from `.cursor/mcp.json.example` if needed), ensure the `mcp-atlassian` server is present and set:

- `CONFLUENCE_URL`: `https://YOUR-SITE.atlassian.net/wiki`
- `JIRA_URL`: `https://YOUR-SITE.atlassian.net`
- `CONFLUENCE_USERNAME` / `JIRA_USERNAME`: your Atlassian email
- `CONFLUENCE_API_TOKEN` / `JIRA_API_TOKEN`: the same API token

Leave `READ_ONLY_MODE": "true"` unless you want Cursor to create/update issues or pages.

### 3. Without Docker (alternative)

If you prefer not to use Docker, you can run the server with **uv** (Python):

```bash
uvx mcp-atlassian --read-only
```

Then in `.cursor/mcp.json` define the server with `command` pointing to that invocation and the same `env` variables. See [sooperset/mcp-atlassian](https://github.com/sooperset/mcp-atlassian) for exact usage.

---

## Apply the config

1. **Create your local config** (do not commit secrets):
   ```bash
   cp .cursor/mcp.json.example .cursor/mcp.json
   ```
2. Edit `.cursor/mcp.json` and replace all placeholders with your keys and URLs.
3. **Fully restart Cursor** (quit and reopen) so it picks up the MCP servers.
4. In Cursor, open **Settings → Tools & MCP** and confirm the servers show a green/active status.

`.cursor/mcp.json` is in `.gitignore`; only `.cursor/mcp.json.example` is committed.

---

## Using this with PRDs and code

- **PRD / request refinement** (e.g. `/gbm.request`, `/gbm.pm.prd`, prd-request-refinement skill): Ask Cursor to pull context from Confluence, Jira, Slack, or Google Docs (e.g. “What does the product doc say about X?”, “Summarize the acceptance criteria for PROJ-123”) so PRDs and request artifacts are aligned with existing docs and tickets.
- **Implementation**: “Compare this file to Jira issue PROJ-456”, “Generate a test plan from the acceptance criteria of PROJ-789”, “Scaffold a feature from the user story in PROJ-111.”
- **Compliance / policies**: With Ragie connected to policy docs (e.g. in Drive or Confluence), you can ask: “Does this function comply with our data retention policy?”

---

## Security notes

- Store API tokens and keys only in `.cursor/mcp.json` or environment variables; never commit them.
- Prefer read-only mode for Atlassian MCP unless you need create/update.
- Ragie and Atlassian MCP run locally or against your configured instances; confirm Ragie’s data handling and retention in their docs if you have compliance requirements.

---

## References

- [Ragie MCP Bridge](https://www.ragie.ai/mcp-bridge) and [Ragie blog: Cursor + Google Drive, Jira, Slack](https://www.ragie.ai/blog/give-cursor-access-to-google-drive-jira)
- [sooperset/mcp-atlassian](https://github.com/sooperset/mcp-atlassian)
- [Cursor: Model Context Protocol (MCP)](https://cursor.com/docs/context/mcp)

---

## Option C: Slack MCP (search and post messages)

The [korotovsky/slack-mcp-server](https://github.com/korotovsky/slack-mcp-server) gives Cursor direct Slack access: search channels, read history, and post messages.

### 1. Slack token

- **Option A (User token)**: Get `xoxp-...` from [Slack OAuth](https://api.slack.com/apps) → your app → OAuth & Permissions. Add scopes: `chat:write`, `channels:history`, `users:read`.
- **Option B (Browser tokens)**: For stealth mode, see [slack-mcp-server auth docs](https://github.com/korotovsky/slack-mcp-server/blob/master/docs/01-authentication-setup.md).

### 2. Cursor config (Slack)

In `.cursor/mcp.json`, add:

```json
"slack": {
  "command": "npx",
  "args": ["-y", "slack-mcp-server@latest", "--transport", "stdio"],
  "env": {
    "SLACK_MCP_XOXP_TOKEN": "xoxp-your-token",
    "SLACK_MCP_ADD_MESSAGE_TOOL": "#team_platforms_pm"
  }
}
```

- `SLACK_MCP_ADD_MESSAGE_TOOL`: Enables posting. Use `"#channel_name"` to allow only that channel, or `"true"` for all.

### 3. PM update to Slack

Use `/pm-update-slack` to generate a Platforms update; copy-paste to `#team_platforms_pm`.

**Note:** Slack MCP (korotovsky) does not work reliably with Enterprise Grid `xoxe.xoxp` tokens. To post automatically, use the Friday scheduled workflow with a Slack **bot token** (`xoxb-`).
