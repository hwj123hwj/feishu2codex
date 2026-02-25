# GitHub Actions CI/CD

This project includes:

- `CI`: `.github/workflows/ci.yml`
  - Trigger: `push` / `pull_request` on `main` and `master`
  - Steps: `npm ci` -> `npm run build` -> `npm test`
- `CD`: `.github/workflows/cd-deploy.yml`
  - Trigger: after `CI` succeeds on `main` / `master`, or manual `workflow_dispatch`
  - Deploy mode: upload build package to server over SSH, extract into release folder, install prod deps, switch `current` symlink, run restart command

## Required GitHub Secrets

Configure these in repository settings:

- `SERVER_HOST`: target server IP/domain
- `SERVER_PORT`: SSH port (optional, defaults to `22`)
- `SERVER_USER`: SSH login user
- `SERVER_SSH_KEY`: private key for SSH
- `DEPLOY_PATH`: deploy root path on server, for example `/srv/feishu2codex`
- `DEPLOY_RESTART_CMD`: restart command on server

Example restart command values:

- PM2: `pm2 startOrReload ecosystem.config.cjs --only feishu2codex`
- systemd: `sudo systemctl restart feishu2codex`

## Server-side prerequisites

- Node.js 20+ installed
- `SERVER_USER` has write permission for `DEPLOY_PATH`
- If using `systemctl`, sudo permission should be configured for non-interactive execution
- Optional but recommended: place env file at `DEPLOY_PATH/shared/.env` (workflow will symlink it to `current/.env`)
