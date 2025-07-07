
import Sticker from "../../Libs/Sticker.js";

export default {
  command: ["sticker", "stiker", "s"],
  description: "Create a sticker",
  category: "Others",
  owner: false,
  group: false,
  admin: false,
  hidden: false,
  limit: false,
  private: false,

  haruna: async function (m, { sock }) {
    // Ambil media dari pesan yang direply, kalau tidak ada, dari pesan sendiri
    const q = m.quoted? m.quoted: m;
    const mime = q.mtype || "";

    // Cek tipe media yang didukung
    if (!/image|video|webp/.test(mime)) {
      return m.reply("Balas foto/video untuk dijadikan stiker!");
    }

    // Download media
    const media = await q.download();

    // Buat stiker
    const sticker = await Sticker.create(media, {
      packname: "Created by",
      author: "Abbie",
      emojis: "🥺",
    });

    // Kirim stiker ke chat, reply ke pesan asli
    await sock.sendMessage(m.chat, { sticker: sticker }, { quoted: m });
  },

  failed: "Failed to haruna the %cmd command\n%error",
  wait: null,
  done: null,
};
