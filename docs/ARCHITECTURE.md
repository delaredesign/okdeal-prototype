# V1 implementation design

## Hosting

GitHub main holds the editable React/TypeScript application. GitHub Actions installs locked dependencies, tests, builds and deploys to Pages. Hash routing allows direct links on static hosting. GitHub stores code and builds only, never agreement records or credentials.

Proposed backend: Supabase PostgreSQL, Auth for creators, and Edge Functions for recipient access and state-changing operations. Provision the project in the owner's account before implementation is activated.

## Records

- agreements: immutable ID, creator user ID, current version number, status, timestamps.
- agreement_versions: agreement ID + version number (unique), immutable terms snapshot, proposer, timestamp, SHA-256 of canonical terms. Amount stored as integer minor units and currency explicitly stored.
- share_links: hashed random token, agreement ID, expiry/revocation. Never persist a raw token in logs or repository files.
- recipient_sessions: short-lived restricted session after email-code verification, bound to the agreement and intended recipient. Recipients do not create an OKDeal account.
- change_requests: author/role, referenced version, proposed changes and reason, resolution. Requests never directly rewrite the current terms.
- signatures: version ID + party role (unique), actual signer name/email, verification event, explicit consent text/version, server timestamp and terms hash. No client-written signature timestamps.
- agreement_events: append-only actor/action/version/time. Events use the transaction that performs the action.

## State and access rules

Creation, revision, change requests and signing each execute in one database transaction. Lock the agreement row; check authenticated party, expected version, current status, and idempotency key. A stale browser gets a conflict and must reload the current version.

Each revision appends a new immutable snapshot. Old signatures remain historical and never carry forward to new terms. Pending changes must be resolved before signing. Completion requires both parties to sign the same current version; subsequent changes to that completed version are rejected on the server and at the database boundary.

Enable row-level security with no broad public table reads. Creator queries are limited to owned agreements. Recipient functions validate a hashed share token and restricted verified session before returning full records or permitting actions. A link alone is not permission to sign. Before verification, show only the minimum information needed to confirm the addressed recipient. A wrong-recipient response stops disclosure and signing.

Rate-limit email codes, token probes, and signature attempts. Compare verified email with the intended recipient email on the server. Treat verification as mailbox control only. Service-role credentials stay in server secrets; browser builds receive only a public project URL/key after access controls are installed and tested.

## Release checks for real agreements

Two independent browser sessions must demonstrate create → link → recipient verification → revision → both signatures → completed record. Test a wrong email, guessed/revoked/expired token, cross-user reads, duplicate requests, competing revisions and signing of stale versions. Attempt direct writes to locked/append-only records. Do not label signing or storage complete before these checks pass on the configured backend.
