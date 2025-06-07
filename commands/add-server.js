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

      const { name, address, key } = await inquirer.prompt([
        { name: "name", message: "Name:", required: true },
        { name: "address", message: "Address (Optional):" },
        { name: "key", message: "Key (Optional):" },
      ]);

      const server = await db.Server.create({
        name,
        address,
        key: key || cryptoRandomString({ length: 16, type: "base64" }),
      });

      /** Success Message */
      console.log(chalk.bold.green("Server created successfully!"));

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
