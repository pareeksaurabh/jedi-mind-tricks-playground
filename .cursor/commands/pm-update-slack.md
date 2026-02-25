---
description: "Platforms PM update — generate and post to #team_platforms_pm via Slack MCP."
---

Use the **pm-updates** subagent to generate a holistic Platforms update, then **post it to #team_platforms_pm** using the Slack MCP `slack_post_message` tool.

1. Run pm-updates workflow (detailed format for team channel).
2. Format output for Slack (markdown, readable in-app).
3. Call `slack_post_message` with `channel_id` = the ID for #team_platforms_pm (from `.cursor/mcp.json` SLACK_CHANNEL_IDS or via `slack_list_channels`).
4. If Slack MCP is not configured or fails, output the update for manual copy-paste.

*Requires: Slack MCP configured in `.cursor/mcp.json` with SLACK_BOT_TOKEN, SLACK_TEAM_ID, SLACK_CHANNEL_IDS. See docs/handbook/slack-mcp-setup.md.*
