/**
 * Turn a rule that returns `true | message` into a Sequelize validator
 * that throws the message
 * @param {(value: unknown) => true | string} rule
 */
export default function toModelValidator(rule) {
  return (value) => {
    const result = rule(value);

    if (result !== true) throw new Error(result);
  };
}
