import { execFileSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const VALID_DEPLOY_STRATEGIES = new Set(["auto", "migrate", "push"]);
const DEFAULT_MIGRATIONS_DIRECTORY = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../prisma/migrations",
);

function normalizeDeployStrategy(deployStrategy) {
  if (!deployStrategy) {
    return "auto";
  }

  if (VALID_DEPLOY_STRATEGIES.has(deployStrategy)) {
    return deployStrategy;
  }

  throw new Error(
    `Unsupported PRISMA_DEPLOY_STRATEGY "${deployStrategy}". Expected one of: auto, migrate, push.`,
  );
}

function directoryContainsSqlFile(directoryPath) {
  if (!existsSync(directoryPath)) {
    return false;
  }

  for (const entry of readdirSync(directoryPath, { withFileTypes: true })) {
    const entryPath = path.join(directoryPath, entry.name);

    if (entry.isFile() && entry.name.endsWith(".sql")) {
      return true;
    }

    if (entry.isDirectory() && directoryContainsSqlFile(entryPath)) {
      return true;
    }
  }

  return false;
}

export function hasCheckedMigrations(migrationsDirectory = DEFAULT_MIGRATIONS_DIRECTORY) {
  return directoryContainsSqlFile(migrationsDirectory);
}

export function getDatabasePreparationCommands({ deployStrategy, hasCheckedMigrations }) {
  const normalizedStrategy = normalizeDeployStrategy(deployStrategy);
  const shouldUseMigrate =
    normalizedStrategy === "migrate" || (normalizedStrategy === "auto" && hasCheckedMigrations);

  return [
    ["pnpm", "db:generate"],
    shouldUseMigrate
      ? ["pnpm", "exec", "prisma", "migrate", "deploy"]
      : ["pnpm", "exec", "prisma", "db", "push"],
    ["pnpm", "db:seed"],
  ];
}

export function runDatabasePreparation({
  deployStrategy = process.env["PRISMA_DEPLOY_STRATEGY"],
  migrationsDirectory,
} = {}) {
  const checkedMigrationsExist = hasCheckedMigrations(migrationsDirectory);
  const commands = getDatabasePreparationCommands({
    deployStrategy,
    hasCheckedMigrations: checkedMigrationsExist,
  });

  console.info(
    `[db-prepare] strategy=${normalizeDeployStrategy(deployStrategy)} checkedMigrations=${String(checkedMigrationsExist)}`,
  );

  if (!checkedMigrationsExist) {
    console.warn(
      "[db-prepare] No checked Prisma migrations were found. Falling back to `prisma db push` for this deployment.",
    );
  }

  for (const [command, ...args] of commands) {
    console.info(`[db-prepare] Running: ${[command, ...args].join(" ")}`);
    execFileSync(command, args, { stdio: "inherit" });
  }
}

const currentFilePath = fileURLToPath(import.meta.url);
const invokedFilePath = process.argv[1] ? path.resolve(process.argv[1]) : "";

if (currentFilePath === invokedFilePath) {
  try {
    runDatabasePreparation();
  } catch (error) {
    console.error("[db-prepare] Database preparation failed.");
    console.error(error);
    process.exit(1);
  }
}
