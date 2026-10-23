import chalk from "chalk";

/**
 * @typedef {object} ServerDetails
 * @property {string} id
 * @property {string} key
 * @property {string} name
 * @property {string | null} address
 */

/**
 * Print a server's details
 * @param {ServerDetails} server
 */
export default function printServer(server) {
  const fields = [
    ["ID", server.id],
    ["Key", server.key],
    ["Name", server.name],
    ["Address", server.address ?? "-"],
  ];

  for (const [label, value] of fields) {
    console.log(`${chalk.bold.blue(`${label}:`)} ${chalk.bold.green(value)}`);
  }
}
