import commands from "./commands/index.js";
import pkg from "../package.json" with { type: "json" };
import { Command } from "commander";

/** Build the Seeker CLI with every command registered */
export default function createProgram() {
  const program = new Command();

  program
    .name("seeker")
    .description("Purrfect Seeker CLI")
    .version(pkg.version);

  for (const register of commands) register(program);

  return program;
}
