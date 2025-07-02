export default {
  command: ["inv", "inventory"],
  description: "Menampilkan inventori RPG kamu",
  category: "Games",
  owner: false,
  admin: false,
  hidden: false,
  limit: false,
  group: false,
  private: false,
  register: true,

  haruna: async function (m, { sock, db, user }) {
    let currentUser = user || (db?.users?.get?.(m.sender) || db?.data?.users?.[m.sender]);
    if (!currentUser) return m.reply("🚩 Data pengguna tidak ditemukan.");

    // Helper untuk generate section hanya jika ada item > 0
    function section(title, items) {
      const filtered = items.filter(([k, v]) => (currentUser[v] || 0) > 0);
      if (!filtered.length) return "";
      let txt = `*[ ${title} ]*\n`;
      for (const [label, key] of filtered) {
        txt += `- ${label}: *${currentUser[key] || 0}*\n`;
      }
      return txt + "\n";
    }

    let text = `🎒 *[ Inventory ${currentUser.name || "Unknown"} ]* 🎒\n\n`;

    // STATS (selalu tampil)
    text += `*[ STATS ]*\n`;
    text += `- Health: *${currentUser.health || 0}/${currentUser.MAXhealth || 0}*\n`;
    text += `- Mana: *${currentUser.mana || 0}/${currentUser.MAXmana || 0}*\n`;
    text += `- Limit: *${currentUser.limit || 0}*\n\n`;

    // TOOLS NEED
    text += section("TOOLS NEED", [
      ["Rune", "rune"],
      ["Mitril", "mitril"],
      ["Jade", "jade"],
      ["Skill Coin", "scoin"],
      ["Crystal core", "crystalcore"],
    ]);

    // HEALTH REGEN
    text += section("HEALTH REGEN", [
      ["Apple", "apple"],
      ["Bread", "bread"],
      ["Sushi", "sushi"],
      ["Ramen", "ramen"],
      ["Steak", "steak"],
      ["Bubu", "bubu"],
      ["Dango", "dango"],
      ["Pompom", "pompom"],
      ["Lotus", "lotus"],
      ["Marak", "marak"],
    ]);

    // MANA REGEN
    text += section("MANA REGEN", [
      ["Milk", "milk"],
      ["Tea", "tea"],
      ["Coffee", "coffee"],
      ["Juice", "juice"],
      ["Ether", "ether"],
      ["Astral", "astral"],
      ["Lumina", "lumina"],
    ]);

    // POTION
    text += section("POTION", [
      ["Potion", "potion"],
    ]);

    // COIN AND TICKET
    text += section("COIN AND TICKET", [
      ["Vrpass", "vrpass"],
      ["Spin Tiket", "spintiket"],
      ["Starcoin", "starcoin"],
      ["Platinum Ticket", "platinumstr"],
      ["Diamond Ticket", "goldenstr"],
    ]);

    // CHEST
    text += section("CHEST", [
      ["Common", "common"],
      ["Uncommon", "uncommon"],
      ["Mythic", "mythic"],
      ["Legendary", "legendary"],
    ]);

    // BACKPACK
    text += section("BACKPACK", [
      ["Diamond", "diamond"],
      ["Gold", "gold"],
      ["Emerald", "emerald"],
      ["Ruby", "ruby"],
      ["Core", "core"],
      ["Trash", "trash"],
      ["Wood", "wood"],
      ["Iron", "iron"],
      ["Rock", "rock"],
      ["Minyak", "minyak"],
      ["Susu", "susu"],
      ["String", "string"],
      ["Coal", "coal"],
      ["Steel", "steel"],
    ]);

    // Ambil foto profil custom user, jika tidak ada pakai profile picture WhatsApp
    let pp =
      currentUser.pp && typeof currentUser.pp === "string"
        ? currentUser.pp
        : await sock?.profilePictureUrl?.(m.sender, "image").catch(() => "https://files.catbox.moe/b231vp.jpg");

    // Kirim balasan dengan contextInfo (seperti profile.js)
    await sock.sendMessage(m.chat, {
      text: text.trim(),
      contextInfo: {
        externalAdReply: {
          title: currentUser.name || "Inventory",
          body: "Inventory RPG",
          thumbnailUrl: pp,
          sourceUrl: "https://Micy",
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m });
  },

  failed: "Gagal menampilkan inventory: %error",
  wait: null,
  done: null,
};