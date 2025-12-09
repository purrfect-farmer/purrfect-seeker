/**
 * @param {import("commander").Command} program
 * @param {typeof import("inquirer").default} inquirer
 * @param {typeof import("chalk").default} chalk
 */
module.exports = (program, inquirer, chalk) => {
  program
    .command("remove-server <serverId>")
    .description("Remove a server")
    .action(async (serverId) => {
      const db = require("../db/models");

      await db.Server.destroy({
        where: { id: serverId },
      });

      console.log(chalk.bold.green("Server removed!"));
    });
};
