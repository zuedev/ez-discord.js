#!/usr/bin/env node

import "dotenv/config";
import { readdirSync } from "fs";
import { Client, GatewayIntentBits } from "discord.js";

const state = {};

const baseDirectory = process.argv[2];

// check for "commands" directory in the base directory
if (readdirSync(baseDirectory).includes("commands")) {
  // do we have a bot token?
  if (!process.env.DISCORD_BOT_TOKEN) throw new Error("No bot token provided!");

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  client.on("ready", async () => {
    console.log("I'm alive! Checking for commands...");

    // what commands do we have? save them if they're valid
    readdirSync(`${baseDirectory}/commands`).forEach(async (file) => {
      if (!file.endsWith(".js")) return;

      const command = (await import(`./${baseDirectory}/commands/${file}`))
        .default;

      // check for a valid command
      if (command.name && command.description && command.execute) {
        state.commands ||= [];
        state.commands.push(command);
        console.log(`✅ Command "${command.name}" loaded!`);
      } else {
        console.log(`❌ ${file} is not a valid command file!`);
      }
    });

    // do we have a prefix defined? if not, define it as a bot mention
    if (process.env.DISCORD_BOT_PREFIX) {
      state.prefix = process.env.DISCORD_BOT_PREFIX;
      console.log(
        `📢 Using custom prefix "${process.env.DISCORD_BOT_PREFIX}".`
      );
    } else {
      state.prefix = `<@${client.user.id}>`;
      console.log(
        `📢 Using bot mention as prefix. Mention me with "<@${client.user.id}>" to use a command!`
      );
    }

    // is custom help command defined?
    if (process.env.DISCORD_BOT_HELP_COMMAND) {
      state.helpCommand = process.env.DISCORD_BOT_HELP_COMMAND;
      console.log(
        `📙 Using custom help command "${process.env.DISCORD_BOT_HELP_COMMAND}".`
      );
    } else {
      state.helpCommand = "help";
      console.log(
        `📙 Using default help command "help". You can change this by setting the DISCORD_BOT_HELP_COMMAND environment variable.`
      );
    }

    // ready up!
    state.ready = true;
  });

  client.on("messageCreate", async (message) => {
    // ignore bot messages
    if (message.author.bot) return;

    // check if the message starts with the prefix
    if (!message.content.startsWith(state.prefix)) return;

    // get the command name and arguments
    const args = message.content.slice(state.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // check for custom help command
    if (commandName === state.helpCommand) {
      // send a message with all commands
      message.channel.send({
        embeds: [
          {
            title: "Commands",
            description: "Here's a list of all commands:",
            color: 0x5865f2,
            fields: state.commands.map((command) => ({
              name: command.name,
              value: command.description,
            })),
          },
        ],
      });
    } else {
      // check if the command exists
      const command = state.commands.find(
        (command) => command.name === commandName
      );

      if (!command)
        return message.reply(
          "That's not a valid command! Try `help` to see a list of all commands."
        );

      // execute the command
      try {
        await command.execute(message, args);
      } catch (error) {
        console.error(error);
        message.reply("There was an error trying to execute that command!");
      }
    }
  });

  client.login(process.env.DISCORD_BOT_TOKEN);
}
