const roleSkills = {
  mage: "mythic flame",
  archer: "phantom shot",
  tanker: "demonic shield",
  assassin: "shadow sword",
  fighter: "berserker rage",
};

const roleDescriptions = {
  mage: "Mage",
  archer: "Archer",
  tanker: "Tanker",
  assassin: "Assassin",
  fighter: "Fighter.",
};

const defaultStats = {
  mage: { health: 80, damage: 35, mana: 100, crit: 20, level: 1 },
  archer: { health: 85, damage: 30, mana: 90, crit: 35, level: 1 },
  tanker: { health: 150, damage: 15, mana: 30, crit: 10, level: 1 },
  assassin: { health: 75, damage: 40, mana: 40, crit: 45, level: 1 },
  fighter: { health: 100, damage: 30, mana: 40, crit: 25, level: 1 },
};

const cooldownPeriod = 2 * 30 * 24 * 60 * 60 * 1000; // 2 bulan

export default {
  command: ["pilihrole", "selectrole"],
  description: "Pilih role RPG dan atur statistik awal.",
  category: "Games",
  owner: false,
  admin: false,
  hidden: false,
  limit: false,
  group: false,
  private: false,

  haruna: async function (m, { text, db, user }) {
    try {
      await m.reply("⏳ Memproses pilihan role kamu...");
      let currentUser = user || (db?.users?.get?.(m.sender) || db?.data?.users?.[m.sender]);
      if (!currentUser) return m.reply("🚩 Data pengguna tidak ditemukan.");
      if (!currentUser.rpg) currentUser.rpg = {};
      const roles = Object.keys(roleDescriptions);
      const chosenRole = (text || "").trim().toLowerCase();

      if (!chosenRole) {
        let list = roles
          .map(
            (role) =>
              `› *[ ${role.charAt(0).toUpperCase() + role.slice(1)} ]*\n${roleDescriptions[role]}`
          )
          .join("\n\n");
        return m.reply(
          `Wahai pejuang, pilihlah role yang ingin kamu gunakan.\n\nIngat, kamu hanya bisa memilih *1 role setiap 2 bulan*. Role menentukan skill dan statistik awalmu.\n\n*[ Role List ]*\n\n${list}\n\nCara menggunakan:\n.pilihrole <nama_role>\n\nContoh:\n.pilihrole mage`
        );
      }

      if (!roles.includes(chosenRole)) {
        let list = roles
          .map(
            (role) =>
              `› *[ ${role.charAt(0).toUpperCase() + role.slice(1)} ]*\n${roleDescriptions[role]}`
          )
          .join("\n\n");
        return m.reply(
          `Role yang kamu pilih tidak valid.\n\n*[ Role List ]*\n\n${list}\n\nCara menggunakan:\n.pilihrole <nama_role>\n\nContoh:\n.pilihrole mage`
        );
      }

      const now = Date.now();
      if (
        currentUser.rpg.role &&
        currentUser.rpg.lastRoleChange &&
        now - currentUser.rpg.lastRoleChange < cooldownPeriod
      ) {
        return m.reply(
          `Role-mu saat ini adalah *${currentUser.rpg.role}* dan belum bisa diganti sampai 2 bulan ke depan.`
        );
      }

      // Set role, skill, dan semua stats di user (bukan di user.rpg)
      currentUser.role = chosenRole;
      currentUser.skill = roleSkills[chosenRole];
      currentUser.lastRoleChange = now;
      // Assign default stats
      Object.assign(currentUser, defaultStats[chosenRole]);

      return m.reply(
        `Kamu telah memilih *${chosenRole.charAt(0).toUpperCase() + chosenRole.slice(1)}* sebagai role-mu.\n\nSkill: *${roleSkills[chosenRole].toUpperCase()}*\nSekarang statistikmu sudah di sesuaikan berdasarkan dengan role yang kamu pilih! Ingat tak ada role yang sempurna, lengkapilah satu sama lain dan jadilah satu.\nGunakan dengan bijak dan jadilah legenda di medan tempur.`
      );
    } catch (e) {
      console.error(e);
      m.reply("🚩 Terjadi kesalahan saat memilih role.");
    }
  },

  failed: "Gagal memilih role: %error",
  wait: null,
  done: null,
};