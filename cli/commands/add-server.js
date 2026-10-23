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

/** @param {import("commander").Command} program */
export default function registerAddServer(program) {
  program
    .command("add-server")
    .description("Add a server")
    .action(
      defineAction(async ({ Server }) => {
        const { id, key, name, address } = await prompt([
          nameQuestion(),
          addressQuestion(),
          idQuestion,
          keyQuestion("Key (Optional):"),
        ]);

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
