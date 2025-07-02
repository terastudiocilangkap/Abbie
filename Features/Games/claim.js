import { randomUUID } from "crypto";

const rewardTable = {
  daily: {
    yuan: () => Math.floor(Math.random() * 6001) + 2000, // 2k–8k
    food: () => randomFoodDrink(1, 2),
    drink: () => randomFoodDrink(1, 2, "drink"),
    potion: 0,
    cooldown: 24 * 60 * 60 * 1000, // 24 jam
    label: "Daily"
  },
  weekly: {
    yuan: () => Math.floor(Math.random() * 30001) + 10000, // 10k–40k
    food: () => randomFoodDrink(2, 3),
    drink: () => randomFoodDrink(2, 3, "drink"),
    potion: 0,
    cooldown: 7 * 24 * 60 * 60 * 1000, // 7 hari
    label: "Weekly"
  },
  monthly: {
    yuan: () => Math.floor(Math.random() * 20001) + 50000, // 50k–70k
    food: () => randomFoodDrink(3, 5),
    drink: () => randomFoodDrink(3, 5, "drink"),
    potion: 4,
    cooldown: 30 * 24 * 60 * 60 * 1000, // 30 hari
    label: "Monthly"
  },
  newfam: {
    yuan: () => 50000,
    food: () => randomFoodDrink(2, 2),
    drink: () => randomFoodDrink(2, 2, "drink"),
    potion: 6,
    cooldown: 0,
    label: "NewFam"
  }
};

// List makanan/minuman (tanpa potion)
const foodDrinkList = [
  "apple", "bread", "sushi", "ramen", "steak", "bubu", "dango", "pompom", "lotus", "marak",
  "milk", "tea", "coffee", "juice", "ether", "astral", "lumina"
];
function randomFoodDrink(min, max, type) {
  const filtered = type ? foodDrinkList.filter(f => isDrink(f) === (type === "drink")) : foodDrinkList.filter(f => !isDrink(f));
  let result = {};
  let count = Math.floor(Math.random() * (max - min + 1)) + min;
  for (let i = 0; i < count; i++) {
    const pick = filtered[Math.floor(Math.random() * filtered.length)];
    result[pick] = (result[pick] || 0) + 1;
  }
  return result;
}
function isDrink(name) {
  return ["milk", "tea", "coffee", "juice", "ether", "astral", "lumina"].includes(name);
}

export default {
  command: ["claim"],
  description: "Claim Daily, Weekly, Monthly, NewFam Reward",
  category: "Games",
  owner: false,
  admin: false,
  hidden: false,
  limit: false,
  group: false,
  private: false,

  haruna: async function (m, { args, sock, db }) {
    // Cari user di semua kemungkinan struktur db
    let currentUser =
      (db?.users?.get?.(m.sender)) ||
      (db?.data?.users?.[m.sender]) ||
      (db?.users?.[m.sender]);
    if (!currentUser) return m.reply("🚩 Data pengguna tidak ditemukan.");

    // User harus pilih tipe claim, tidak auto daily
    const type = args[0] ? args[0].toLowerCase() : null;
    if (!type || !rewardTable[type]) {
      return m.reply("Opsi claim: daily, weekly, monthly, newfam\nContoh: .claim daily");
    }

    // NewFam hanya bisa sekali
    if (type === "newfam" && currentUser.newfamClaimed) {
      return m.reply("Kamu sudah menjadi bagian dari kami!");
    }

    // Cek cooldown kecuali newfam
    if (type !== "newfam") {
      const last = currentUser[`lastClaim_${type}`] || 0;
      const cooldown = rewardTable[type].cooldown;
      const now = Date.now();
      if (now - last < cooldown) {
        const sisa = cooldown - (now - last);
        const jam = Math.floor(sisa / (60 * 60 * 1000));
        const menit = Math.floor((sisa % (60 * 60 * 1000)) / (60 * 1000));
        const detik = Math.floor((sisa % (60 * 1000)) / 1000);
        return m.reply(`Kamu sudah claim ${type}. Coba lagi dalam ${jam} jam ${menit} menit ${detik} detik.`);
      }
    }

    // Generate reward
    const reward = rewardTable[type];
    const yuan = reward.yuan();
    const food = reward.food();
    const drink = reward.drink();
    const potion = reward.potion;

    // Tambahkan reward ke user
    currentUser.yuan = (currentUser.yuan || 0) + yuan;
    for (const [item, jumlah] of Object.entries(food)) {
      currentUser[item] = (currentUser[item] || 0) + jumlah;
    }
    for (const [item, jumlah] of Object.entries(drink)) {
      currentUser[item] = (currentUser[item] || 0) + jumlah;
    }
    if (potion) currentUser.potion = (currentUser.potion || 0) + potion;
    if (type === "newfam") currentUser.newfamClaimed = true;
    if (type !== "newfam") currentUser[`lastClaim_${type}`] = Date.now();

    // Simpan ke db (jaga-jaga)
    if (db?.data?.users) db.data.users[m.sender] = currentUser;

    // Format hadiah
    let hadiah = `*[ ${reward.label} Reward ]*\n`;
    hadiah += `yuan: +${yuan}\n`;
    if (Object.keys(food).length) hadiah += `Makanan: ${Object.entries(food).map(([k,v])=>`${k} x${v}`).join(", ")}\n`;
    if (Object.keys(drink).length) hadiah += `Minuman: ${Object.entries(drink).map(([k,v])=>`${k} x${v}`).join(", ")}\n`;
    if (potion) hadiah += `Potion: +${potion}\n`;
    m.reply(hadiah);
  },

  failed: "Gagal menjalankan perintah %cmd\n\n%error",
  wait: null,
  done: null,
};
