import chalk from "chalk";
import defineAction from "../support/define-action.js";
import sortByName from "../../lib/sort-by-name.js";

/** @param {import("commander").Command} program */
export default function registerListServers(program) {
  program
    .command("list-servers")
    .description("List servers")
    .action(
      defineAction(async ({ Server }) => {
        const servers = await Server.unscoped().findAll({
          attributes: ["name", "address", "key", "id"],
          raw: true,
        });

        console.log(chalk.bold.green("Servers retrieved!"));
        console.table(sortByName(servers));
      })
    );
}
