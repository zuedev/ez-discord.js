<h1>
    <a href="https://github.com/zuedev/EmbraceDiscord.js">
        <img width="100" align="left" src="./assets/icon_original.png" />
    </a>
    ez-discord.js
    <a href="https://github.com/zuedev/EmbraceDiscord.js/blob/main/LICENSE">
        <img src="https://img.shields.io/github/license/zuedev/EmbraceDiscord.js?color=blue" />
    </a>
</h1>

> Discord applications finally made EZ (easy) ✨

## ✨ Introduction

**ez-discord.js** is an npm package that takes all the difficulty out of creating a Discord bot. It's a wrapper around the [discord.js](https://discord.js.org) library that enables you to create a Discord bot in a matter of minutes with minimal effort.

All you need to do is create a folder structure and add a few lines of code to get started. The package will automatically handle all the boilerplate code for you, allowing you to focus on the fun stuff.

The package is designed to be highly customizable and extendable, so you can easily add your own features and functionality to fit your needs.

## Development

### Progress

- [x] Repository setup
- [ ] Dynamic command handler based on file structure
  - [x] Message event
    - [x] Global
    - [x] Guild
    - [x] Direct message
  - [ ] Interaction events (slash commands)
    - [ ] "Simple" - Uses a webserver to handle interactions via POST requests from Discord
      - [ ] Global
      - [ ] Guild
    - [ ] "Advanced" - Uses a Discord bot to handle interactions via the Discord Gateway
      - [ ] Global
      - [ ] Guild
- [x] Basic bot example
