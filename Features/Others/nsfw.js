import axios from 'axios';

/**
 * Cari gambar atau video dari Gelbooru berdasarkan tags.
 * @param {string[]} tags - Array of tags untuk pencarian (contoh: ['1girl', 'solo']).
 * @param {number} limit - Jumlah hasil maksimal yang diambil (default: 10).
 * @returns {Promise<Object[]>} - Array objek post dari Gelbooru API.
 */
async function searchGelbooru(tags, limit = 10) {
  try {
    const tagString = tags.map(encodeURIComponent).join('+');
    const url = `https://gelbooru.com/index.php?page=dapi&s=post&q=index&json=1&limit=${limit}&tags=${tagString}`;
    const response = await axios.get(url);

    if (!response.data || !Array.isArray(response.data)) {
      throw new Error('Response tidak dalam format yang diharapkan');
    }

    return response.data;
  } catch (error) {
    console.error('Error mencari di Gelbooru:', error.message);
    return [];
  }
}

export default {
  command: ['gelbooru'],
  description: 'Cari gambar atau video NSFW dari Gelbooru berdasarkan tags',
  category: 'NSFW',
  haruna: async function (m, { args, sendMessage }) {
    // args = array tag string, contoh: ['1girl', 'solo']
    if (!args || args.length === 0) {
      return sendMessage(m.chat, 'Masukkan setidaknya satu tag untuk pencarian.');
    }

    // Batasi maksimal 5 tags untuk performa
    const tags = args.slice(0, 5);
    const posts = await searchGelbooru(tags, 20);

    if (posts.length === 0) {
      return sendMessage(m.chat, `Tidak ditemukan hasil untuk tags: ${tags.join(', ')}`);
    }

    // Pilih satu random
    const randomPost = posts[Math.floor(Math.random() * posts.length)];

    // Siapkan URL konten
    const mediaUrl = randomPost.file_url || randomPost.sample_url || randomPost.preview_url;
    const caption = `Result untuk tags: ${tags.join(', ')}\n` +
                    `Rating: ${randomPost.rating}\n` +
                    `Score: ${randomPost.score}`;

    // Kirim media
    if (mediaUrl.endsWith('.mp4') || mediaUrl.endsWith('.webm')) {
      await sendMessage(m.chat, { video: { url: mediaUrl }, caption });
    } else {
      await sendMessage(m.chat, { image: { url: mediaUrl }, caption });
    }
  }
};
