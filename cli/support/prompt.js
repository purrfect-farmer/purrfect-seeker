/**
 * Ask questions with inquirer, loaded on first use so `--help` stays fast
 * @param {Parameters<typeof import("inquirer").default.prompt>[0]} questions
 */
export default async function prompt(questions) {
  const { default: inquirer } = await import("inquirer");

  return inquirer.prompt(questions);
}
