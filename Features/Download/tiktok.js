export default {
	command: ["tiktok", "tt"],
	description: "Tiktok/Douyin Downloader (Slide, Audio, Video)",
	category: "Download",
	owner: false,
	admin: false,
	hidden: false,
	limit: false,
	group: false,
	private: false,

	haruna: async function (m, { sock, text }) {
		if (!text) return m.reply("Silakan berikan tautan TikTok.");
		m.react("💬");

		try {
			const url = `https://api.apigratis.tech/downloader/tiktok?url=${encodeURIComponent(text)}`;
			const res = await fetch(url, { headers: { accept: "application/json" } });
			const json = await res.json();
			if (!json.status || !json.result) throw new Error("Tidak dapat mengambil data dari API.");

			const result = json.result;
			const author = result.author || {};
			const download = result.download || {};
			const type = result.type;

			// Hilangkan pesan donasi dari desc
			const desc = (result.desc || "").replace(/Don't forget to support us.*$/, "").trim();

			// Jika slide/gambar
			if (type === "images" && download.images?.length) {
				await m.react("🖼️");

				const albumItems = download.images.map((imgUrl, i) => ({
					image: { url: imgUrl },
					caption: i === 0
						? `🖼️ *${desc || "Tanpa Judul"}*\n👤 @${author.unique_id || "-"} (${author.nickname || "-"})`
						: undefined
				}));

				await sock.sendAlbumMessage(
					m.chat,
					albumItems,
					{ quoted: m, delay: 1.5 }
				);

				if (download.music) {
					await sock.sendMessage(
						m.chat,
						{
							audio: { url: download.music },
							mimetype: "audio/mp4",
							fileName: (download.music_info?.title || "audio") + ".mp3",
						},
						{ quoted: m }
					);
				}

				return;
			}

			// Jika video
			if (type === "video" && download.original) {
				await m.react("📽️");

				const caption =
					`🎬 *${desc || "Tanpa Judul"}*\n` +
					`👤 @${author.unique_id || "-"} (${author.nickname || "-"})\n` +
					`🌍 Region: ${result.region || "-"}\n` +
					`⏱️ Durasi: ${result.duration || "-"} detik\n` +
					`🎵 Musik: ${download.music_info?.title || "Unknown"}`;

				await sock.sendMessage(
					m.chat,
					{ video: { url: download.original }, caption },
					{ quoted: m }
				);

				if (download.music) {
					await sock.sendMessage(
						m.chat,
						{
							audio: { url: download.music },
							mimetype: "audio/mp4",
							fileName: (download.music_info?.title || "audio") + ".mp3",
						},
						{ quoted: m }
					);
				}

				return;
			}

			throw new Error("Tidak ada konten yang dapat dikirim (gambar atau video tidak ditemukan).");
		} catch (error) {
			console.error("Error:", error);
			await m.react("❌");
			m.reply("Terjadi kesalahan saat memproses permintaan Anda. Silakan coba lagi nanti.");
		}
	},

	failed: "Gagal menjalankan perintah %cmd\n\n%error",
	wait: null,
	done: null,
};
