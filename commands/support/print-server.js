/**
 * Print a server's details
 * @param {typeof import("chalk").default} chalk
 * @param {{ id: string, key: string, name: string, address: string }} server
 */
module.exports = (chalk, server) => {
  const fields = [
    ["ID", server.id],
    ["Key", server.key],
    ["Name", server.name],
    ["Address", server.address],
  ];

  for (const [label, value] of fields) {
    console.log(`${chalk.bold.blue(`${label}:`)} ${chalk.bold.green(value)}`);
  }
};
