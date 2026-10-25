/**
 * Ask questions with inquirer, loaded on first use so `--help` stays fast.
 * Questions that already have a prefilled answer are skipped.
 * @param {Parameters<typeof import("inquirer").default.prompt>[0]} questions
 * @param {Record<string, unknown>} [answers]
 */
export default async function prompt(questions, answers = {}) {
  const { default: inquirer } = await import("inquirer");

  return inquirer.prompt(questions, answers);
}
