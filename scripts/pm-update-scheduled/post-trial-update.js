#!/usr/bin/env node
/**
 * Post a trial PM update to Slack. Uses the pre-generated trial update.
 * Run: node post-trial-update.js
 * Requires: SLACK_BOT_TOKEN in .env
 */

import dotenv from 'dotenv';
import { WebClient } from '@slack/web-api';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
// Load .env from script directory (not cwd)
dotenv.config({ path: join(__dirname, '.env') });
const SLACK_CHANNEL = process.env.SLACK_CHANNEL || 'team_platforms_pm';

const TRIAL_FILE = join(__dirname, '../../.cursor/pm-update-2025-02-24.md');
const MCP_JSON = join(__dirname, '../../.cursor/mcp.json');

function getSlackToken() {
  let token = process.env.SLACK_BOT_TOKEN;
  if (token && !token.startsWith('REPLACE')) return token;
  try {
    const mcp = JSON.parse(readFileSync(MCP_JSON, 'utf-8'));
    token = mcp?.mcpServers?.slack?.env?.SLACK_BOT_TOKEN;
    if (token && !token.startsWith('REPLACE')) return token;
  } catch (_) {}
  // Fallback: read .env manually (handles special chars dotenv may skip)
  try {
    const envPath = join(__dirname, '.env');
    const env = readFileSync(envPath, 'utf-8');
    for (const line of env.split('\n')) {
      if (line.startsWith('SLACK_BOT_TOKEN=') && !line.startsWith('SLACK_BOT_TOKEN=#')) {
        token = line.slice(16).trim().replace(/^["']|["']$/g, '');
        if (token && !token.startsWith('REPLACE')) return token;
      }
    }
  } catch (_) {}
  return null;
}

async function main() {
  const token = getSlackToken();
  if (!token) {
    console.error('SLACK_BOT_TOKEN required.\n  • Edit scripts/pm-update-scheduled/.env — paste your Bot token (xoxb-...) after SLACK_BOT_TOKEN=\n  • Save the file (Cmd+S)\n  • Get token from api.slack.com → Your App → OAuth & Permissions → Bot User OAuth Token');
    process.exit(1);
  }
  if (token.startsWith('xapp-')) {
    console.error('Wrong token type. Use Bot User OAuth Token (xoxb-...), not App-level token (xapp-).\n  api.slack.com → Your App → OAuth & Permissions → Bot User OAuth Token');
    process.exit(1);
  }

  let content;
  try {
    content = readFileSync(TRIAL_FILE, 'utf-8');
  } catch (e) {
    console.error('Trial file not found:', TRIAL_FILE, '\n', e.message);
    process.exit(1);
  }

  const slack = new WebClient(token);
  const channel = SLACK_CHANNEL.startsWith('#') ? SLACK_CHANNEL.slice(1) : SLACK_CHANNEL;

  // Slack mrkdwn: *bold* _italic_ • bullets (40k char limit)
  const slackText = content
    .replace(/^### (.+)$/gm, '*$1*')
    .replace(/^## (.+)$/gm, '*$1*')
    .replace(/^# (.+)$/gm, '*$1*')
    .replace(/^- /gm, '• ')
    .slice(0, 40000);

  console.log('Posting trial update to #' + channel + '...');
  const res = await slack.chat.postMessage({
    channel: `#${channel}`,
    text: slackText,
    mrkdwn: true,
  });
  console.log('Posted:', res.ts);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
