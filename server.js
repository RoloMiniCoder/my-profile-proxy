const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const { quotes } = require('./quotes.json')

const STEAM_API_KEY = process.env.STEAM_API_KEY;
const STEAM_USER_ID = process.env.STEAM_USER_ID;
const STEAM_URL = `https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${STEAM_API_KEY}&steamid=${STEAM_USER_ID}&format=json`
const PORT = process.env.PORT
const LASTFM_USER = 'darkstahrl';
const LAST_FM_API_KEY = process.env.LAST_FM_API_KEY;
const RECENT_TRACKS_URL = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${LASTFM_USER}&api_key=${LAST_FM_API_KEY}`;
const TOP_TRACKS_URL = `https://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user=${LASTFM_USER}&api_key=${LAST_FM_API_KEY}&format=json&limit=10&period=7day`;
const TOP_ARTISTS_URL = `https://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user=${LASTFM_USER}&api_key=${LAST_FM_API_KEY}&format=json&limit=10&period=7day`
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes in ms

// Chache for weeklySummary
let weeklyTracksCache = {
    data: null,
    timestamp: 0,
};

// Cache for topTracks
let topTrackCache = {
    data: null,
    timestamp: 0,
};

// Cache for github starred repos
let githubCache = {
    data: null,
    timestamp: 0,
};

// Cache for steam recently played games
let steamCache = {
    data: null,
    timestamp: 0,
}

// Replace 'http://localhost:3000' with your actual React app's URL in production
const corsOptions = {
    origin: ['http://localhost:5173', 'https://your-react-app.com'],
    optionsSuccessStatus: 200 // For legacy browser support
};
app.use(cors(corsOptions));
//might not need? :thinking:
app.use(express.json()); // Optional: if you need to read JSON from the React request body

app.get('/api/music', async (req, res) => {
    // 🧠 Serve cached data if within TTL
    if (topTrackCache.data && Date.now() - topTrackCache.timestamp < CACHE_TTL) {
        console.log(`Serving cached top track data.`)
        return res.json(topTrackCache.data);
    }

    if (!LAST_FM_API_KEY) {
        return res.status(500).json({ error: 'Server key not configured.' });
    }

    try {
        const apiResponse = await fetch(TOP_TRACKS_URL);
        const topTracks = await apiResponse.json().then(response => response.toptracks.track)

        // 💾 Store in cache
        topTrackCache = {
            data: topTracks,
            timestamp: Date.now(),
        };

        res.json(topTracks);
    } catch (error) {
        console.error('External API fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch data from external service.' });
    }
});

// Helper: fetch recent tracks (paged)
async function fetchAllRecentTracks({ fromTs, toTs }) {
    const limit = 200;
    let page = 1;
    let all = [];

    while (true) {
        const url = `${RECENT_TRACKS_URL}&from=${fromTs}&to=${toTs}&format=json&limit=${limit}&page=${page}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error(`Last.fm fetch failed with status ${res.status}`);
        const json = await res.json();

        const tracks = json.recenttracks?.track || [];
        if (!tracks.length) break;

        all.push(...tracks);

        const pageAttr = json.recenttracks['@attr'];
        const currentPage = Number(pageAttr?.page || page);
        const totalPages = Number(pageAttr?.totalPages || 1);

        if (currentPage >= totalPages) break;
        page++;
    }

    return all;
}

// Core: compute weekly summary
async function getWeeklySummary() {
    const now = Math.floor(Date.now() / 1000);
    const sevenDaysAgo = now - 7 * 24 * 60 * 60;

    const allTracks = await fetchAllRecentTracks({
        fromTs: sevenDaysAgo,
        toTs: now,
    });

    const totalScrobbles = allTracks.length;

    const uniqueTracks = new Set(
        allTracks.map((t) => `${t.artist['#text'] || t.artist.name}::${t.name}`)
    ).size;

    const artistCounts = allTracks.reduce((acc, t) => {
        const artist = t.artist['#text'] || t.artist.name;
        acc[artist] = (acc[artist] || 0) + 1;
        return acc;
    }, {});

    const sortedArtists = Object.entries(artistCounts).sort((a, b) => b[1] - a[1]);
    const topArtist = sortedArtists[0]?.[0] ?? null;
    const topArtistPlays = sortedArtists[0]?.[1] ?? 0;

    return { totalScrobbles, uniqueTracks, topArtist, topArtistPlays };
}

// Route: /api/music/summary
app.get('/api/music/summary', async (req, res) => {
    try {
        // 🧠 Serve cached data if within TTL
        if (weeklyTracksCache.data && Date.now() - weeklyTracksCache.timestamp < CACHE_TTL) {
            console.log(`Serving cached weekly summary data.`)
            return res.json(weeklyTracksCache.data);
        }

        const summary = await getWeeklySummary();

        // 💾 Store in cache
        weeklyTracksCache = {
            data: summary,
            timestamp: Date.now(),
        };

        res.json(summary);
    } catch (err) {
        console.error('Error fetching Last.fm summary:', err);
        res.status(500).json({ error: 'Failed to fetch Last.fm data.' });
    }
});

app.get(`/api/github/starred`, async (req, res) => {
    try {
        // 🧠 Serve cached data if within TTL
        if (githubCache.data && Date.now() - githubCache.timestamp < CACHE_TTL) {
            console.log(`Serving cached github data.`)
            return res.json(githubCache.data);
        }

        const githubUrl = `https://api.github.com/users/rolominicoder/starred`;
        const apiResponse = await fetch(githubUrl);
        const apiData = await apiResponse.json();

        githubCache = {
            data: apiData,
            timestamp: Date.now(),
        }

        res.json(apiData);
    } catch (error) {
        console.error('External API fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch data from external service.' });
    }
})

app.get(`/api/steam/recently`, async (req, res) => {
    try {
        // 🧠 Serve cached data if within TTL
        if (steamCache.data && Date.now() - steamCache.timestamp < CACHE_TTL) {
            console.log(`Serving cached steam data.`)
            return res.json(steamCache.data);
        }

        const apiResponse = await fetch(STEAM_URL);
        const apiData = await apiResponse.json()
            .then(response => response.response.games);

        steamCache = {
            data: apiData,
            timestamp: Date.now(),
        }

        res.json(apiData);
    } catch (error) {
        console.error('External API fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch data from external service.' });
    }
})

let musicDataCache = {
    data: null,
    timestamp: 0,
}

app.get(`/api/music/data`, async (req, res) => {
    try {
        // 🧠 Serve cached data if within TTL
        if (musicDataCache.data && Date.now() - musicDataCache.timestamp < CACHE_TTL) {
            console.log(`Serving cached aggregate music data.`)
            return res.json(musicDataCache.data);
        }

        const [topTracks, topArtists] = await Promise.all([
            fetch(TOP_TRACKS_URL)
                .then(response => response.json())
                .then(response => {
                    return response.toptracks.track
                }),
            fetch(TOP_ARTISTS_URL)
                .then(response => response.json())
                .then(response => {
                    return response.topartists.artist
                })
        ]);

        musicDataCache = {
            data: {
                topTracks,
                topArtists
            },
            timestamp: Date.now(),
        }

        setTimeout(()=>res.json(musicDataCache.data),2500);

    } catch (error) {
        console.error('External API fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch data from external service.' });
    }
})

app.get(`/api/quotes`, async (req, res) => {
    const quote = quotes[Math.floor(Math.random() * quotes.length)]
    console.log(quote)
    res.json({ quote })
})

app.listen(PORT, () => {
    console.log(`Proxy listening on port ${PORT}`);
});