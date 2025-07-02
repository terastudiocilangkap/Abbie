import { createHash } from "crypto";

const more = String.fromCharCode(8206);
const readMore = more.repeat(4001);
const Reg = /\|?(.*)([.|] *?)([0-9]*)$/i;

export default {
  command: ["daftar", "verify", "reg", "register"],
  description: "Daftar/Verifikasi akun RPG kamu",
  category: "Games",
  owner: false,
  admin: false,
  hidden: false,
  limit: false,
  group: false,
  private: false,

  /**
   * @param {import("../../Utils/Messages").ExtendedWAMessage} m
   * @param {import("../Handler").miscOptions} options
   */
  haruna: async function (
    m,
    { text, sock, conn, usedPrefix, db, user }
  ) {
    // Ensure user object exists (fallback to db if needed)
    let currentUser = user || (db?.users?.get?.(m.sender) || db?.data?.users?.[m.sender]);
    if (!currentUser) return m.reply("User data tidak ditemukan. Silakan coba lagi atau hubungi admin.");
    if (currentUser.registered) return m.reply("Kamu sudah terdaftar di database.");
    if (!Reg.test(text))
      return m.reply(
        `Gunakan perintah .daftar (nama). (umur) | Contoh: *${usedPrefix}daftar namakamu. 30*`
      );

    const [, name, , age] = text.match(Reg);
    if (!name) return m.reply("Nama tidak boleh kosong");
    if (!age) return m.reply("Umur tidak boleh kosong");

    const parsedAge = parseInt(age);
    if (parsedAge > 40) return m.reply("WOI TUA (。-`ω´-)");
    if (parsedAge < 5) return m.reply("Halah dasar bocil");

    currentUser.name = name.trim();
    currentUser.age = parsedAge;
    currentUser.regTime = +new Date();
    currentUser.registered = true;
    currentUser.role = currentUser.role || "Novice";

    // Use m.pushName for display name, fallback to number
    const displayName = m.pushName || m.sender.split("@")[0];
    // Use sock.profilePictureUrl for profile picture
    const pp = await sock.profilePictureUrl(m.sender, "image").catch(() => "./src/avatar_contact.png");
    // SN: ambil 6 karakter pertama dari hash, prefix 'Rk-'
    const sn = `Rk-${createHash("md5").update(m.sender).digest("hex").slice(0, 6)}`;
    currentUser.sn = sn; // simpan SN ke database user

    const cap = `
╭━━「 *Profile* 」
│❅ *Name:* ${currentUser.name}
│❅ *Age:* ${parsedAge} Tahun
│❅ *Role:* ${currentUser.role}
│❅ *SN:* ${sn}
╰––––––––––––––––––––⊶`;

    await sock.sendMessage(m.chat, {
      text: cap,
      contextInfo: {
        externalAdReply: {
          title: "Registrasi Berhasil",
          body: `ID: ${sn}`,
          thumbnailUrl: pp,
          sourceUrl: "https://maelyn.sbs",
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    });
    m.reply("Data kamu sudah diverifikasi! Selamat bermain!");
  },

  failed: "Gagal melakukan registrasi: %error",
  wait: null,
  done: null,
};
