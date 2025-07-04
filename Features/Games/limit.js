export default {
  command: ["limit"],
  description: "Cek jumlah limit kamu atau pengguna lain.",
  category: "Games",
  owner: false,
  admin: false,
  hidden: false,
  limit: false,
  group: false,
  private: false,
  register: true,

  haruna: async function (m, { sock, db }) {
    let who;
    if (m.isGroup) {
      who = m.mentionedJid?.[0] ? m.mentionedJid[0] : m.sender;
    } else {
      who = m.sender;
    }
    const user = db?.users?.get?.(who) || db?.data?.users?.[who];
    if (!user) return m.reply("🚩 Pengguna tidak ada di database.");

    // Ambil foto profil custom user, jika tidak ada pakai profile picture WhatsApp
    let pp =
      user.pp && typeof user.pp === "string"
        ? user.pp
        : await sock.profilePictureUrl(who, "image").catch(() => "https://telegra.ph/file/ee60957d56941b8fdd221.jpg");

    let isPrem = false;
    if (user.premium && typeof user.premium === "object") {
      isPrem = !!user.premium.status && Number(user.premium.expired) > Date.now();
    } else if (user.premium === true && user.expired && user.expired > Date.now()) {
      isPrem = true;
    }

    const limitText = isPrem ? "UNLIMITED" : (user.limit ?? 0);

    const text = `*LIMIT KAMU*\n\nLimit: ❲ ${limitText} ❳`;

    await sock.sendMessage(
      m.chat,
      {
        text,
        contextInfo: {
          externalAdReply: {
            title: `➜ ❲ ${limitText} ❳`,
            showAdAttribution: true,
            mediaType: 1,
            thumbnailUrl: pp,
            renderLargerThumbnail: false
          }
        }
      },
      { quoted: m }
    );
  }
};