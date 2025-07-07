
export default {
  command: ["cek"],
  description: "Cek ukuran dada/titid, bisa tag orang.",
  category: "Fun",
  haruna: async function(m, { sock }) {
    // Pastikan args selalu array
    const args = Array.isArray(m.args)? m.args: (typeof m.text === "string"? m.text.split(" ").slice(1): []);
    const [tipe,...namaArr] = args;
    let nama = namaArr.join(" ");
    let mention = [];

    // Jika ada mention/tag
    if (m.mentionedJid?.length) {
      nama = "Orang ini";
      mention = m.mentionedJid;
    }
    // Jika reply chat
    else if (m.quoted?.sender) {
      nama = "Orang ini";
      mention = [m.quoted.sender];
    }
    // Jika manual nama
    else {
      nama = nama || "Kamu";
    }

    if (!tipe ||!["dada", "titid"].includes(tipe.toLowerCase())) {
      return m.reply("Format:.cek dada/titid (nama/mention/reply)");
    }

    const ukuran = Math.floor(Math.random() * 30) + 1;
    let hasil = "";
    if (tipe.toLowerCase() === "dada") {
      hasil = `*${nama}* punya dada sebesar *${ukuran} cm* 😳`;
    } else {
      hasil = `*${nama}* punya titid sepanjang *${ukuran} cm* 🍆`;
    }

    m.reply(hasil, null, { mentions: mention });
    m.react("😂");
  }
};
