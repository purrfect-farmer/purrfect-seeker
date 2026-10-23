import chalk from "chalk";
import defineAction from "../support/define-action.js";
import reportNotFound from "../support/report-not-found.js";

/** @param {import("commander").Command} program */
export default function registerRemoveServer(program) {
  program
    .command("remove-server <serverId>")
    .description("Remove a server")
    .action(
      defineAction(async ({ Server }, serverId) => {
        const count = await Server.destroy({ where: { id: serverId } });

        if (count === 0) return reportNotFound();

        console.log(chalk.bold.green("Server removed!"));
      })
    );
}
