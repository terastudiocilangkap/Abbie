import { xpRange } from "../../Libs/levelling.js";

function formatDuration(ms) {
	if (!ms || ms < 1) return "0";
	let s = Math.floor(ms / 1000);
	let d = Math.floor(s / 86400);
	s %= 86400;
	let h = Math.floor(s / 3600);
	s %= 3600;
	let m = Math.floor(s / 60);
	s %= 60;
	let out = [];
	if (d) out.push(`${d} hari`);
	if (h) out.push(`${h} jam`);
	if (m) out.push(`${m} menit`);
	return out.length ? out.join(" ") : "kurang dari 1 menit";

}

function formatNumber(num) {
	if (typeof num !== "number") num = Number(num) || 0;
	if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "jt";
	if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
	return num.toString();
}

export default {
	command: ["profile", "me", "profil"],
	description: "Menampilkan profil RPG kamu / set custom PP",
	category: "Games",
	owner: false,
	admin: false,
	hidden: false,
	limit: false,
	group: false,
	private: false,
	register: true, // Pastikan user terdaftar

	haruna: async function (m, { sock, db, user, text, Uploader, Func }) {
		let currentUser = user || (db?.users?.get?.(m.sender) || db?.data?.users?.[m.sender]);
		if (!currentUser) return m.reply("🚩 Data pengguna tidak ditemukan.");

		// Custom PP: .profile --custom (reply image)
		if (/--custom/i.test(text)) {
			if (!m.quoted || !m.quoted.msg || !m.quoted.msg.mimetype)
				return m.reply("Balas gambar yang ingin dijadikan foto profil custom!");
			const buffer = await m.quoted.download();
			const urlCatbox = await Uploader.catbox(buffer);
			currentUser.pp = urlCatbox;
			return m.reply(`Foto profil RPG kamu berhasil diubah!\n\n🔗 ${urlCatbox}`);
		}

		// Ambil foto profil custom user, jika tidak ada pakai profile picture WhatsApp
		let pp =
			currentUser.pp && typeof currentUser.pp === "string"
				? currentUser.pp
				: await sock.profilePictureUrl(m.sender, "image").catch(() => "https://files.catbox.moe/b231vp.jpg");

		// Ambil level & XP dari user, hitung range XP
		const level = currentUser.level || 1;
		const exp = currentUser.exp || 0;
		const { min, max, xp } = xpRange(level);

		const name = currentUser.registered ? currentUser.name : m.pushName || "Pengguna";
		const pasanganId = currentUser.pasangan || "";
		const pasangan =
			pasanganId && pasanganId.includes("@")
				? "@" + pasanganId.split("@")[0]
				: "Jomblo";

		// Premium info
		let isPrem = false;
		let sisaPrem = "-";
		if (currentUser.premium && typeof currentUser.premium === "object") {
			isPrem = !!currentUser.premium.status && Number(currentUser.premium.expired) > Date.now();
			if (isPrem) sisaPrem = formatDuration(currentUser.premium.expired - Date.now());
		} else if (currentUser.premium === true && currentUser.expired && currentUser.expired > Date.now()) {
			isPrem = true;
			sisaPrem = formatDuration(currentUser.expired - Date.now());
		}

		let profile = `*[ PROFILE ]*\n`;
		profile += `*Nama :* ${name}\n`;
		profile += `*Level :* ${level} (${exp - min}/${xp} XP)\n`;
		profile += `*Role :* ${currentUser.role || "-"}\n`;
		profile += `*SN :* ${currentUser.sn || "-"}\n`;
		profile += `*Tag :* -\n\n`;

		// Status section
		profile += `*[ STATUS ]*\n`;
		profile += `*Pasangan :* ${pasangan}\n`;
		profile += `*Premium :* ${isPrem ? "√ (sisa: " + sisaPrem + ")" : "×"}\n`;
		profile += `*yuan :* ${formatNumber(currentUser.yuan || 0)}\n`;
		profile += `*Limit :* ${isPrem ? "UNLIMITED" : currentUser.limit || 0}\n\n`;

		// Statistik RPG
		profile += `*[ STATISTICS ]*\n`;
		profile += `*Skill :* ${currentUser.skill || "-"}\n`;
		profile += `*Health :* ${currentUser.health || 0}\n`;
		profile += `*Mana :* ${currentUser.mana || 0}\n`;
		profile += `*Damage :* ${currentUser.damage || 0}\n`;
		profile += `*Crit Chance :* ${currentUser.crit || 0}%\n`;
		profile += `*Level :* ${currentUser.level || 1}\n`;
		// Tambahkan statistik lain jika ada di database

		// Kirim balasan dengan foto profil pakai sendFile/sendMessage
		try {
			const buffer = await Func?.fetchBuffer ? await Func.fetchBuffer(pp) : null;
			if (buffer && sock.sendFile) {
				await sock.sendFile(m.chat, buffer, "profile.jpg", profile, m, {
					mimetype: "image/jpeg",
					mentions: pasangan !== "Jomblo" ? [pasanganId] : [],
					contextInfo: {
						externalAdReply: {
							title: name,
							body: `SN: ${currentUser.sn || "-"}`,
							thumbnailUrl: pp,
							sourceUrl: "https://Micy",
							mediaType: 1,
							renderLargerThumbnail: true
						}
					}
				});
			} else {
				await sock.sendMessage(m.chat, {
					text: profile,
					contextInfo: {
						externalAdReply: {
							title: name,
							body: `SN: ${currentUser.sn || "-"}`,
							thumbnailUrl: pp,
							sourceUrl: "https://Micy",
							mediaType: 1,
							renderLargerThumbnail: true
						}
					}
				});
			}
		} catch (e) {
			await sock.sendMessage(m.chat, {
				text: profile,
				contextInfo: {
					externalAdReply: {
						title: name,
						body: `SN: ${currentUser.sn || "-"}`,
						thumbnailUrl: pp,
						sourceUrl: "https://Micy",
						mediaType: 1,
						renderLargerThumbnail: true
					}
				}
			});
		}
	},

	failed: "Gagal menampilkan profil: %error",
	wait: null,
	done: null,
};