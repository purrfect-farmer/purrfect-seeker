/**
 * @param {import("commander").Command} program
 * @param {typeof import("inquirer").default} inquirer
 * @param {typeof import("chalk").default} chalk
 */
module.exports = (program, inquirer, chalk) => {
  program
    .command("edit-server <serverId>")
    .description("Edit a server")
    .action(async (serverId) => {
      const { UniqueConstraintError } = require("sequelize");
      const db = require("../db/models");
      const generateKey = require("./support/generate-key");
      const printServer = require("./support/print-server");
      const validateRequired = require("./support/validate-required");

      /** Include the key, which the default scope excludes */
      const server = await db.Server.unscoped().findByPk(serverId);

      if (!server) {
        console.error(chalk.bold.red("Server not found!"));
        process.exitCode = 1;
        return;
      }

      const { name, address, key, regenerateKey } = await inquirer.prompt([
        {
          name: "name",
          message: "Name:",
          default: server.name,
          validate: validateRequired,
        },
        {
          name: "address",
          message: "Address (Optional):",
          default: server.address,
        },
        {
          name: "regenerateKey",
          type: "confirm",
          message: "Regenerate key?",
          default: false,
        },
        {
          name: "key",
          message: "Key (Leave empty to keep current):",
          when: (answers) => !answers.regenerateKey,
        },
      ]);

      /** Update Server */
      try {
        await server.update({
          name: name.trim(),
          address,
          key: regenerateKey ? generateKey() : key || server.key,
        });
      } catch (error) {
        if (!(error instanceof UniqueConstraintError)) throw error;

        console.error(chalk.bold.red("Key is already used by another server!"));
        process.exitCode = 1;
        return;
      }

      /** Success Message */
      console.log(chalk.bold.green("Server updated successfully!"));
      printServer(chalk, server);
    });
};
