import axios from "axios";
import Sticker from "../../Libs/Sticker.js";

export default {
    command: ["brat"],
    description: "Sticker teks brat (efek animasi atau gambar)",
    category: "Sticker",
    owner: false,
    group: false,
    admin: false,
    hidden: false,
    limit: false,
    private: false,

    haruna: async function (m, { sock, config }) {
        let input = m.quoted?.text;
        // Pastikan m.args adalah array, jika tidak inisialisasikan sebagai array kosong
        const args = Array.isArray(m.args)? m.args : [];
        if (!input) {
            input = args.join(" ") || m.text;
        }
        if (!input) return m.reply("> Reply/Masukan pesan");

        // Cek apakah animated
        const isAnimated = /--animated/i.test(input);
        if (isAnimated) input = input.replace(/--animated/gi, "").trim();

        await m.reply("Tunggu sebentar...");

        try {
            if (isAnimated) {
                // Animated: satu per satu kata jadi frame animasi (sementara hanya frame terakhir dikirim)
                const txtArr = input.split(" ").filter(Boolean);
                let frames = [];
                for (let i = 0; i < txtArr.length; i++) {
                    const word = txtArr.slice(0, i + 1).join(" ");
                    const res = await axios.get(
                        `https://aqul-brat.hf.space/api/brat?text=${encodeURIComponent(word)}`,
                        { responseType: "arraybuffer" }
                    );
                    // Memastikan respons berhasil (status code 200)
                    if (res.status!== 200) {
                        throw new Error(`Server returned status code ${res.status}`);
                    }
                    frames.push(res.data);
                }
                // Kirim frame terakhir sebagai sticker statis
                const sticker = await Sticker.create(frames[frames.length - 1], {
                    packname: config?.sticker?.packname || "Created by",
                    author: config?.sticker?.author || "mici",
                    emojis: ["😈"]
                });
                await sock.sendMessage(m.chat, { sticker }, { quoted: m });
            } else {
                // Static brat
                const res = await axios.get(
                    `https://aqul-brat.hf.space/api/brat?text=${encodeURIComponent(input)}`,
                    { responseType: "arraybuffer" }
                );
                // Memastikan respons berhasil (status code 200)
                if (res.status!== 200) {
                    throw new Error(`Server returned status code ${res.status}`);
                }
                const sticker = await Sticker.create(res.data, {
                    packname: config?.sticker?.packname || "Created by",
                    author: config?.sticker?.author || "mici",
                    emojis: ["😈"]
                });
                await sock.sendMessage(m.chat, { sticker }, { quoted: m });
            }
        } catch (e) {
            m.reply(`Gagal membuat sticker brat: ${e.message}`);
        }
    },
    failed: "Gagal membuat sticker brat\n%error",
    wait: null,
    done: null
};
