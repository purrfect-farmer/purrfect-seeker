import chalk from "chalk";

/** Print a "not found" error and mark the process as failed */
export default function reportNotFound() {
  console.error(chalk.bold.red("Server not found!"));
  process.exitCode = 1;
}
