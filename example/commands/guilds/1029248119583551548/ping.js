export default {
  name: "ping",
  description: "I'm a different ping command!",
  execute: (message) => {
    message.reply("I do a big pong! >:D");
  },
};
