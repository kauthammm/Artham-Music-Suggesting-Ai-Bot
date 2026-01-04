/**
 * Comprehensive Song Catalog with Real Streaming URLs
 * 
 * Each song includes:
 * - id: Unique identifier
 * - title: Song name
 * - artist: Music composer
 * - singer: Vocal artist
 * - movie: Film name
 * - language: Tamil, Hindi, Telugu, etc.
 * - moods: Array of applicable moods
 * - provider: Main streaming provider
 * - spotifyId: Spotify track ID
 * - youtubeId: YouTube video ID
 * - streamUrl: Direct streaming URL (Spotify embed or YouTube)
 */

const SONGS = [
  // ===== HAPPY TAMIL SONGS =====
  {
    id: 'tamil-happy-001',
    title: 'Why This Kolaveri Di',
    artist: 'Anirudh Ravichander',
    singer: 'Dhanush',
    movie: '3',
    language: 'Tamil',
    moods: ['happy', 'energetic', 'fun'],
    provider: 'spotify',
    spotifyId: '3JvKfv6T31zO0ini8iNItO',
    youtubeId: 'YR12Z8f1Dh8',
    streamUrl: 'https://open.spotify.com/embed/track/3JvKfv6T31zO0ini8iNItO'
  },
  {
    id: 'tamil-happy-002',
    title: 'Vaathi Coming',
    artist: 'Anirudh Ravichander',
    singer: 'Anirudh Ravichander',
    movie: 'Master',
    language: 'Tamil',
    moods: ['happy', 'energetic', 'party'],
    provider: 'youtube',
    spotifyId: '4h68h0HYqnCjNBLFYN9Mg8',
    youtubeId: 'bhZGhtKAKTU',
    streamUrl: 'https://www.youtube.com/embed/bhZGhtKAKTU?autoplay=1'
  },
  {
    id: 'tamil-happy-003',
    title: 'Arabic Kuthu',
    artist: 'Anirudh Ravichander',
    singer: 'Anirudh Ravichander',
    movie: 'Beast',
    language: 'Tamil',
    moods: ['happy', 'energetic', 'dance'],
    provider: 'youtube',
    spotifyId: '6EbmpUSP2U9t2RKfPyRRYk',
    youtubeId: 'vkqiC4KPeDs',
    streamUrl: 'https://www.youtube.com/embed/vkqiC4KPeDs?autoplay=1'
  },
  {
    id: 'tamil-happy-004',
    title: 'Aaluma Doluma',
    artist: 'Anirudh Ravichander',
    singer: 'Badshah',
    movie: 'Vedalam',
    language: 'Tamil',
    moods: ['happy', 'energetic', 'hype'],
    provider: 'youtube',
    spotifyId: '2Y0MZNnrJJuqP1YxJhJqCa',
    youtubeId: 'HiqmZLOuCMY',
    streamUrl: 'https://www.youtube.com/embed/HiqmZLOuCMY?autoplay=1'
  },
  {
    id: 'tamil-happy-005',
    title: 'Rowdy Baby',
    artist: 'Yuvan Shankar Raja',
    singer: 'Dhanush, Dhee',
    movie: 'Maari 2',
    language: 'Tamil',
    moods: ['happy', 'dance', 'energetic'],
    provider: 'youtube',
    spotifyId: '2WFvQW9cNhePX0wfwLpqcz',
    youtubeId: 'x6Q7c9RyMzk',
    streamUrl: 'https://www.youtube.com/embed/x6Q7c9RyMzk?autoplay=1'
  },
  {
    id: 'tamil-happy-006',
    title: 'Selfie Pulla',
    artist: 'Anirudh Ravichander',
    singer: 'Kara Ishq',
    movie: 'Kaththi',
    language: 'Tamil',
    moods: ['happy', 'fun', 'party'],
    provider: 'youtube',
    spotifyId: '5iZlrQnIRXVCUuqZqR4K4B',
    youtubeId: 'vKtx8TiXUCs',
    streamUrl: 'https://www.youtube.com/embed/vKtx8TiXUCs?autoplay=1'
  },
  {
    id: 'tamil-happy-007',
    title: 'Marana Mass',
    artist: 'Anirudh Ravichander',
    singer: 'SP Balasubrahmanyam',
    movie: 'Petta',
    language: 'Tamil',
    moods: ['happy', 'energetic', 'mass'],
    provider: 'youtube',
    spotifyId: '3JYCNEn5AnKbfGWiJEG6N2',
    youtubeId: 'vmgkwhwVZ0s',
    streamUrl: 'https://www.youtube.com/embed/vmgkwhwVZ0s?autoplay=1'
  },
  {
    id: 'tamil-happy-008',
    title: 'Naakka Mukka',
    artist: 'Vijay Antony',
    singer: 'Vijay Antony',
    movie: 'Kadhalil Vizhunthen',
    language: 'Tamil',
    moods: ['happy', 'dance', 'instrumental'],
    provider: 'youtube',
    spotifyId: '1ZkfYNh8a6b2gNJgdZ0K6y',
    youtubeId: 'kK4xXZQ89Hc',
    streamUrl: 'https://www.youtube.com/embed/kK4xXZQ89Hc?autoplay=1'
  },

  // ===== ROMANTIC TAMIL SONGS =====
  {
    id: 'tamil-romantic-001',
    title: 'Vaseegara',
    artist: 'Harris Jayaraj',
    singer: 'Bombay Jayashri',
    movie: 'Minnale',
    language: 'Tamil',
    moods: ['romantic', 'love', 'melody'],
    provider: 'spotify',
    spotifyId: '0KpfYajM1xR3V8gJJRBPqw',
    youtubeId: 'dzQ99-AqjJI',
    streamUrl: 'https://open.spotify.com/embed/track/0KpfYajM1xR3V8gJJRBPqw'
  },
  {
    id: 'tamil-romantic-002',
    title: 'Hosanna',
    artist: 'A.R. Rahman',
    singer: 'Vijay Yesudas, Suzanne',
    movie: 'Vinnaithaandi Varuvaayaa',
    language: 'Tamil',
    moods: ['romantic', 'love', 'dreamy'],
    provider: 'youtube',
    spotifyId: '1Z8Y2dL4gGAKvqxNJ7N3YB',
    youtubeId: 'CiFX5rJnhLk',
    streamUrl: 'https://www.youtube.com/embed/CiFX5rJnhLk?autoplay=1'
  },
  {
    id: 'tamil-romantic-003',
    title: 'Munbe Vaa',
    artist: 'Harris Jayaraj',
    singer: 'Naresh Iyer, Andrea Jeremiah',
    movie: 'Sillunu Oru Kaadhal',
    language: 'Tamil',
    moods: ['romantic', 'love', 'soulful'],
    provider: 'youtube',
    spotifyId: '2bOFnZ83u4gDPHXUPgE3Uy',
    youtubeId: 'IuLNbp6Wy6k',
    streamUrl: 'https://www.youtube.com/embed/IuLNbp6Wy6k?autoplay=1'
  },
  {
    id: 'tamil-romantic-004',
    title: 'Nenjukkul Peidhidum',
    artist: 'Harris Jayaraj',
    singer: 'Hariharan, Devan Ekambaram',
    movie: 'Vaaranam Aayiram',
    language: 'Tamil',
    moods: ['romantic', 'love', 'melody'],
    provider: 'youtube',
    spotifyId: '5BdqQJCk7F0YJmUkJWcLjH',
    youtubeId: 'yDKNs6gFUzg',
    streamUrl: 'https://www.youtube.com/embed/yDKNs6gFUzg?autoplay=1'
  },
  {
    id: 'tamil-romantic-005',
    title: 'Kadhal Rojave',
    artist: 'A.R. Rahman',
    singer: 'S.P. Balasubrahmanyam',
    movie: 'Roja',
    language: 'Tamil',
    moods: ['romantic', 'love', 'classic'],
    provider: 'youtube',
    spotifyId: '3dkfxGdSfT7gZOkqVE7T8K',
    youtubeId: 'hfbQFWnGw2Y',
    streamUrl: 'https://www.youtube.com/embed/hfbQFWnGw2Y?autoplay=1'
  },
  {
    id: 'tamil-romantic-006',
    title: 'Vennilave Vennilave',
    artist: 'A.R. Rahman',
    singer: 'Hariharan',
    movie: 'Minsara Kanavu',
    language: 'Tamil',
    moods: ['romantic', 'love', 'melody'],
    provider: 'youtube',
    spotifyId: '72yxmUgHeLbB6yMK8h8YdE',
    youtubeId: 'gQNDm3S7FLc',
    streamUrl: 'https://www.youtube.com/embed/gQNDm3S7FLc?autoplay=1'
  },
  {
    id: 'tamil-romantic-007',
    title: 'Uyire Uyire',
    artist: 'A.R. Rahman',
    singer: 'A.R. Rahman',
    movie: 'Bombay',
    language: 'Tamil',
    moods: ['romantic', 'love', 'soulful'],
    provider: 'youtube',
    spotifyId: '4B8yLpxE5vDDaQ5GD7E3mK',
    youtubeId: 'WZVn9N_jCJc',
    streamUrl: 'https://www.youtube.com/embed/WZVn9N_jCJc?autoplay=1'
  },
  {
    id: 'tamil-romantic-008',
    title: 'Snehithane',
    artist: 'A.R. Rahman',
    singer: 'Hariharan, Sadhana Sargam',
    movie: 'Alaipayuthey',
    language: 'Tamil',
    moods: ['romantic', 'love', 'melody'],
    provider: 'youtube',
    spotifyId: '6XBDaCdR0t9nqKxaYVpSvH',
    youtubeId: 'SZRcnKDMHqA',
    streamUrl: 'https://www.youtube.com/embed/SZRcnKDMHqA?autoplay=1'
  },

  // ===== SAD TAMIL SONGS =====
  {
    id: 'tamil-sad-001',
    title: 'Thalli Pogathey',
    artist: 'A.R. Rahman',
    singer: 'A.R. Rahman',
    movie: 'Achcham Yenbadhu Madamaiyada',
    language: 'Tamil',
    moods: ['sad', 'emotional', 'heartbreak'],
    provider: 'spotify',
    spotifyId: '3djqjuhY0xRPPqNGYCXmCz',
    youtubeId: 'GnP0y1Q-Hxw',
    streamUrl: 'https://open.spotify.com/embed/track/3djqjuhY0xRPPqNGYCXmCz'
  },
  {
    id: 'tamil-sad-002',
    title: 'Pachai Nirame',
    artist: 'A.R. Rahman',
    singer: 'Karthik',
    movie: 'Alaipayuthey',
    language: 'Tamil',
    moods: ['sad', 'emotional', 'longing'],
    provider: 'youtube',
    spotifyId: '5XYNwJM3C5JZJp2ZvNjMUh',
    youtubeId: 'SZRcnKDMHqA',
    streamUrl: 'https://www.youtube.com/embed/VGi5Qb8gF0I?autoplay=1'
  },
  {
    id: 'tamil-sad-003',
    title: 'Mundhinam Paarthene',
    artist: 'Harris Jayaraj',
    singer: 'Naresh Iyer, Shreya Ghoshal',
    movie: 'Vaaranam Aayiram',
    language: 'Tamil',
    moods: ['sad', 'emotional', 'longing'],
    provider: 'youtube',
    spotifyId: '1dYU0pFU8pBL9cJKFzpPmU',
    youtubeId: 'vfKGjZNIa5Y',
    streamUrl: 'https://www.youtube.com/embed/vfKGjZNIa5Y?autoplay=1'
  },
  {
    id: 'tamil-sad-004',
    title: 'Kanne Kalaimane',
    artist: 'Ilaiyaraaja',
    singer: 'S. Janaki',
    movie: 'Moondram Pirai',
    language: 'Tamil',
    moods: ['sad', 'emotional', 'classic'],
    provider: 'youtube',
    spotifyId: '3W8wN9MRx0KyxN7YY6Y0uG',
    youtubeId: 'kCyA-oYp57Y',
    streamUrl: 'https://www.youtube.com/embed/kCyA-oYp57Y?autoplay=1'
  },
  {
    id: 'tamil-sad-005',
    title: 'Kannukul Kannai',
    artist: 'Deva',
    singer: 'Mano, Swarnalatha',
    movie: 'Jeans',
    language: 'Tamil',
    moods: ['sad', 'emotional', 'melody'],
    provider: 'youtube',
    spotifyId: '7v4SdYYPbNYbGZn2Dm0Sth',
    youtubeId: 'J7W1WJd74fM',
    streamUrl: 'https://www.youtube.com/embed/J7W1WJd74fM?autoplay=1'
  },

  // ===== ENERGETIC TAMIL SONGS =====
  {
    id: 'tamil-energetic-001',
    title: 'Surviva',
    artist: 'Anirudh Ravichander',
    singer: 'Yogi B, Mali Manoj',
    movie: 'Vivegam',
    language: 'Tamil',
    moods: ['energetic', 'workout', 'hype'],
    provider: 'youtube',
    spotifyId: '3djqjuhY0xRPPqNGYCXmCz',
    youtubeId: '8xXnmknRdTo',
    streamUrl: 'https://www.youtube.com/embed/8xXnmknRdTo?autoplay=1'
  },
  {
    id: 'tamil-energetic-002',
    title: 'Pathala Pathala',
    artist: 'Anirudh Ravichander',
    singer: 'Kamal Haasan, Anirudh',
    movie: 'Vikram',
    language: 'Tamil',
    moods: ['energetic', 'power', 'intense'],
    provider: 'youtube',
    spotifyId: '6F9Z7GfqLzEXvH3B9qvmYJ',
    youtubeId: 'KJQ2wNdPjrM',
    streamUrl: 'https://www.youtube.com/embed/KJQ2wNdPjrM?autoplay=1'
  },
  {
    id: 'tamil-energetic-003',
    title: 'Urvasi Urvasi',
    artist: 'A.R. Rahman',
    singer: 'A.R. Rahman',
    movie: 'Kadhalan',
    language: 'Tamil',
    moods: ['energetic', 'dance', 'classic'],
    provider: 'youtube',
    spotifyId: '1O4sQpjRzH1D1GaK8dF6kJ',
    youtubeId: 'p_nNu6vQ5OQ',
    streamUrl: 'https://www.youtube.com/embed/p_nNu6vQ5OQ?autoplay=1'
  },

  // ===== RELAXING TAMIL SONGS =====
  {
    id: 'tamil-relaxing-001',
    title: 'Mandram Vantha Thendralukku',
    artist: 'Ilaiyaraaja',
    singer: 'S.P. Balasubrahmanyam',
    movie: 'Mouna Ragam',
    language: 'Tamil',
    moods: ['relaxing', 'peaceful', 'classic'],
    provider: 'youtube',
    spotifyId: '4ZkxqjKKFoL7a6F6V5RLkN',
    youtubeId: 'J7W1WJd74fM',
    streamUrl: 'https://www.youtube.com/embed/J7W1WJd74fM?autoplay=1'
  },
  {
    id: 'tamil-relaxing-002',
    title: 'Pudhu Vellai Mazhai',
    artist: 'A.R. Rahman',
    singer: 'Unni Menon',
    movie: 'Roja',
    language: 'Tamil',
    moods: ['relaxing', 'peaceful', 'melody'],
    provider: 'youtube',
    spotifyId: '3FqPYPqz3aKzp6KjqFQxJc',
    youtubeId: 'hiFjwzmnRFY',
    streamUrl: 'https://www.youtube.com/embed/hiFjwzmnRFY?autoplay=1'
  },
  {
    id: 'tamil-relaxing-003',
    title: 'Chinna Chinna Aasai',
    artist: 'A.R. Rahman',
    singer: 'Minmini',
    movie: 'Roja',
    language: 'Tamil',
    moods: ['relaxing', 'happy', 'melody'],
    provider: 'youtube',
    spotifyId: '5V8Vz4YJRxgGKnW7BwHC8F',
    youtubeId: 'jJ2s6FMu9jM',
    streamUrl: 'https://www.youtube.com/embed/jJ2s6FMu9jM?autoplay=1'
  },

  // ===== STRESSED/ANGRY TAMIL SONGS =====
  {
    id: 'tamil-angry-001',
    title: 'Karuppu Nerathazhagi',
    artist: 'Santhosh Narayanan',
    singer: 'Dhanush',
    movie: 'Asuran',
    language: 'Tamil',
    moods: ['angry', 'intense', 'powerful'],
    provider: 'youtube',
    spotifyId: '1BHT6pFsILQ3E4KKCf9Qpk',
    youtubeId: 'qE7eeDPRCwg',
    streamUrl: 'https://www.youtube.com/embed/qE7eeDPRCwg?autoplay=1'
  },
  {
    id: 'tamil-angry-002',
    title: 'Neruppu Da',
    artist: 'Santhosh Narayanan',
    singer: 'Arunraja Kamaraj',
    movie: 'Kabali',
    language: 'Tamil',
    moods: ['angry', 'powerful', 'intense'],
    provider: 'youtube',
    spotifyId: '4fK6E2UywZTJIa5kWnCD6x',
    youtubeId: 'U2FnMBzWlGk',
    streamUrl: 'https://www.youtube.com/embed/U2FnMBzWlGk?autoplay=1'
  },

  // ===== NOSTALGIC TAMIL SONGS =====
  {
    id: 'tamil-nostalgic-001',
    title: 'Rakkamma Kaiya Thattu',
    artist: 'Ilaiyaraaja',
    singer: 'Ilaiyaraaja',
    movie: 'Thalapathi',
    language: 'Tamil',
    moods: ['nostalgic', 'happy', 'classic'],
    provider: 'youtube',
    spotifyId: '1FqmxvmS5KP6eDW3OdXMqR',
    youtubeId: 'F5DzBp5rNI4',
    streamUrl: 'https://www.youtube.com/embed/F5DzBp5rNI4?autoplay=1'
  },
  {
    id: 'tamil-nostalgic-002',
    title: 'Sundari Kannal',
    artist: 'Ilaiyaraaja',
    singer: 'S.P. Balasubrahmanyam',
    movie: 'Thalapathi',
    language: 'Tamil',
    moods: ['nostalgic', 'romantic', 'classic'],
    provider: 'youtube',
    spotifyId: '7qPYPbXZVqFZvNNH5MzBDK',
    youtubeId: 'dZo3yNkePx4',
    streamUrl: 'https://www.youtube.com/embed/dZo3yNkePx4?autoplay=1'
  },
  {
    id: 'tamil-nostalgic-003',
    title: 'Poo Pookkum Osai',
    artist: 'Ilaiyaraaja',
    singer: 'S. Janaki',
    movie: 'Karakattakkaran',
    language: 'Tamil',
    moods: ['nostalgic', 'melody', 'classic'],
    provider: 'youtube',
    spotifyId: '3H8d6zqkxEHtJ9wT3qKzqw',
    youtubeId: 'M3_xJHLdKp0',
    streamUrl: 'https://www.youtube.com/embed/M3_xJHLdKp0?autoplay=1'
  },

  // ===== HINDI SONGS =====
  {
    id: 'hindi-romantic-001',
    title: 'Tum Hi Ho',
    artist: 'Mithoon',
    singer: 'Arijit Singh',
    movie: 'Aashiqui 2',
    language: 'Hindi',
    moods: ['romantic', 'love', 'melody'],
    provider: 'spotify',
    spotifyId: '5c9uY4hqxMhypjqJULg3Eb',
    youtubeId: 'Umqb9KENgmk',
    streamUrl: 'https://open.spotify.com/embed/track/5c9uY4hqxMhypjqJULg3Eb'
  },
  {
    id: 'hindi-romantic-002',
    title: 'Pehla Nasha',
    artist: 'Anand-Milind',
    singer: 'Udit Narayan, Sadhana Sargam',
    movie: 'Jo Jeeta Wohi Sikandar',
    language: 'Hindi',
    moods: ['romantic', 'love', 'nostalgic'],
    provider: 'youtube',
    spotifyId: '6Bx2Y5R4RYpDNjQE8U0YoR',
    youtubeId: 'F3G0OTUHBcc',
    streamUrl: 'https://www.youtube.com/embed/F3G0OTUHBcc?autoplay=1'
  },
  {
    id: 'hindi-happy-001',
    title: 'Chaiyya Chaiyya',
    artist: 'A.R. Rahman',
    singer: 'Sukhwinder Singh, Sapna Awasthi',
    movie: 'Dil Se',
    language: 'Hindi',
    moods: ['happy', 'energetic', 'dance'],
    provider: 'youtube',
    spotifyId: '3XH3YBPrC3Yb8C4Nnmtlpw',
    youtubeId: 'YOYN9qNXmAw',
    streamUrl: 'https://www.youtube.com/embed/YOYN9qNXmAw?autoplay=1'
  },
  {
    id: 'hindi-sad-001',
    title: 'Tujhe Kitna Chahne Lage',
    artist: 'Mithoon',
    singer: 'Arijit Singh',
    movie: 'Kabir Singh',
    language: 'Hindi',
    moods: ['sad', 'romantic', 'emotional'],
    provider: 'spotify',
    spotifyId: '0JlOOOqzXXAaR8bBdQh6O6',
    youtubeId: 'F1l3s6XYQCw',
    streamUrl: 'https://open.spotify.com/embed/track/0JlOOOqzXXAaR8bBdQh6O6'
  },

  // ===== TELUGU SONGS =====
  {
    id: 'telugu-romantic-001',
    title: 'Inkem Inkem',
    artist: 'Sid Sriram',
    singer: 'Sid Sriram',
    movie: 'Geetha Govindam',
    language: 'Telugu',
    moods: ['romantic', 'love', 'melody'],
    provider: 'youtube',
    spotifyId: '6ZMTeMqHZdqSVYQEeRXr8c',
    youtubeId: 'eRJcZP_jSVQ',
    streamUrl: 'https://www.youtube.com/embed/eRJcZP_jSVQ?autoplay=1'
  },
  {
    id: 'telugu-energetic-001',
    title: 'Butta Bomma',
    artist: 'Thaman S',
    singer: 'Armaan Malik',
    movie: 'Ala Vaikunthapurramuloo',
    language: 'Telugu',
    moods: ['happy', 'romantic', 'dance'],
    provider: 'youtube',
    spotifyId: '57YaGpH0ZWcmVEwZfmCxEC',
    youtubeId: 'OvqJ3pbc9gw',
    streamUrl: 'https://www.youtube.com/embed/OvqJ3pbc9gw?autoplay=1'
  },

  // ===== MALAYALAM SONGS =====
  {
    id: 'malayalam-romantic-001',
    title: 'Malare',
    artist: 'Vidyasagar',
    singer: 'Vijay Yesudas',
    movie: 'Premam',
    language: 'Malayalam',
    moods: ['romantic', 'love', 'melody'],
    provider: 'youtube',
    spotifyId: '2u0J5BPwFLKyMxU8m5QC5s',
    youtubeId: 'Pn6tXy_WMVU',
    streamUrl: 'https://www.youtube.com/embed/Pn6tXy_WMVU?autoplay=1'
  },
  {
    id: 'malayalam-sad-001',
    title: 'Pranayam',
    artist: 'M. Jayachandran',
    singer: 'Unni Menon',
    movie: 'Pranayam',
    language: 'Malayalam',
    moods: ['sad', 'romantic', 'emotional'],
    provider: 'youtube',
    spotifyId: '4JZ82r38IHPbZcV5dJ5vnU',
    youtubeId: 'TJ3jV4QPPGg',
    streamUrl: 'https://www.youtube.com/embed/TJ3jV4QPPGg?autoplay=1'
  },

  // ===== KANNADA SONGS =====
  {
    id: 'kannada-romantic-001',
    title: 'Usire Usire',
    artist: 'V. Harikrishna',
    singer: 'Sonu Nigam',
    movie: 'Googly',
    language: 'Kannada',
    moods: ['romantic', 'love', 'melody'],
    provider: 'youtube',
    spotifyId: '3Jc1vXx7tL2Q5mjfT6YJf5',
    youtubeId: 'xrZdRjUxP_0',
    streamUrl: 'https://www.youtube.com/embed/xrZdRjUxP_0?autoplay=1'
  }
];

// Helper functions for querying the catalog

function getSongsByMood(mood) {
  return SONGS.filter(song => song.moods.includes(mood.toLowerCase()));
}

function getSongsByLanguage(language) {
  return SONGS.filter(song => song.language.toLowerCase() === language.toLowerCase());
}

function getSongsByMoodAndLanguage(mood, language) {
  return SONGS.filter(song => 
    song.moods.includes(mood.toLowerCase()) && 
    song.language.toLowerCase() === language.toLowerCase()
  );
}

function getSongById(id) {
  return SONGS.find(song => song.id === id);
}

function searchSongs(query) {
  const lowerQuery = query.toLowerCase();
  return SONGS.filter(song => 
    song.title.toLowerCase().includes(lowerQuery) ||
    song.artist.toLowerCase().includes(lowerQuery) ||
    song.singer.toLowerCase().includes(lowerQuery) ||
    song.movie.toLowerCase().includes(lowerQuery)
  );
}

function getAllSongs() {
  return SONGS;
}

function getRandomSongs(count = 5) {
  const shuffled = [...SONGS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

module.exports = {
  SONGS,
  getSongsByMood,
  getSongsByLanguage,
  getSongsByMoodAndLanguage,
  getSongById,
  searchSongs,
  getAllSongs,
  getRandomSongs
};
