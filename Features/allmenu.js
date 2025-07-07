
import { Config } from "../config.js";

export default {
  command: ["allmenu"],
  description: "Show this menu",
  category: "Main",
  owner: false,

  haruna: async function (
    m,
    { sock, text, usedPrefix, isOwner, isAdmin, feature }
  ) {
    const c = text?.toLowerCase()?? "";

    const features = feature;
    const filterded = Object.fromEntries(
      Object.entries(features).filter(([_, feature]) =>!feature.hidden)
    );
    const plugins = Object.entries(filterded).reduce((acc, [key, value]) => {
      const category = value.category?.trim() || "Unknown";
      acc[category] = acc[category] || [];
      acc[category].push(value);
      return acc;
    }, {});
    const categories = Object.keys(plugins).sort();

    let message = `*╭── ⏤͟͟͞͞★ ALL MENU ★⏤͟͟͞͞──╮*\n`;
    for (const category of categories) {
      if (c && category?.toLowerCase()!== c) continue;
      message += `\n*• ${category}*\n`;

      for (const plugin of plugins[category]) {
        let command;
        if (Array.isArray(plugin.customPrefix)) {
          command = plugin.customPrefix;
        } else if (plugin.customPrefix) {
          command = plugin.customPrefix;
        } else if (Array.isArray(plugin.command)) {
          command = usedPrefix + plugin.command;
        } else {
          command = usedPrefix + plugin.command;
        }
        message += `  ◦ \`${command}\` — _${plugin.description}_\n`;
      }
    }
    message += `\n*╰───⏤͟͟͞͞★ ${Config.profile.namebot} ★⏤͟͟͞͞───╯*`;

    if (!message && c) {
      message = `No command found for category \`${c}\``;
    }

    await sock.sendMessage(m.chat, {
      text: message.trim(),
      contextInfo: {
        externalAdReply: {
          title: Config.profile.namebot,
          body: Config.profile.powered,
          sourceUrl: Config.profile.web,
          mediaType: 1
        }
      }
    });
  },

  failed: "Failed to run the %cmd command\n%error",
  wait: null,
  done: null,
};
