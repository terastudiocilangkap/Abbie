
// Format angka dengan pemisah ribuan (manual)
function format(num) {
  return num.toLocaleString("id-ID");
}

function clockString(ms) {
  let h = Math.floor(ms / 3600000);
  let m = Math.floor(ms / 60000) % 60;
  let s = Math.floor(ms / 1000) % 60;
  return [h, m, s].map(v => v.toString().padStart(2, 0)).join(":");
}

export default {
  command: ["rampok", "rob","copet"],
  description: "Merampok yuan user lain dengan peluang 50:50, delay 1 jam, pajak 10%",
  category: "Games",
  owner: false,
  admin: false,
  hidden: false,
  limit: true,
  group: true,
  private: false,

  haruna: async function (m, { sock, db, user, text, usedPrefix, command }) {
    // Validasi mention
    let who = m.isGroup ? (m.mentionedJid && m.mentionedJid[0]) : m.chat;
    if (!who || who === m.sender) return m.reply("Tag salah satu member yang ingin dirampok!");

    // Ambil data user
    let users = db?.users || db?.data?.users;
    let target = users?.[who];
    let currentUser = user || users?.[m.sender];
    if (!target) return m.reply("Pengguna tidak ada di database!");
    if (!currentUser) return m.reply("Data kamu tidak ditemukan!");
    if (!target.registered) return m.reply("Target belum terdaftar di RPG!");
    if (!currentUser.registered) return m.reply("Kamu belum terdaftar di RPG!");

    // Delay 1 jam
    let lastRob = currentUser.lastrob || 0;
    let now = Date.now();
    let cooldown = 3600000; // 1 jam
    let remaining = cooldown - (now - lastRob);
    if (remaining > 0) {
      return m.reply(`Kamu sudah merampok, tunggu ${clockString(remaining)} lagi untuk merampok lagi!`);
    }

    // Target harus punya uang
    let targetyuan = target.yuan || 0;
    if (targetyuan < 10000) return m.reply("Target terlalu miskin untuk dirampok!");

    // Hitung max rampok (30% yuan target)
    let maxAmbil = Math.floor(targetyuan * 0.3);
    if (maxAmbil < 10000) maxAmbil = 10000;
    let dapat = Math.floor(Math.random() * (maxAmbil - 10000 + 1)) + 10000;

    // Gimik delay sukses/gagal 50:50
    await m.reply("Sedang mencoba merampok... (50:50)");
    await new Promise(res => setTimeout(res, 2000 + Math.random() * 2000));
    let sukses = Math.random() < 0.5;

    if (sukses) {
      // Pajak 10%
      let pajak = Math.floor(dapat * 0.1);
      let bersih = dapat - pajak;
      target.yuan -= dapat;
      currentUser.yuan = (currentUser.yuan || 0) + bersih;
      currentUser.lastrob = now;
      return m.reply(
        `Sukses merampok @${who.split("@")[0]}!
+${format(bersih)} (setelah pajak 10%)
Pajak: ${format(pajak)}
`.trim(), null, { mentions: [who] })
    } else {
      currentUser.lastrob = now;
      return m.reply("Gagal merampok! Kamu ketahuan dan harus menunggu 1 jam untuk mencoba lagi.");
    }
  },

  failed: "Gagal menjalankan merampok: %error",
  wait: null,
  done: null,
};
