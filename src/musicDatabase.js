// Simplified Music Database for Netlify
const musicDatabase = {
    artists: {
        'A.R. Rahman': {
            hits: [
                { title: 'Jai Ho', movie: 'Slumdog Millionaire' },
                { title: 'Vennilave Vennilave', movie: 'Minsara Kanavu' },
                { title: 'Kadhal Rojave', movie: 'Roja' },
                { title: 'Pachai Nirame', movie: 'Alaipayuthey' },
                { title: 'Uyire Uyire', movie: 'Bombay' }
            ]
        },
        'Anirudh Ravichander': {
            hits: [
                { title: 'Why This Kolaveri Di', movie: '3' },
                { title: 'Vaathi Coming', movie: 'Master' },
                { title: 'Aaluma Doluma', movie: 'Vedalam' },
                { title: 'Arabic Kuthu', movie: 'Beast' },
                { title: 'Surviva', movie: 'Vivegam' }
            ]
        },
        'Ilaiyaraaja': {
            hits: [
                { title: 'Kanne Kalaimane', movie: 'Moondram Pirai' },
                { title: 'Potri Paadadi Penne', movie: 'Thevar Magan' },
                { title: 'Sundari Kannal Oru Sethi', movie: 'Thalapathi' },
                { title: 'Raaga Deevam', movie: 'Vaidehi Kathirunthal' }
            ]
        },
        'Yuvan Shankar Raja': {
            hits: [
                { title: 'Nenjukkul Peidhidum', movie: 'Vaaranam Aayiram' },
                { title: 'Yaaradi Nee Mohini', movie: 'Yaaradi Nee Mohini' },
                { title: 'Evan Di Unna Pethan', movie: 'Avan Ivan' }
            ]
        }
    },
    
    moods: {
        happy: [
            { title: 'Why This Kolaveri Di', artist: 'Anirudh Ravichander', movie: '3' },
            { title: 'Aaluma Doluma', artist: 'Anirudh Ravichander', movie: 'Vedalam' },
            { title: 'Mukkala Mukkabala', artist: 'A.R. Rahman', movie: 'Kaadhalan' }
        ],
        romantic: [
            { title: 'Vennilave Vennilave', artist: 'A.R. Rahman', movie: 'Minsara Kanavu' },
            { title: 'Kadhal Rojave', artist: 'A.R. Rahman', movie: 'Roja' },
            { title: 'Nenjukkul Peidhidum', artist: 'Yuvan Shankar Raja', movie: 'Vaaranam Aayiram' }
        ],
        sad: [
            { title: 'Kanne Kalaimane', artist: 'Ilaiyaraaja', movie: 'Moondram Pirai' },
            { title: 'Pachai Nirame', artist: 'A.R. Rahman', movie: 'Alaipayuthey' },
            { title: 'Mundhinam Paarthene', artist: 'Harris Jayaraj', movie: 'Vaaranam Aayiram' }
        ]
    }
};

module.exports = { musicDatabase };