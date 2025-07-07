import fs from "fs";

export default {
  command: ["randomimg"],
  description: "Kirim gambar random dari list JSON berdasarkan tag: NSFW.",
  category: "NSFW",
  haruna: async function(m, options) {
    const { text, sock } = options;

    // Tampilkan list jika help
    if (text && text.toLowerCase() === "help") {
      const files = fs.readdirSync("media/nsfw").filter(f => f.endsWith(".json"));
      if (files.length === 0) return m.reply("Belum ada list gambar di folder media/nsfw.");
      const tags = files.map(f => f.replace(".json", "")).join(", ");
      return m.reply(`List gambar yang tersedia:\n${tags}`);
    }

    if (!text) return m.reply("Masukkan tag/jenis gambar!\nContoh:.randomimg waifu\nAtau.randomimg help untuk melihat semua list.");

    const filePath = `media/nsfw/${text}.json`;
    if (!fs.existsSync(filePath)) return m.reply("Tag tidak ditemukan!");

    const data = JSON.parse(fs.readFileSync(filePath));
    if (!Array.isArray(data) || data.length === 0) return m.reply("List gambar kosong!");

    const randomImg = data[Math.floor(Math.random() * data.length)];
    // Kirim gambar, randomImg harus string (URL/path)
    await sock.sendMessage(
      m.chat,
      { image: randomImg, caption: `Random gambar: ${text}` },
      { quoted: m }
    );
  }
