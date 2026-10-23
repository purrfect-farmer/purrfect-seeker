import chalk from "chalk";

/** @typedef {import("../../db/index.js").Database} Database */

/**
 * Wrap a command action: opens the database, reports errors and
 * closes the database when the action ends. The database is loaded
 * lazily so `--help` stays fast.
 * @param {(db: Database, ...args: any[]) => Promise<void>} action
 */
export default function defineAction(action) {
  return async (...args) => {
    const { createDatabase } = await import("../../db/index.js");
    const db = createDatabase();

    try {
      await action(db, ...args);
    } catch (error) {
      reportError(error);
    } finally {
      await db.sequelize.close();
    }
  };
}

/** Print an error and mark the process as failed */
function reportError(error) {
  /** The user closed a prompt with Ctrl+C */
  if (error.name === "ExitPromptError") {
    process.exitCode = 130;
    return;
  }

  /** Sequelize validation errors carry one message per field */
  const messages = Array.isArray(error.errors)
    ? error.errors.map((item) => item.message)
    : [error.message];

  for (const message of messages) {
    console.error(chalk.bold.red(message));
  }

  process.exitCode = 1;
}
