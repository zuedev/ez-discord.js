export default {
  name: "secret",
  description: "A secret command!",
  execute: (message) => {
    message.channel.send("You found the secret command!");
  },
};
