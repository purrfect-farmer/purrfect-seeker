import chalk from "chalk";
import prompt from "../support/prompt.js";
import defineAction from "../support/define-action.js";
import generateKey from "../../lib/generate-key.js";
import printServer from "../support/print-server.js";
import reportNotFound from "../support/report-not-found.js";
import {
  addressQuestion,
  keyQuestion,
  nameQuestion,
} from "../prompts/server-questions.js";

/** @param {import("commander").Command} program */
export default function registerEditServer(program) {
  program
    .command("edit-server <serverId>")
    .description("Edit a server")
    .action(
      defineAction(async ({ Server }, serverId) => {
        /** Include the key, which the default scope excludes */
        const server = await Server.unscoped().findByPk(serverId);

        if (!server) return reportNotFound();

        const { name, address, key, regenerateKey } = await prompt([
          nameQuestion(server.name),
          addressQuestion(server.address),
          {
            name: "regenerateKey",
            type: "confirm",
            message: "Regenerate key?",
            default: false,
          },
          {
            ...keyQuestion("Key (Leave empty to keep current):"),
            when: (answers) => !answers.regenerateKey,
          },
        ]);

        const newKey = regenerateKey ? generateKey() : key.trim();

        await server.update({
          name,
          address,
          ...(newKey && { key: newKey }),
        });

        console.log(chalk.bold.green("Server updated successfully!"));
        printServer(server);
      })
    );
}
