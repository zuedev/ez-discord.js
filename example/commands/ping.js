export default {
  name: "ping",
  description: "You ping, I pong! 🏓",
  execute: (message) => {
    message.channel.send("Pong, yo! 🏓");
  },
};
