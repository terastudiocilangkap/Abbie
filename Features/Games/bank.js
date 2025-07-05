// RPG Bank Plugin Haruna-Bot
// Fitur: deposit, tarik, pinjam, bayar pinjaman

import { register } from "module";

const LOAN_LIMIT = 15000; // Batas maksimum pinjaman
const WEEKLY_DEDUCTION = 5000; // Potongan otomatis tiap minggu (untuk scheduler eksternal)

function formatNumber(num) {
  if (typeof num !== "number" || isNaN(num)) return "0";
  if (num < 1000) return num.toString();
  if (num < 1000000) {
    return (
      ((num / 1000) % 1 === 0
        ? (num / 1000).toFixed(0)
        : (num / 1000).toFixed(1)) + "k"
    );
  }
  return (
    ((num / 1000000) % 1 === 0
      ? (num / 1000000).toFixed(0)
      : (num / 1000000).toFixed(1)) + "jt"
  );
}

function showDashboard(m, user) {
  let yuan = formatNumber(user.yuan);
  let bankyuan = formatNumber(user.bank);
  let availableLoan = LOAN_LIMIT - user.loan;
  let res = `*[ BANK Dashboard ]*\n\n`;
  res += `*Yuan  :* ${yuan}\n`;
  res += `*Bank  :* ${bankyuan}\n`;
  res += `*Sisa Loan Limit :* ${formatNumber(availableLoan)} / ${formatNumber(LOAN_LIMIT)} yuan\n`;
  res += `Auto deduction tiap minggu : ${formatNumber(WEEKLY_DEDUCTION)} yuan\n\n`;
  res += `*[ Menu dashboard ]*\n`;
  res += `.bank deposit <jumlah>\n.bank wd <jumlah>\n.bank loan <jumlah>\n.bank bayar <jumlah>`;
  return m.reply(res);
}

export default {
  command: ["bank"],
  description: "Fitur bank RPG: deposit, tarik, pinjam, bayar pinjaman.",
  category: "Games",
  owner: false,
  admin: false,
  hidden: false,
  limit: false,
  group: true,
  register: true,
  private: false,

  /**
   * @param {import("../../Utils/Messages").ExtendedWAMessage} m
   * @param {object} param1
   */
  haruna: async function (m, { sock, db, user, text, args }) {
    // Pastikan user object
    let currentUser = user || (db?.users?.get?.(m.sender) || db?.data?.users?.[m.sender]);
    if (!currentUser) return m.reply("🚩 Data pengguna tidak ditemukan.");
    if (typeof currentUser.yuan !== "number" || isNaN(currentUser.yuan)) currentUser.yuan = 0;
    if (typeof currentUser.bank !== "number" || isNaN(currentUser.bank)) currentUser.bank = 0;
    if (typeof currentUser.loan !== "number" || isNaN(currentUser.loan)) currentUser.loan = 0;

    if (!text || text.trim().length === 0) {
      return showDashboard(m, currentUser);
    }

    let subCommand = args[0]?.toLowerCase();
    let amount = parseInt(args[1]);

    // Validasi jumlah
    if (["deposit", "nabung", "wd", "tarik", "pinjam", "loan", "bayar"].includes(subCommand) && (isNaN(amount) || amount <= 0)) {
      return m.reply("🚩 Jumlah tidak valid. Harap masukkan angka yang benar.");
    }

    let response = "";
    if (subCommand === "deposit" || subCommand === "nabung") {
      if (currentUser.yuan < amount) return m.reply("🚩 Saldo yuan tidak cukup untuk deposit.");
      currentUser.yuan -= amount;
      currentUser.bank += amount;
      response = `Berhasil deposit ${formatNumber(amount)} yuan.\nSaldo bank anda sekarang: ${formatNumber(currentUser.bank)} yuan.`;
    } else if (subCommand === "wd" || subCommand === "tarik") {
      if (currentUser.bank < amount) return m.reply("🚩 Saldo bank tidak cukup untuk penarikan.");
      currentUser.bank -= amount;
      currentUser.yuan += amount;
      response = `Berhasil tarik ${formatNumber(amount)} yuan dari bank.\nSaldo bank anda sekarang: ${formatNumber(currentUser.bank)} yuan.`;
    } else if (subCommand === "pinjam" || subCommand === "loan") {
      let tentativeLoan = amount * 1.3;
      if (currentUser.loan + tentativeLoan > LOAN_LIMIT) {
        let remaining = LOAN_LIMIT - currentUser.loan;
        return m.reply(`🚩 Pinjaman melebihi limit.\nSisa limit yang dapat dipinjam: ${formatNumber(remaining)} yuan.`);
      }
      currentUser.yuan += amount;
      currentUser.loan += tentativeLoan;
      response = `Berhasil meminjam ${formatNumber(amount)} yuan.\nTotal pinjaman (termasuk bunga 30%): ${formatNumber(currentUser.loan)} yuan.`;
    } else if (subCommand === "bayar") {
      if (currentUser.loan <= 0) return m.reply("🚩 Tidak ada pinjaman yang harus dibayar.");
      if (amount > currentUser.loan) return m.reply(`🚩 Jumlah pembayaran melebihi total pinjaman Anda (${formatNumber(currentUser.loan)} yuan). Masukkan jumlah yang sesuai.`);
      if (currentUser.yuan < amount) return m.reply(`🚩 Saldo yuan tidak cukup untuk membayar pinjaman. Saldo yuan Anda: ${formatNumber(currentUser.yuan)}.`);
      currentUser.yuan -= amount;
      currentUser.loan -= amount;
      response = `Berhasil membayar ${formatNumber(amount)} yuan untuk pinjaman.\nSisa pinjaman: ${formatNumber(currentUser.loan)} yuan.`;
      if (currentUser.loan === 0) response += "\nPinjaman telah lunas!";
    } else {
      // Subcommand tidak dikenali, tampilkan dashboard
      return showDashboard(m, currentUser);
    }
    return m.reply(response);
  },
};

// Fungsi untuk proses potongan otomatis mingguan (untuk scheduler eksternal)
export function processWeeklyLoanDeduction(user) {
  if (user.loan > 0) {
    user.yuan -= WEEKLY_DEDUCTION;
    user.loan = Math.max(0, user.loan - WEEKLY_DEDUCTION);
  }
}
