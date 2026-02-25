---
description: "Platforms PM update — single team only. Pass team name as argument (Identity|Integrity|Explore|DevEx|Quality Engg|Comms)."
---

Use the **pm-updates** subagent for a **single-team** Platforms update.

**Argument**: $ARGUMENTS — one of: Identity, Integrity, Explore, DevEx, Quality Engg, Comms

If no argument: ask which team.

Map to board: Identity→239, Integrity→404, Explore→319, DevEx→916, Quality Engg→895, Comms→349.

Ask: **Executive or detailed?** Then run Jira workflow for that board only and produce the update.
