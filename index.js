#!/usr/bin/env node

import "dotenv/config";
import { readdirSync } from "fs";
import { Client, GatewayIntentBits, Partials } from "discord.js";

const state = {};

const baseDirectory = process.argv[2];

// check for "commands" directory in the base directory
if (readdirSync(baseDirectory).includes("commands")) {
  // do we have a bot token?
  if (!process.env.DISCORD_BOT_TOKEN) throw new Error("No bot token provided!");

  const client = new Client({
    intents: [...Object.values(GatewayIntentBits)],
    partials: [...Object.values(Partials)],
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
        state.commands.global ||= [];
        state.commands.push(command);
        console.log(`✅ Global command "${command.name}" loaded!`);
      } else {
        console.log(
          `❌ ./${baseDirectory}/commands/${file} is not a valid global command file!`
        );
      }
    });

    // now do the same for commands in direct messages
    readdirSync(`${baseDirectory}/commands/direct`).forEach(async (file) => {
      if (!file.endsWith(".js")) return;

      const command = (
        await import(`./${baseDirectory}/commands/direct/${file}`)
      ).default;

      // check for a valid command
      if (command.name && command.description && command.execute) {
        state.commands ||= [];
        state.commands.direct ||= [];
        state.commands.direct.push(command);
        console.log(`✅ Direct-message command "${command.name}" loaded!`);
      } else {
        console.log(
          `❌ ./${baseDirectory}/commands/direct/${file} is not a valid direct command file!`
        );
      }
    });

    // finally do the same for guild-scoped commands
    readdirSync(`${baseDirectory}/commands/guilds`).forEach(async (guild) => {
      readdirSync(`${baseDirectory}/commands/guilds/${guild}`).forEach(
        async (file) => {
          if (!file.endsWith(".js")) return;

          const command = (
            await import(`./${baseDirectory}/commands/guilds/${guild}/${file}`)
          ).default;

          // check for a valid command
          if (command.name && command.description && command.execute) {
            state.commands ||= [];
            state.commands.guild ||= {};
            state.commands.guild[guild] ||= [];
            state.commands.guild[guild].push(command);
            console.log(
              `✅ Guild-scoped command "${command.name}" loaded for guild "${guild}"!`
            );
          } else {
            console.log(
              `❌ ./${baseDirectory}/commands/guilds/${guild}/${file} is not a valid guild command file!`
            );
          }
        }
      );
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
    console.log(message.content);
    // ignore bot messages
    if (message.author.bot) return;

    // check if the message starts with the prefix
    if (!message.content.startsWith(state.prefix)) return;

    // get the command name and arguments
    const args = message.content.slice(state.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // check for custom help command
    if (commandName === state.helpCommand) {
      const fields = [
        ...state.commands.map((command) => ({
          name: command.name,
          value: command.description,
        })),
      ];

      // add direct-message commands if they exist, replacing any matching global commands
      if (state.commands.direct && message.guild === null) {
        const directCommands = state.commands.direct;

        directCommands.forEach((command) => {
          const index = fields.findIndex(
            (field) => field.name === command.name
          );

          if (index !== -1) {
            fields[index] = {
              name: command.name,
              value: command.description,
            };
          } else {
            fields.push({
              name: command.name,
              value: command.description,
            });
          }
        });
      }

      // add guild-scoped commands if they exist, replacing any matching global commands
      if (message.guild && state.commands.guild) {
        const guildCommands = state.commands.guild[message.guild.id];

        if (guildCommands) {
          guildCommands.forEach((command) => {
            const index = fields.findIndex(
              (field) => field.name === command.name
            );

            if (index !== -1) {
              fields[index] = {
                name: command.name,
                value: command.description,
              };
            } else {
              fields.push({
                name: command.name,
                value: command.description,
              });
            }
          });
        }
      }

      message.channel.send({
        embeds: [
          {
            title: "Commands",
            description: "Here's a list of all commands:",
            color: 0x5865f2,
            fields,
          },
        ],
      });
    } else {
      // check if the command exists in global
      let command = state.commands.find(
        (command) => command.name === commandName
      );

      // then check if it exists in direct-message, replacing the global command if it does
      if (state.commands.direct && message.guild === null) {
        const directCommands = state.commands.direct;

        const directCommand = directCommands.find(
          (command) => command.name === commandName
        );

        if (directCommand) command = directCommand;
      }

      // finally check if it exists in guild-scoped, replacing the global command if it does
      if (message.guild && state.commands.guild) {
        const guildCommands = state.commands.guild[message.guild.id];

        if (guildCommands) {
          const guildCommand = guildCommands.find(
            (command) => command.name === commandName
          );

          if (guildCommand) command = guildCommand;
        }
      }

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
