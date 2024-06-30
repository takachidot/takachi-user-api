const { Client } = require("discord.js-selfbot-v13");
const { App } = require("./API/App");
const { Logger } = require("@vlodia/logger");
const client = new Client();
const sistem = (global.sistem = require("./config/index.json"));
const logger = (global.logger = new Logger("[API]:"));
client.once("ready", () => {
  logger.success(`Logged in as ${client.user.username}!`);
  const app = new App(1555, client);
  app.startServer();
});

client.login(sistem.token);