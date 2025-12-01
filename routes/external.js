const express = require('express');
const router = express.Router();
const config = require('../config');
const { quotes } = require('../quotes.json'); // Adjust path as needed

// CACHE objects for external APIs
let topTrackCache = { data: null, timestamp: 0 };
let weeklyTracksCache = { data: null, timestamp: 0 };
let githubCache = { data: null, timestamp: 0 };
let steamCache = { data: null, timestamp: 0 };
let musicDataCache = { data: null, timestamp: 0 };
let nowPlayingCache = { data: null, timestamp: 0 };

async function fetchAllRecentTracks({ fromTs, toTs }) {
    const limit = 200;
    let page = 1;
    let all = [];

    while (true) {
        const url = `${config.RECENT_TRACKS_URL}&from=${fromTs}&to=${toTs}&format=json&limit=${limit}&page=${page}`;
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

async function getWeeklySummary() {
    const now = Math.floor(Date.now() / 1000);
    const sevenDaysAgo = now - 7 * 24 * 60 * 60;
    const allTracks = await fetchAllRecentTracks({ fromTs: sevenDaysAgo, toTs: now });

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

router.get('/music', async (req, res) => {
    if (topTrackCache.data && Date.now() - topTrackCache.timestamp < config.CACHE_TTL) {
        return res.json(topTrackCache.data);
    }
    try {
        const apiResponse = await fetch(config.TOP_TRACKS_URL);
        const topTracks = await apiResponse.json().then(response => response.toptracks.track);
        topTrackCache = { data: topTracks, timestamp: Date.now() };
        res.json(topTracks);
    } catch (error) {
        console.error('External API fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch data from external service.' });
    }
});

router.get('/music/summary', async (req, res) => {
    try {
        if (weeklyTracksCache.data && Date.now() - weeklyTracksCache.timestamp < config.CACHE_TTL) {
            return res.json(weeklyTracksCache.data);
        }
        const summary = await getWeeklySummary();
        weeklyTracksCache = { data: summary, timestamp: Date.now() };
        res.json(summary);
    } catch (err) {
        console.error('Error fetching Last.fm summary:', err);
        res.status(500).json({ error: 'Failed to fetch Last.fm data.' });
    }
});

router.get('/music/data', async (req, res) => {
    try {
        if (musicDataCache.data && Date.now() - musicDataCache.timestamp < config.CACHE_TTL) {
            return res.json(musicDataCache.data);
        }
        const [topTracks, topArtists] = await Promise.all([
            fetch(config.TOP_TRACKS_URL).then(response => response.json()).then(response => response.toptracks.track),
            fetch(config.TOP_ARTISTS_URL).then(response => response.json()).then(response => response.topartists.artist)
        ]);
        musicDataCache = { data: { topTracks, topArtists }, timestamp: Date.now() };
        res.json(musicDataCache.data);
    } catch (error) {
        console.error('External API fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch data from external service.' });
    }
});

router.get('/music/playing', async (req, res) => {
    try {
        if (nowPlayingCache.data && Date.now() - nowPlayingCache.timestamp < 60000) {
            return res.json(nowPlayingCache.data);
        }
        const response = await fetch(config.RECENT_TRACKS_URL)
        const parsed = await response.json()
        const currentlyPlaying = parsed.recenttracks.track[0]['@attr']?.nowplaying ? parsed.recenttracks.track[0] : null;
        const cleanedUp = currentlyPlaying ? {
            artist: currentlyPlaying.artist['#text'],
            album: currentlyPlaying.album[`#text`],
            url: currentlyPlaying.url,
            name: currentlyPlaying.name
        } : {};
        nowPlayingCache = { data: cleanedUp, timestamp: Date.now() };
        res.json(cleanedUp)
    } catch (error) {
        console.error('External API fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch data from external service.' });
    }
});


router.get(`/github/starred`, async (req, res) => {
    try {
        if (githubCache.data && Date.now() - githubCache.timestamp < config.CACHE_TTL) {
            return res.json(githubCache.data);
        }
        const apiResponse = await fetch(config.GITHUB_URL);
        const apiData = await apiResponse.json();
        const cleanedData = apiData.map(({ html_url, name, description }) => {
            return {
                html_url,
                name,
                description,
                image: config.GH_IMG_LINK_PREFIX + name
            }
        });
        githubCache = { data: cleanedData, timestamp: Date.now() };
        res.json(cleanedData);
    } catch (error) {
        console.error('External API fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch data from external service.' });
    }
});

router.get(`/steam/recently`, async (req, res) => {
    try {
        if (steamCache.data && Date.now() - steamCache.timestamp < config.CACHE_TTL) {
            return res.json(steamCache.data);
        }
        const apiResponse = await fetch(config.STEAM_URL);
        const apiData = await apiResponse.json().then(response => response.response.games);
        steamCache = { data: apiData, timestamp: Date.now() };
        res.json(apiData);
    } catch (error) {
        console.error('External API fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch data from external service.' });
    }
});

router.get(`/quotes`, (req, res) => {
    const quote = quotes[Math.floor(Math.random() * quotes.length)]
    res.json({ quote })
});

module.exports = router;