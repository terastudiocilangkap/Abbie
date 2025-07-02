export default {
  command: ["pinterest", "pin"],
  description: "Cari gambar dari Pinterest berdasarkan kata kunci.",
  category: "Images",
  haruna: async function (m, { sock, text }) {
    if (!text) return m.reply("[!] mau nyari apa anjir");
    const update = await m.replyUpdate("Sedang mencari gambar, tunggu sebentar...");
    try {
      const url = `https://fastrestapis.fasturl.cloud/search/pinterest/simple?name=${encodeURIComponent(text)}`;
      const res = await fetch(url, { headers: { accept: "application/json" } });
      const json = await res.json();
      if (!json.result || !Array.isArray(json.result) || json.result.length === 0)
        throw new Error("Tidak ditemukan gambar.");
      const imageUrl = json.result[0].directLink;
      const caption = `Nih bang apa yg lu mau`;
      await sock.sendMessage(m.chat, {
        image: { url: imageUrl },
        caption
      }, { quoted: m.key });
      update("✔️ Gambar berhasil dikirim!");
    } catch (error) {
      console.error(error);
      update("❌ Gagal mencari gambar, coba lagi nanti.");
    }
  }
};