import chalk from "chalk";
import prompt from "../support/prompt.js";
import defineAction from "../support/define-action.js";
import generateKey from "../../lib/generate-key.js";
import printServer from "../support/print-server.js";
import {
  addressQuestion,
  idQuestion,
  keyQuestion,
  nameQuestion,
} from "../prompts/server-questions.js";

/** Optional fields left blank when the server is added without prompts */
const BLANK_OPTIONAL_ANSWERS = { address: "", id: "", key: "" };

/**
 * Prefilled answers from the flags. With --name, missing optional
 * fields are left blank so nothing is asked.
 * @param {{ name?: string, address?: string, id?: string, key?: string }} flags
 */
function toPrefilledAnswers({ name, address, id, key }) {
  const answers = Object.fromEntries(
    Object.entries({ name, address, id, key }).filter(
      ([, value]) => value !== undefined
    )
  );

  if (name === undefined) return answers;

  return { ...BLANK_OPTIONAL_ANSWERS, ...answers };
}

/** @param {import("commander").Command} program */
export default function registerAddServer(program) {
  program
    .command("add-server")
    .description("Add a server (prompts for any field not given as a flag)")
    .option("--name <name>", "server name; skips the prompts")
    .option("--address <address>", "server address")
    .option("--id <id>", "server ID (UUID)")
    .option("--key <key>", "server key")
    .option("--skip-existing", "do nothing when a server has the same name")
    .action(
      defineAction(async ({ Server }, flags) => {
        const { id, key, name, address } = await prompt(
          [
            nameQuestion(),
            addressQuestion(),
            idQuestion,
            keyQuestion("Key (Optional):"),
          ],
          toPrefilledAnswers(flags)
        );

        const trimmedName = name.trim();

        if (flags.skipExisting) {
          const existing = await Server.findOne({
            where: { name: trimmedName },
          });

          if (existing) {
            const message = `${trimmedName} already exists. Skipping.`;

            console.log(chalk.bold.yellow(message));
            return;
          }
        }

        const server = await Server.create({
          ...(id.trim() && { id: id.trim() }),
          name,
          address,
          key: key.trim() || generateKey(),
        });

        console.log(chalk.bold.green("Server created successfully!"));
        printServer(server);
      })
    );
}
