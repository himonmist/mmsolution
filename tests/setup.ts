import { readFileSync, existsSync } from "node:fs";
// Load .env.test so integration tests never touch the dev/prod database.
if (existsSync(".env.test")) {
  for (const line of readFileSync(".env.test", "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)="?(.*?)"?$/);
    if (m) process.env[m[1]] = m[2];
  }
}
(process.env as Record<string, string>).NODE_ENV ??= "test";
