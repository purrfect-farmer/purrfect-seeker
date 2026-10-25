import chalk from "chalk";
import defineAction from "../support/define-action.js";
import sortByName from "../../lib/sort-by-name.js";

/** @param {import("commander").Command} program */
export default function registerListServers(program) {
  program
    .command("list-servers")
    .description("List servers")
    .option("--json", "print the servers as JSON")
    .action(
      defineAction(async ({ Server }, flags) => {
        const servers = await Server.unscoped().findAll({
          attributes: ["name", "address", "key", "id"],
          raw: true,
        });
        const sorted = sortByName(servers);

        if (flags.json) {
          console.log(JSON.stringify(sorted));
          return;
        }

        console.log(chalk.bold.green("Servers retrieved!"));
        console.table(sorted);
      })
    );
}
