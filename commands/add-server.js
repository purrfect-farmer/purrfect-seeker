/**
 * @param {import("commander").Command} program
 * @param {typeof import("inquirer").default} inquirer
 * @param {typeof import("chalk").default} chalk
 */
module.exports = (program, inquirer, chalk) => {
  program
    .command("add-server")
    .description("Adds a server")
    .action(async () => {
      const db = require("../db/models");
      const generateKey = require("./support/generate-key");
      const printServer = require("./support/print-server");
      const validateRequired = require("./support/validate-required");

      const { id, key, name, address } = await inquirer.prompt([
        { name: "name", message: "Name:", validate: validateRequired },
        { name: "address", message: "Address (Optional):" },
        { name: "id", message: "ID (Optional):" },
        { name: "key", message: "Key (Optional):" },
      ]);

      /** Create Server */
      const server = await db.Server.create({
        ...(id && { id }),
        name: name.trim(),
        address,
        key: key || generateKey(),
      });

      /** Success Message */
      console.log(chalk.bold.green("Server created successfully!"));
      printServer(chalk, server);
    });
};
