
export default {
  command: ["makan", "minum"],
  description: "Makan/minum untuk menambah health/mana (limit 1 jam).",
  category: "Games",
  owner: false,
  admin: false,
  hidden: false,
  limit: false,
  group: false,
  private: false,
  register: true,

  haruna: async function (m, { sock, db, user, command }) {
    let currentUser = user || (db?.users?.get?.(m.sender) || db?.data?.users?.[m.sender]);
    if (!currentUser) return m.reply("🚩 Data pengguna tidak ditemukan.");

    // Cek limit kenyang
    const now = Date.now();
    const key = command === "makan"? "lastEat": "lastDrink";
    const cooldown = 3600 * 1000; // 1 jam
    if (currentUser[key] && now - currentUser[key] < cooldown) {
      const sisa = Math.ceil((cooldown - (now - currentUser[key])) / 60000);
      return m.reply(`Kamu masih kenyang! Silakan ${command === "makan"? "makan": "minum"} lagi dalam ${sisa} menit.`);
    }

    // Daftar item & efek
    const foodList = [
      { key: "apple", label: "Apple", heal: 20 },
      { key: "bread", label: "Bread", heal: 30 },
      { key: "ramen", label: "Ramen", heal: 50 },
    ];
    const drinkList = [
      { key: "milk", label: "Milk", mana: 20 },
      { key: "tea", label: "Tea", mana: 30 },
      { key: "coffee", label: "Coffee", mana: 40 },
    ];

    let list, stat, max, type;
    if (command === "makan") {
      list = foodList;
      stat = "health";
      max = "MAXhealth";
      type = "makanan";
    } else {
      list = drinkList;
      stat = "mana";
      max = "MAXmana";
      type = "minuman";
    }

    // Cari item yang dimiliki user
    const owned = list.find(item => (currentUser[item.key] || 0) > 0);
    if (!owned) {
      return m.reply(`Kamu tidak punya ${type} untuk digunakan!`);
    }

    // Kurangi item, tambah stat, set limit
    currentUser[owned.key] -= 1;
    currentUser[stat] = Math.min((currentUser[stat] || 0) + (owned.heal || owned.mana), currentUser[max] || 0);
    currentUser[key] = now;

    m.reply(`Kamu menggunakan *${owned.label}*!\n${stat === "health"? "❤️ Health": "🔮 Mana"} bertambah *${owned.heal || owned.mana}*.\nSisa ${owned.label}: *${currentUser[owned.key]}*\n\nKamu bisa ${command === "makan"? "makan": "minum"} lagi setelah 1 jam.`);
  },

  failed: "Gagal menggunakan item: %error",
  wait: null,
  done: null,
};
