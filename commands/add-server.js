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
      const { default: cryptoRandomString } = require("crypto-random-string");
      const db = require("../db/models");

      const { id, key, name, address } = await inquirer.prompt([
        { name: "name", message: "Name:", required: true },
        { name: "address", message: "Address (Optional):" },
        { name: "id", message: "ID (Optional):" },
        { name: "key", message: "Key (Optional):" },
      ]);

      /** Create Server */
      const server = await db.Server.create({
        ...(id && { id }),
        name,
        address,
        key: key || cryptoRandomString({ length: 16, type: "alphanumeric" }),
      });

      /** Success Message */
      console.log(chalk.bold.green("Server created successfully!"));

      /** ID */
      console.log(`${chalk.bold.blue("ID:")} ${chalk.bold.green(server.id)}`);

      /** Key */
      console.log(`${chalk.bold.blue("Key:")} ${chalk.bold.green(server.key)}`);

      /** Name */
      console.log(
        `${chalk.bold.blue("Name:")} ${chalk.bold.green(server.name)}`
      );

      /** Address */
      console.log(
        `${chalk.bold.blue("Address:")} ${chalk.bold.green(server.address)}`
      );
    });
};
