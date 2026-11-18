#!/bin/sh
# Nightly compressed PostgreSQL dump with retention. Copy ./backups off-site (S3/B2/rsync).
set -eu
TS=$(date +%Y%m%d-%H%M%S)
pg_dump -h db -U mm -d mmsolution -Fc -f "/backups/mmsolution-$TS.dump"
find /backups -name 'mmsolution-*.dump' -mtime +"${RETENTION_DAYS:-14}" -delete
echo "backup ok: mmsolution-$TS.dump"
# Restore: pg_restore -h db -U mm -d mmsolution --clean --if-exists /backups/<file>.dump
