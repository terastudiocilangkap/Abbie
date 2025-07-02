import fs from 'fs';
import path from 'path';

// Perbaiki path adv.json agar selalu benar meski dipanggil dari folder lain
const ADV_PATH = path.resolve(path.dirname(new URL(import.meta.url).pathname), 'adv.json');
const QUESTS = JSON.parse(fs.readFileSync(ADV_PATH));
const COOLDOWN = 200//14400000; // 4 jam
const DELAY = 2 * 60 * 1000; // 5 menit
const SUCCESS_RATE = 0.7;

const FAIL_MESSAGES = [
  "❌ Kamu tersesat di dungeon dan harus mundur dengan luka ringan.",
  "💀 Misi gagal... monster terlalu kuat dan kamu terpaksa kabur.",
  "🧭 Kamu kehabisan waktu, musuh sudah melarikan diri!",
  "⚠️ Petualangan ini terlalu berat... kamu gagal menyelesaikannya."
];

function ranNumb(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const adventure = {
  command: ["adventure", "petualang", "berpetualang"],
  description: "Jalani misi petualangan sesuai role RPG-mu!",
  category: "Games",
  async haruna(m, { usedPrefix, db, user }) {
    let currentUser = user || (db?.users?.get?.(m.sender) || db?.data?.users?.[m.sender] || db?.users?.[m.sender]);
    if (!currentUser) return m.reply("🚩 Data pengguna tidak ditemukan.");

    // Validasi role (support typo dan alias)
    let role = (currentUser.role || "").toLowerCase();
    // Normalisasi nama role agar cocok dengan key di QUESTS
    if (role === "tanker" || role === "tank") role = "tank";
    if (role === "fighter") role = "fighter";
    if (role === "mage") role = "mage";
    if (role === "archer") role = "archer";
    if (role === "assassin") role = "assassin";
    // Cek role valid
    if (!role || !QUESTS[role]) return m.reply("⚠️ Kamu belum memilih role atau role tidak valid. Gunakan `.setrole` untuk memilih!");

    const now = Date.now();
    const timers = COOLDOWN - (now - (currentUser.lastadventure || 0));
    if ((currentUser.health || 0) < 50) return m.reply(`❤️ Health kamu kurang! Minimal 50.\nGunakan *${usedPrefix}heal* atau *${usedPrefix}use potion*`);
    if ((currentUser.mana || 0) < 30) return m.reply(`🔮 Mana kamu kurang! Minimal 30.`);

    if (now - (currentUser.lastadventure || 0) <= COOLDOWN) {
      let menit = Math.floor(timers / 60000);
      let detik = Math.floor((timers % 60000) / 1000);
      return m.reply(`🕐 Kamu perlu menunggu *${menit} menit ${detik} detik* sebelum bisa berpetualang lagi.`);
    }

    // Ambil quest acak sesuai role
    const questList = QUESTS[role];
    if (!Array.isArray(questList) || questList.length === 0) return m.reply("Tidak ada quest untuk role ini!");
    const quest = questList[Math.floor(Math.random() * questList.length)];

    // Kurangi resource
    currentUser.health -= ranNumb(10, 20);
    currentUser.mana -= ranNumb(15, 25);
    currentUser.lastadventure = now;

    // Simulasi delay
    m.reply(`🧭 Memulai quest *${quest.title}*...\nLokasi: *${quest.place}*\n🎯 Target: ${quest.target}\n\n_${quest.story}_\n\n🕐 Mohon tunggu 5 menit...`);

    setTimeout(() => {
      const success = Math.random() < SUCCESS_RATE;
      if (success) {
        let rewardText = `🎉 *Quest Berhasil!*\n\nKamu menyelesaikan misi *${quest.title}* dan mendapatkan:\n`;
        for (let reward of quest.rewards) {
          let { type, amount } = reward;

          // Batasi item backpack max 10 (kecuali diamond, gold, ruby)
          const backpackItems = [
            "emerald", "core", "trash", "wood", "iron", "rock", "minyak", "susu", "string", "coal", "steel"
          ];
          if (backpackItems.includes(type)) {
            // Core pakai pity 40:60
            if (type === "core") {
              const pity = Math.random() < 0.6; // 60% dapat core
              if (!pity) {
                rewardText += `mff km gdpt core\n`;
                continue;
              }
            }
            // Batasi max 10 per item
            const before = currentUser[type] || 0;
            const add = Math.min(amount, 10 - before);
            if (add > 0) {
              currentUser[type] = before + add;
              rewardText += `• ${type.charAt(0).toUpperCase() + type.slice(1)} +${add}\n`;
            }
          } else if (["diamond", "gold", "ruby"].includes(type)) {
            // Lewati, tidak diberikan via adventure
            continue;
          } else {
            // Untuk reward lain (exp, yuan, potion, dsb)
            currentUser[type] = (currentUser[type] || 0) + amount;
            rewardText += `• ${type.charAt(0).toUpperCase() + type.slice(1)} +${amount}\n`;
          }
        }
        m.reply(rewardText);
        let summary = "\n📦 *Inventory Sekarang:*\n";
        const showItems = [
          "emerald", "core", "trash", "wood", "iron", "rock", "minyak", "susu", "string", "coal", "steel",
          "potion", "yuan",
          "common", "uncommon", "mythic", "legendary"
        ];
        for (const key of showItems) {
          if (currentUser[key]) summary += `- ${key.charAt(0).toUpperCase() + key.slice(1)}: *${currentUser[key]}*\n`;
        }
        m.reply(summary);
      } else {
        const failMsg = FAIL_MESSAGES[Math.floor(Math.random() * FAIL_MESSAGES.length)];
        m.reply(`💥 *Quest Gagal!*\n${failMsg}`);
      }
      // Simpan user ke database dengan cara yang konsisten
      if (db?.users?.set) {
        db.users.set(m.sender, currentUser);
      } else if (db?.data?.users) {
        db.data.users[m.sender] = currentUser;
      } else if (db?.users) {
        db.users[m.sender] = currentUser;
      }
    }, DELAY);
  },
  wait: null,
  done: null
};

export default adventure;
