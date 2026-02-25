#!/usr/bin/env node
/**
 * Scheduled Platforms PM update: fetches Jira, generates update via Claude, posts to Slack.
 * Run: node run.js
 * Env: JIRA_URL, JIRA_USERNAME, JIRA_API_TOKEN, ANTHROPIC_API_KEY, SLACK_BOT_TOKEN
 */

import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';
import { WebClient } from '@slack/web-api';

const BOARDS = [
  { name: 'Identity', id: 239 },
  { name: 'Integrity', id: 404 },
  { name: 'Explore', id: 319 },
  { name: 'DevEx', id: 916 },
  { name: 'Quality Engg', id: 895 },
  { name: 'Comms', id: 349 },
];

const JIRA_BASE = (process.env.JIRA_URL || 'https://gofundme.atlassian.net').replace(/\/$/, '').replace(/\/jira\/?$/, '');
const JIRA_AUTH = Buffer.from(
  `${process.env.JIRA_USERNAME || ''}:${process.env.JIRA_API_TOKEN || ''}`
).toString('base64');

const SLACK_CHANNEL = process.env.SLACK_CHANNEL || 'team_platforms_pm';
const DRY_RUN = process.argv.includes('--dry-run');
const JIRA_ONLY = process.argv.includes('--jira-only');

async function jiraFetch(path) {
  const res = await fetch(`${JIRA_BASE}${path}`, {
    headers: {
      Authorization: `Basic ${JIRA_AUTH}`,
      Accept: 'application/json',
    },
  });
  if (!res.ok) throw new Error(`Jira ${res.status}: ${path}`);
  return res.json();
}

async function fetchBoardSprints(boardId, state = null) {
  const q = state ? `?state=${state}` : '';
  const data = await jiraFetch(`/rest/agile/1.0/board/${boardId}/sprint${q}`);
  return data.values || [];
}

async function fetchSprintIssues(sprintId) {
  const data = await jiraFetch(
    `/rest/agile/1.0/sprint/${sprintId}/issue?fields=summary,status,issuetype,priority,assignee,labels,updated&maxResults=50`
  );
  return data.issues || [];
}

async function gatherJiraData() {
  const byBoard = {};
  for (const board of BOARDS) {
    try {
      const [closed, active, future] = await Promise.all([
        fetchBoardSprints(board.id, 'closed').then(v => v.slice(0, 1)),
        fetchBoardSprints(board.id, 'active'),
        fetchBoardSprints(board.id, 'future').then(v => v.slice(0, 1)),
      ]);
      const sprints = { closed: closed[0], active: active[0], future: future[0] };
      const issues = {};
      if (sprints.closed?.id) {
        issues.closed = await fetchSprintIssues(sprints.closed.id);
      }
      if (sprints.active?.id) {
        issues.active = await fetchSprintIssues(sprints.active.id);
      }
      byBoard[board.name] = { sprints, issues };
    } catch (e) {
      byBoard[board.name] = { error: e.message };
    }
  }
  return byBoard;
}

function formatJiraContext(data) {
  const lines = [];
  for (const [board, info] of Object.entries(data)) {
    if (info.error) {
      lines.push(`## ${board}: Error - ${info.error}`);
      continue;
    }
    lines.push(`## ${board}`);
    if (info.sprints?.closed) lines.push(`Closed: ${info.sprints.closed.name} (${info.sprints.closed.id})`);
    if (info.sprints?.active) lines.push(`Active: ${info.sprints.active.name} (${info.sprints.active.id})`);
    if (info.sprints?.future) lines.push(`Future: ${info.sprints.future.name}`);
    if (info.issues?.closed?.length) {
      lines.push(`\n### Completed (closed sprint):`);
      for (const i of info.issues.closed) {
        const f = i.fields || {};
        lines.push(`- [${i.key}] ${f.summary || ''} | ${(f.status?.name || '')} | ${(f.issuetype?.name || '')}`);
      }
    }
    if (info.issues?.active?.length) {
      lines.push(`\n### In Progress (active sprint):`);
      for (const i of info.issues.active) {
        const f = i.fields || {};
        lines.push(`- [${i.key}] ${f.summary || ''} | ${(f.status?.name || '')} | ${(f.issuetype?.name || '')}`);
      }
    }
    lines.push('');
  }
  return lines.join('\n');
}

const PM_UPDATE_SYSTEM = `You are a PM update specialist. Generate a Platforms weekly update from the Jira data provided.

Rules:
- Objective, concise bullets. No fabrication. Cite Jira keys.
- Format for Slack channel (broader teams): Shipped, In Progress, Blockers, Bugs, Learnings, Next 2 Weeks.
- Use markdown. Keep scannable.
- Only include what the data supports. Use "TBD" when unknown.`;

async function generateUpdate(jiraContext) {
  const anthropic = new Anthropic();
  const today = new Date().toISOString().split('T')[0];
  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: PM_UPDATE_SYSTEM,
    messages: [
      {
        role: 'user',
        content: `Generate a holistic Platforms weekly update for the week ending around ${today}. Use only the Jira data below. Format for posting to #team_platforms_pm Slack channel (detailed, team-facing).

Jira data:
${jiraContext}`,
      },
    ],
  });
  const text = msg.content?.find(c => c.type === 'text')?.text;
  return text || 'No content generated.';
}

async function postToSlack(text) {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) throw new Error('SLACK_BOT_TOKEN required');
  const slack = new WebClient(token);
  const channel = SLACK_CHANNEL.startsWith('#') ? SLACK_CHANNEL.slice(1) : SLACK_CHANNEL;
  const header = `*Platforms Weekly Update* – ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}\n\n`;
  await slack.chat.postMessage({
    channel: `#${channel}`,
    text: header + text,
    mrkdwn: true,
  });
  return true;
}

async function main() {
  const missing = [];
  if (!process.env.JIRA_USERNAME) missing.push('JIRA_USERNAME');
  if (!process.env.JIRA_API_TOKEN) missing.push('JIRA_API_TOKEN');
  if (!JIRA_ONLY && !DRY_RUN) {
    if (!process.env.ANTHROPIC_API_KEY) missing.push('ANTHROPIC_API_KEY');
    if (!process.env.SLACK_BOT_TOKEN) missing.push('SLACK_BOT_TOKEN');
  }
  if (missing.length) {
    console.error('Missing env:', missing.join(', '));
    process.exit(1);
  }

  console.log('Fetching Jira data...');
  const jiraData = await gatherJiraData();
  const context = formatJiraContext(jiraData);
  if (DRY_RUN || JIRA_ONLY) {
    console.log('--- Jira Context ---\n', context);
    return;
  }

  console.log('Generating update via Claude...');
  const update = await generateUpdate(context);

  console.log('Posting to Slack #' + SLACK_CHANNEL + '...');
  await postToSlack(update);
  console.log('Done.');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
