/**
 * Inquirer validator that rejects blank input
 * @param {string} value
 */
module.exports = (value) => value.trim() !== "" || "This field is required.";
