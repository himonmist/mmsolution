#!/bin/sh
set -e
# Apply pending migrations (idempotent), then start the standalone server.
node node_modules/prisma/build/index.js migrate deploy
exec node server.js
