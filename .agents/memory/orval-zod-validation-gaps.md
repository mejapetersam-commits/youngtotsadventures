---
name: Orval-generated Zod validation gaps
description: Orval codegen produces looser Zod than the OpenAPI spec implies — integers and email formats need extra handling.
---

**Rule:** Orval-generated Zod schemas do not fully enforce the OpenAPI contract: `type: integer` becomes `zod.number()` (no `.int()`), and `type: string` without `format: email` gets no email validation.

**Why:** An architect review caught that the reviews API accepted `rating: 4.5` and syntactically invalid emails despite the spec saying `integer` and the intent being email — the generated Zod passed them through.

**How to apply:** For any new write endpoint: add `format: email` in openapi.yaml for email fields (Orval then emits `.email()`), and add a route-level `Number.isInteger(...)` guard after `safeParse` for integer fields. Verify with curl using a non-integer and a bad email.
