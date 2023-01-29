export default {
  name: "whereami",
  description: "Tells you where you are.",
  execute: (message) => {
    message.reply(`You are in ${message.guild.name}!`);
  },
};
