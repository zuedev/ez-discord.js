export default {
  name: "ping",
  description: "I'm a different ping command!",
  execute: (message) => {
    message.channel.send("I do a big pong! >:D");
  },
};
