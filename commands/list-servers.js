/**
 * @param {import("commander").Command} program
 * @param {typeof import("inquirer").default} inquirer
 * @param {typeof import("chalk").default} chalk
 */
module.exports = (program, inquirer, chalk) => {
  program
    .command("list-servers")
    .description("List servers")
    .action(async () => {
      const db = require("../db/models");

      const servers = await db.Server.findAll({
        attributes: ["id", "name", "address", "key"],
      });

      console.log(chalk.bold.green("Servers retrieved!"));
      console.table(servers.map((server) => server.get({ plain: true })));
    });
};
