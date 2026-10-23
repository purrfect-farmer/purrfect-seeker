const { default: cryptoRandomString } = require("crypto-random-string");

/** Generate a random 16-character alphanumeric server key */
module.exports = () => cryptoRandomString({ length: 16, type: "alphanumeric" });
