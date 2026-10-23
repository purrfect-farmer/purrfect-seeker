import chalk from "chalk";
import defineAction from "../support/define-action.js";

/** @param {import("commander").Command} program */
export default function registerListServers(program) {
  program
    .command("list-servers")
    .description("List servers")
    .action(
      defineAction(async ({ Server }) => {
        const servers = await Server.unscoped().findAll({
          attributes: ["name", "address", "key", "id"],
          order: [["name", "ASC"]],
          raw: true,
        });

        console.log(chalk.bold.green("Servers retrieved!"));
        console.table(servers);
      })
    );
}
