import { Config } from "../config.js";

export default {
  command: ["menu"],
  description: "Show available menu categories or commands by category",
  category: "Main",
  owner: false,
  admin: false,
  hidden: false,
  limit: false,
  group: false,
  private: false,

  haruna: async function (
    m,
    { sock, text, usedPrefix, isOwner, isAdmin, feature, user, db }
  ) {
    try {
      const categoryFilter = (text || "").toLowerCase().trim();
      const features = feature;

      // Ambil semua kategori unik
      const availableCategories = new Set();
      Object.values(features).forEach((plugin) => {
        if (plugin.category) {
          availableCategories.add(plugin.category.trim().toLowerCase());
        }
      });

      if (!categoryFilter) {
        // Data user
        const dbUser = db?.users?.get?.(m.sender) || {};
        const userName = dbUser.name || m.pushName || "User";
        const userLimit = dbUser.limit!== undefined? dbUser.limit: "∞";
        const userStatus = isOwner? "Developer 😎": isAdmin? "Admin 😎": dbUser.premium? "Premium 🦅": "User 🗿👍";

        let categoryList = `*╭─⏤͟͟͞͞★ MENU UTAMA ★⏤͟͟͞͞─╮*

👋 Hai, @${userName}!
Aku *${Config.profile.namebot}*, asisten digital kamu yang siap bantu 24/7~✨

*Info Kamu:*
┌◦ Nama: ${userName}
│◦ Limit: ${userLimit}
└◦ Status: ${userStatus}

*List Kategori Menu:*
`;

        Array.from(availableCategories).forEach((category) => {
          categoryList += `  ◦ ${usedPrefix}menu ${category}\n`;
        });

        categoryList += `\n*╰─⏤͟͟͞͞★ Abbie Bot ★⏤͟͟͞͞─╯*`;

        await sock.sendMessage(m.chat, {
          text: categoryList,
          contextInfo: {
            externalAdReply: {
              title: Config.profile.namebot,
              body: Config.profile.powered,
              sourceUrl: Config.profile.web,
              mediaType: 1,
              renderLargerThumbnail: true
            }
          }
        });
        return;
      }

      // Filter fitur berdasarkan kategori
      const filteredFeatures = Object.values(features).filter((plugin) => {
        const pluginCategory = (plugin.category || "").toLowerCase().trim();
        return pluginCategory === categoryFilter;
      });

      if (filteredFeatures.length === 0) {
        await sock.sendMessage(m.chat, { text: `Tidak ada command untuk kategori \`${categoryFilter}\`` });
        return;
      }

      let message = `*╭─⏤͟͟͞͞★ ${categoryFilter.toUpperCase()} MENU ★⏤͟͟͞͞─╮*\n`;
      for (const plugin of filteredFeatures) {
        const command = Array.isArray(plugin.customPrefix)? plugin.customPrefix: plugin.customPrefix || Array.isArray(plugin.command)? usedPrefix + plugin.command: usedPrefix + plugin.command;

        message +=
          ((plugin.owner &&!isOwner) || (plugin.admin &&!isAdmin)? `~${command}~`: `◦ \`${command}\``) + "\n";

        message += `    > ${plugin.description}\n`;

        const aliases =
          (Array.isArray(plugin.command)? plugin.command.slice(1).join(", "): null) ||
          null;
        if (aliases) {
          message += `    > Alias: ${aliases}\n`;
        }
      }
      message += `*╰─⏤͟͟͞͞★ Abbie Bot ★⏤͟͟͞͞─╯*`;

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
    } catch (error) {
      await sock.sendMessage(m.chat, { text: `Gagal menampilkan menu\n${error.message}` });
    }
  },

  failed: "Failed to run the %cmd command\n%error",
  wait: null,
  done: null,
};
