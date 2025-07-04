import axios from "axios";
import Sticker from "../../Libs/Sticker.js";

export default {
  command: ["qc"],
  description: "Membuat bubble chat (quote sticker)",
  category: "Sticker",
  owner: false,
  group: false,
  admin: false,
  hidden: false,
  limit: false,
  private: false,

  haruna: async function (m, { sock, cdn, config }) {
    const q = m.quoted ? m.quoted : m;
    const mime = q.mtype || "";
    let text;
    if (m.args.length >= 1) {
      text = m.args.join(" ");
    } else if (m.quoted) {
      text = m.quoted.text || "";
    } else {
      return m.reply("> Masukan pesan nya");
    }

    // Ambil foto profil pengirim dan upload ke cdn.maelyn
    const ppUrl = await sock
      .profilePictureUrl(q.sender, "image")
      .catch(() => "https://telegra.ph/file/320b066dc81928b782c7b.png");
    const ppBuffer = await (await fetch(ppUrl)).arrayBuffer();
    const pp = await cdn.maelyn(Buffer.from(ppBuffer));

    // Jika ada media, upload ke cdn.maelyn
    let mediaUrl = null;
    if (/image|video|webp|sticker/.test(mime)) {
      const img = await q.download();
      mediaUrl = await cdn.maelyn(img);
    }

    // Siapkan payload untuk quotly
    const obj = {
      type: "quote",
      format: "png",
      backgroundColor: "#161616",
      width: 512,
      height: 768,
      scale: 2,
      messages: [
        {
          entities: [],
          ...(mediaUrl
            ? { media: { url: mediaUrl } }
            : {}),
          avatar: true,
          from: {
            id: m.sender.split("@")[0],
            name: q.pushName,
            photo: { url: pp },
          },
          text: text || "",
          replyMessage: {},
        },
      ],
    };

    try {
      const json = await axios.post(
        "https://quotly.netorare.codes/generate",
        obj,
        { headers: { "Content-Type": "application/json" } }
      );
      const buffer = Buffer.from(json.data.result.image, "base64");
      const sticker = await Sticker.create(buffer, {
        packname: config?.sticker?.packname || "Kurodate Haruna",
        author: config?.sticker?.author || "Clayza Aubert",
        emojis: "💬",
      });
      await sock.sendMessage(m.chat, { sticker }, { quoted: m });
    } catch (e) {
      m.reply("Gagal membuat sticker quote: " + e.message);
    }
  },
  failed: "Gagal membuat sticker quote\n%error",
  wait: null,
  done: null,
};