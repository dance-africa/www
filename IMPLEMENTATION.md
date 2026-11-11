# Dance Africa community platform

## Release status

This is the first static website and local editorial-workspace preview. It is not a deployed private portal or connected growth automation service. No member counts, partners, listings or testimonials have been invented.

- Homepage: responsive original branding, audience filters, Facebook link, contribution requests, calendar empty state and privacy page.
- Requests: native validation and local JSON download. No data leaves the page and no membership is created.
- Workspace: local browser drafts, review/approval states, export and deletion. Approval does not publish. It is explicitly public and must not contain confidential data.
- No build dependencies, remote fonts, analytics pixels or access tokens.

## GitHub Pages

Publish repository main branch, root folder. All links are relative, including assets, so the project works under `/www/`. Merge the reviewed pull request to publish through the existing branch-based Pages configuration. Verify the Pages deployment before announcing the site as live. Files require no build step. The public Facebook URL was supplied by the owner; its destination could not be independently inspected.

## Secure integration phase — required before accepting live registrations

Use Azure Functions for the API, Entra ID for team authentication, managed-identity access to a private database, and Key Vault for channel credentials. A static portal route is not an authorisation boundary: every private API operation must validate identity and roles server-side. Do not put any personal data, access tokens or private directory exports in this public repository.

Required configuration: Azure subscription/resource group, identity tenant and authorised staff roles, approved registration privacy/contact details, email delivery service, confirmed official social account IDs and account-owner authorisation. These have not been supplied or configured.

Suggested API contract:

| Route | Access | Behaviour |
| --- | --- | --- |
| POST /api/registrations | Public, abuse protected | Validate input, record consent version, send verification; do not subscribe before confirmation |
| POST /api/submissions | Public, abuse protected | Store private submission; validate links/uploads; queue moderation |
| GET /api/admin/submissions | Staff | Return authorised moderation records only |
| POST /api/admin/submissions/:id/review | Editor | Record review with audit trail |
| POST /api/admin/campaigns/:id/publish | Publisher | Validate approval, enqueue one idempotent publishing job |
| GET /api/admin/metrics | Staff | Return aggregated first-party and authorised channel statistics |
| POST /api/unsubscribe | Signed user token | Withdraw mailing consent and stop future marketing |

Use bounded requests, allowed-origin CORS, rate limiting, validation, duplicate handling, retry/dead-letter queues and audit records. Adopt explicit retention and deletion rules. Social integrations must use supported provider APIs with the permissions actually granted; verify current provider requirements before implementation. Never promise automatic group membership, invite scraping or guaranteed audience growth.

## Growth workflow

Original creator content → reviewed publication → tagged website visit → consent-based registration → confirmed email → event participation → repeat engagement. Report conversion rates, active members, event attendance, opt-outs and sponsorship enquiries. Import no guessed audience metrics. Sponsorship offers and paid events require owner-approved pricing and fulfilment terms.

## Local verification

Serve with `python3 -m http.server 8765` from this folder. The repository test script uses Playwright, supplied by the development runtime; run with `NODE_PATH=<installed-node-modules> node verify.cjs`. It checks mobile layout, navigation, filters, form validation/download, draft persistence, approval, export, safe rendering and privacy navigation. It does not verify deployed Azure or social connections.
