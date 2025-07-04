import Sticker from '../../Libs/Sticker.js'

export default {
  command: [
    'wm',
    'swm',
    'stikerwm',
    'take'
  ],
  description: 'Buat sticker dengan watermark packname|author',
  category: 'Sticker',
  owner: false,
  group: false,
  admin: false,
  hidden: false,
  limit: false,
  private: false,
  failed: 'Gagal membuat sticker watermark\n%error',
  wait: null,
  done: null,

  haruna: async function (m, { sock, config }) {
    // Ambil argumen packname|author
    let input = m.args.join(' ') || m.text || ''
    let [packname, ...author] = input.split`|`
    packname = (packname || config?.sticker?.packname || 'Created by').trim()
    author = (author.join('|') || config?.sticker?.author || 'mici').trim()

    // Ambil media dari reply atau pesan
    const q = m.quoted ? m.quoted : m
    const mime = q.mtype || ''
    if (!/sticker|webp|image|video|webm/g.test(mime)) {
      return m.reply('Reply/kirim gambar, video, atau sticker dengan perintah dan watermark!')
    }
    try {
      // Download media
      const media = await q.download()
      // Buat sticker dengan watermark
      const sticker = await Sticker.create(media, {
        packname,
        author,
        emojis: ['📝'],
      })
      await sock.sendMessage(m.chat, { sticker }, { quoted: m })
    } catch (e) {
      m.reply('Gagal membuat sticker wm: ' + e.message)
    }
  },
}