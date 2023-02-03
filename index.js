#!/usr/bin/env node
import "dotenv/config";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import init from "./library/commands/init.js";
import start from "./library/commands/start.js";
import version from "./library/commands/version.js";

await yargs(hideBin(process.argv))
  .command(
    "init",
    "Initialize a new bot",
    () => {},
    async (argv) => await init(argv)
  )
  .command(
    "start",
    "Start the bot",
    () => {},
    async (argv) => await start(argv)
  )
  .command(
    "version",
    "Check the version of the bot package",
    () => {},
    async (argv) => await version(argv)
  )
  .demandCommand(1)
  .parse();

process.exit(0);
