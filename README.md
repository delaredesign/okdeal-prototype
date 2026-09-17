# OKDeal

Make the deal official. Work/service agreements built with React, TypeScript and Vite.

[Live prototype](https://delaredesign.github.io/okdeal-prototype/) · [V1 scope](docs/V1.md) · [Backend design](docs/ARCHITECTURE.md)

## Develop

Use Node.js 24 and pnpm 10.17.1. On Windows PowerShell use `pnpm.cmd` if PowerShell blocks .ps1 scripts.

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm test
pnpm build
```

The form and preview use memory only. Refreshing clears the draft. No agreement is created, shared, verified or signed yet. Use dummy details during prototype tests.

## GitHub workflow

Main contains the editable source. Changes to main run tests and build, then deploy through GitHub Actions. Pull requests run the same checks without deployment.

One-time setting: Settings → Pages → Build and deployment → Source → GitHub Actions. Deployment status appears in Actions under “Check and publish OKDeal”. The existing gh-pages branch is retained as a historical build; source-driven deployments replace manual bundle uploads.

## Backend setup

Create a Supabase project named okdeal in your own account. Connect Supabase for project configuration. Never put the database password or service-role/secret key in this public repository or frontend environment variables.

The backend design is documented but not activated. Accounts, database migrations, recipient verification and signing still require implementation and testing against that project.
