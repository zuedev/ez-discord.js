import prompts from "prompts";
import {
  existsSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  renameSync,
} from "fs";
import { copySync } from "fs-extra/esm";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default async (argv) => {
  // where should the bot be initialized?
  const where = (
    await prompts({
      type: "text",
      name: "value",
      message: "Where should the bot be initialized?",
      initial: "my-bot",
      validate: (value) => {
        if (existsSync(value))
          return "The directory already exists, please choose another one.";
        return true;
      },
    })
  ).value;

  // what features should the bot have?
  const features = (
    await prompts({
      type: "multiselect",
      name: "value",
      message: "What features should the bot have?",
      choices: [
        {
          title: "Message Content Commands",
          value: "message-content-commands",
        },
        {
          title: "Basic Slash Commands",
          value: "basic-slash-commands",
          disabled: true,
        },
        {
          title: "Advanced Slash Commands",
          value: "advanced-slash-commands",
          disabled: true,
        },
      ],
      min: 1,
    })
  ).value;

  if (features.includes("message-content-commands"))
    (
      await prompts({
        type: "multiselect",
        name: "value",
        message: "What message content command scopes should the bot have?",
        choices: [
          { title: "Global", value: "message-content-commands-global" },
          { title: "Guild", value: "message-content-commands-guild" },
          { title: "Direct Message", value: "message-content-commands-dm" },
        ],
        min: 1,
      })
    ).value.forEach((scope) => {
      features.push(scope);
    });

  if (features.includes("message-content-commands-guild"))
    features.push(
      "message-content-commands-guild-" +
        (
          await prompts({
            type: "text",
            name: "value",
            message: "Provide a guild ID for the guild scope:",
          })
        ).value
    );

  // make the bot directory
  mkdirSync(where);

  // copy the config template
  writeFileSync(
    `${where}/config.js`,
    readFileSync(`${__dirname}/../config.template.js`)
  );

  if (features.includes("message-content-commands"))
    mkdirSync(`${where}/commands`);

  if (features.includes("message-content-commands-global"))
    copySync(
      `${__dirname}/../../example/commands/global`,
      `${where}/commands/global`
    );

  if (features.includes("message-content-commands-guild")) {
    copySync(
      `${__dirname}/../../example/commands/guilds`,
      `${where}/commands/guild`
    );

    // rename the guild directory to the guild ID
    renameSync(
      `${where}/commands/guild/1029248119583551548`,
      `${where}/commands/guild/${features
        .find((feature) =>
          feature.startsWith("message-content-commands-guild-")
        )
        .split("-")
        .pop()}`
    );
  }

  if (features.includes("message-content-commands-dm"))
    copySync(
      `${__dirname}/../../example/commands/direct`,
      `${where}/commands/direct`
    );

  console.log(`The bot has been initialized in ${where}.`);
};
