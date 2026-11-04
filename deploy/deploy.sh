#!/usr/bin/env bash
# Deploys or updates Campus Virtual on the server. See "Deploy" in Readme.md.
#
#   ./deploy/deploy.sh            update the production branch, build, back up, restart
#   ./deploy/deploy.sh --no-pull  same, with the code currently checked out (rollback)
#
# Steps: build the new image while the site is still up -> stop the app ->
# back up the data directory (consistent, the database is closed) -> start the
# new version (pending migrations run on start) -> wait for the health check.

set -euo pipefail

BASE_DIR="${CAMPUS_BASE_DIR:-/srv/campus-virtual}"
BACKUP_DIR="${CAMPUS_BACKUP_DIR:-$BASE_DIR/backups}"
KEEP_BACKUPS="${CAMPUS_KEEP_BACKUPS:-10}"
BRANCH="production"
CONTAINER="campus-virtual"

export CAMPUS_DATA_DIR="${CAMPUS_DATA_DIR:-$BASE_DIR/data/pb_data}"
CAMPUS_UID="$(id -u)"
CAMPUS_GID="$(id -g)"
export CAMPUS_UID CAMPUS_GID

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE=(docker compose -f "$REPO_DIR/docker-compose.prod.yml")

log() { printf '\n==> %s\n' "$*"; }
fail() { printf '\nERROR: %s\n' "$*" >&2; exit 1; }

PULL=1
case "${1:-}" in
  "") ;;
  --no-pull) PULL=0 ;;
  *) echo "usage: $0 [--no-pull]" >&2; exit 2 ;;
esac

cd "$REPO_DIR"

[[ -z "$(git status --porcelain)" ]] \
  || fail "the repository has local changes; the server must run committed code only."

if (( PULL )); then
  current_branch="$(git rev-parse --abbrev-ref HEAD)"
  [[ "$current_branch" == "$BRANCH" ]] \
    || fail "expected branch '$BRANCH', found '$current_branch'. Use --no-pull to deploy a specific commit (rollback)."
  log "Updating code ($BRANCH)"
  git pull --ff-only origin "$BRANCH"
fi

REVISION="$(git rev-parse --short HEAD)"

mkdir -p "$CAMPUS_DATA_DIR" "$BACKUP_DIR"

log "Building image for $REVISION (the site stays up meanwhile)"
"${COMPOSE[@]}" build --pull

log "Stopping the current version"
"${COMPOSE[@]}" stop

# If anything fails from here until the new version starts, bring the previous
# container (old image, untouched data) back up.
trap 'echo "Deploy failed: restarting the previous version." >&2; "${COMPOSE[@]}" start || true' ERR

if [[ -n "$(ls -A "$CAMPUS_DATA_DIR")" ]]; then
  backup_file="$BACKUP_DIR/pb_data-$(date +%Y%m%d-%H%M%S)-before-$REVISION.tar.gz"
  log "Backing up data to $backup_file"
  tar -czf "$backup_file" -C "$(dirname "$CAMPUS_DATA_DIR")" "$(basename "$CAMPUS_DATA_DIR")"
else
  log "Data directory is empty (first deploy): skipping backup"
fi

trap - ERR

log "Starting $REVISION"
"${COMPOSE[@]}" up -d --remove-orphans

log "Waiting for the health check"
status="starting"
for _ in $(seq 1 30); do
  status="$(docker inspect -f '{{.State.Health.Status}}' "$CONTAINER" 2>/dev/null || echo "missing")"
  [[ "$status" == "healthy" ]] && break
  sleep 2
done

if [[ "$status" != "healthy" ]]; then
  "${COMPOSE[@]}" logs --tail 50 app >&2 || true
  fail "the new version is not healthy (status: $status). See the logs above and the rollback section in Readme.md."
fi

log "Cleaning up old backups (keeping $KEEP_BACKUPS) and dangling images"
ls -1t "$BACKUP_DIR"/pb_data-*.tar.gz 2>/dev/null | tail -n +"$((KEEP_BACKUPS + 1))" | xargs -r rm -f --
docker image prune -f > /dev/null

log "Done: $REVISION is live"
