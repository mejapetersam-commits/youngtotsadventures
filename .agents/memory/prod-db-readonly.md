---
name: Production DB is read-only via agent tools
description: Why clearing/mutating live data requires an in-app admin feature + republish, not a direct query
---

The `executeSql` tool with `environment: "production"` only allows SELECT (read-only replica). There is no agent path to DELETE/UPDATE/INSERT against the production database directly.

**Why:** Replit exposes production only as a read replica for safety. Schema changes go through the Publish flow; data mutations must happen through the deployed app itself.

**How to apply:** When the user asks to clear/edit live data (e.g. "clear test registrations from the live dashboard"), do NOT attempt a production write via executeSql. Instead: (1) build the capability into the app's admin UI (delete endpoint + button), (2) verify in dev, (3) have the user republish, (4) the user performs the action on the live site. Dev database writes via executeSql are fine.
