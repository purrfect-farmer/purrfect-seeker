import cryptoRandomString from "crypto-random-string";

/** Generate a random 16-character alphanumeric key */
export default () => cryptoRandomString({ length: 16, type: "alphanumeric" });
