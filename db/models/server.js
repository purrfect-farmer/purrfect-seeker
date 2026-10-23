import { DataTypes, Model } from "sequelize";
import normalizeAddress from "../../lib/normalize-address.js";
import toModelValidator from "../../validation/to-model-validator.js";
import {
  validateAddress,
  validateId,
  validateKey,
  validateName,
} from "../../validation/server-rules.js";

export default class Server extends Model {
  /** @param {import("sequelize").Sequelize} sequelize */
  static initModel(sequelize) {
    return Server.init(
      {
        id: {
          primaryKey: true,
          allowNull: false,
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          validate: { isServerId: toModelValidator(validateId) },
        },
        key: {
          type: DataTypes.STRING,
          unique: { msg: "Key is already used by another server." },
          validate: { isServerKey: toModelValidator(validateKey) },
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: { isServerName: toModelValidator(validateName) },
          set(value) {
            this.setDataValue(
              "name",
              typeof value === "string" ? value.trim() : value
            );
          },
        },
        address: {
          type: DataTypes.STRING,
          validate: { isServerAddress: toModelValidator(validateAddress) },
          set(value) {
            this.setDataValue("address", Server.toStoredAddress(value));
          },
        },
      },
      {
        sequelize,
        modelName: "Server",
        defaultScope: {
          attributes: { exclude: ["key"] },
        },
      }
    );
  }

  /**
   * Store blank addresses as null, normalize the rest, and keep invalid
   * input as-is so the validator reports it
   * @param {unknown} value
   */
  static toStoredAddress(value) {
    const trimmed = typeof value === "string" ? value.trim() : value;

    if (!trimmed) return null;

    return normalizeAddress(trimmed) ?? trimmed;
  }
}
