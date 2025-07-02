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

			const availableCategories = new Set();
			Object.values(features).forEach((plugin) => {
				if (plugin.category) {
					availableCategories.add(plugin.category.trim().toLowerCase());
				}
			});

			if (!categoryFilter) {
				// Ambil data user dari database
				const dbUser = db?.users?.get?.(m.sender) || {};
				const userName = dbUser.name || m.pushName || "User";
				const userLimit = dbUser.limit !== undefined ? dbUser.limit : "∞";
				const userStatus = isOwner
					? "Developer"
					: isAdmin
					? "Admin"
					: dbUser.premium
					? "Premium"
					: "User";

				let categoryList = `helloww!🙇‍♀️👋@${userName}! I'm *Amicy-Yukio*!💥 but you can call me anything you want ofc!, i'm your cheerful digital assistant🙌, disini aku bakal bantu kamu kapan pun dan dimana pun kamu butuh, cari aku disaat kamu perlu and taraa!!🪄✨i will immediately come straight from the anime world🌟

kamu punya banyak masalah ? bingung gimana ngatasin nya ?? atau bahkan butuh tempat curhat🤷‍♀️❓
if you need to convert media, search the web, dan butuh yang praktis🏃‍♀️ juga pasti cepet kasih bantuan⁉️ Just say the word!cause I 'm here 24/7🙋‍♀️✨ to help you with useful tools and smart features 🖥️📱 — all from your WhatsApp 😉✨

Let’s simplify your day with a little touch of tech and a sprinkle of anime spirit~🪄✨

jangan lupa cari dan chat aku ya ? 🙇‍♀️aku bakal nungguin dan bantuin kamu kok!see yaa in our chat room!!💌🎀

[Your Info]
┌◦ Name: ${userName}
│◦ Limit: ${userLimit}
└◦ Status: ${userStatus}

> *List Category Menu :*`;
				Array.from(availableCategories).forEach((category) => {
					categoryList += `\n- ${usedPrefix}menu ${category}`;
				});
				await sock.sendMessage(m.chat, {
					text: categoryList,
					contextInfo: {
						externalAdReply: {
							title: Config.profile.namebot,
							body: Config.profile.powered,
							thumbnailUrl: Config.images.menu,
							sourceUrl: Config.profile.web,
							mediaType: 1,
							renderLargerThumbnail: true
						}
					}
				});
				return;
			}

			const filteredFeatures = Object.values(features).filter((plugin) => {
				const pluginCategory = (plugin.category || "").toLowerCase().trim();
				return pluginCategory === categoryFilter;
			});

			if (filteredFeatures.length === 0) {
				await sock.sendMessage(m.chat, { text: `No commands found for category \`${categoryFilter}\`` });
				return;
			}

			let message = "";
			for (const plugin of filteredFeatures) {
				const command = Array.isArray(plugin.customPrefix)
					? plugin.customPrefix[0]
					: plugin.customPrefix || Array.isArray(plugin.command)
						? usedPrefix + plugin.command[0]
						: usedPrefix + plugin.command;

				message +=
					((plugin.owner && !isOwner) || (plugin.admin && !isAdmin)
						? `~${command}~`
						: `${command}`) + "\n";

				message += `> ${plugin.description}\n`;

				const aliases =
					(Array.isArray(plugin.command) ? plugin.command.slice(1).join(", ") : null) ||
					null;
				if (aliases) {
					message += `> Aliases: ${aliases}\n`;
				}
			}

			await sock.sendMessage(m.chat, {
				text: message.trim(),
				contextInfo: {
					externalAdReply: {
						title: Config.profile.namebot,
						body: Config.profile.powered,
						thumbnailUrl: Config.images.allmenu,
						sourceUrl: Config.profile.web,
						mediaType: 1,
						renderLargerThumbnail: true
					}
				}
			});
		} catch (error) {
			await sock.sendMessage(m.chat, { text: `Failed to haruna the command\n${error.message}` });
		}
	},

	failed: "Failed to haruna the %cmd command\n%error",
	wait: null,
	done: null,
};
