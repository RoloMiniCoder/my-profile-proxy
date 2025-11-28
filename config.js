const LASTFM_USER = 'darkstahrl';
const STEAM_USER_ID = process.env.STEAM_USER_ID;
const LAST_FM_API_KEY = process.env.LAST_FM_API_KEY;
const STEAM_API_KEY = process.env.STEAM_API_KEY;

module.exports = {
    PORT: process.env.PORT || 3001,
    CACHE_TTL: 10 * 60 * 1000, // 10 minutes in ms
    CORS_ALLOWED_ORIGINS: ['http://localhost:5173', 'https://your-react-app.com'],
    GH_IMG_LINK_PREFIX: 'https://opengraph.githubassets.com/0/RoloMiniCoder/',

    // External API URLs
    GITHUB_URL: `https://api.github.com/users/rolominicoder/starred`,
    STEAM_URL: `https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${STEAM_API_KEY}&steamid=${STEAM_USER_ID}&format=json`,
    RECENT_TRACKS_URL: `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${LASTFM_USER}&api_key=${LAST_FM_API_KEY}&format=json`,
    TOP_TRACKS_URL: `https://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user=${LASTFM_USER}&api_key=${LAST_FM_API_KEY}&format=json&limit=10&period=7day`,
    TOP_ARTISTS_URL: `https://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user=${LASTFM_USER}&api_key=${LAST_FM_API_KEY}&format=json&limit=10&period=7day`,
};