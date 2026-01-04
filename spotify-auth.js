// Spotify Authentication Routes
const express = require('express');
const axios = require('axios');
const querystring = require('querystring');

const router = express.Router();

// Spotify API credentials (you'll need to register your app at https://developer.spotify.com)
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || 'YOUR_CLIENT_ID';
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || 'YOUR_CLIENT_SECRET';
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:3000/api/spotify/callback';

// Authorization scopes
const SCOPES = [
    'streaming',
    'user-read-email',
    'user-read-private',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-library-read'
].join(' ');

// Store tokens temporarily (in production, use a database)
const tokens = new Map();

// Login route - redirects to Spotify authorization
router.get('/login', (req, res) => {
    const state = generateRandomString(16);
    const authURL = 'https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: CLIENT_ID,
            scope: SCOPES,
            redirect_uri: REDIRECT_URI,
            state: state
        });
    
    res.redirect(authURL);
});

// Callback route - receives authorization code
router.get('/callback', async (req, res) => {
    const code = req.query.code || null;
    const state = req.query.state || null;

    if (state === null) {
        res.redirect('/#' + querystring.stringify({ error: 'state_mismatch' }));
        return;
    }

    try {
        const response = await axios.post(
            'https://accounts.spotify.com/api/token',
            querystring.stringify({
                code: code,
                redirect_uri: REDIRECT_URI,
                grant_type: 'authorization_code'
            }),
            {
                headers: {
                    'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'),
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        const { access_token, refresh_token, expires_in } = response.data;
        
        // Store tokens (use proper session management in production)
        const sessionId = generateRandomString(32);
        tokens.set(sessionId, {
            access_token,
            refresh_token,
            expires_at: Date.now() + (expires_in * 1000)
        });

        // Redirect back to app with session
        res.redirect('/#' + querystring.stringify({
            access_token,
            refresh_token,
            session_id: sessionId
        }));

    } catch (error) {
        console.error('Token exchange error:', error.response?.data || error.message);
        res.redirect('/#' + querystring.stringify({ error: 'invalid_token' }));
    }
});

// Refresh token route
router.post('/refresh-token', async (req, res) => {
    const refresh_token = req.body.refresh_token;

    if (!refresh_token) {
        return res.status(400).json({ error: 'Refresh token required' });
    }

    try {
        const response = await axios.post(
            'https://accounts.spotify.com/api/token',
            querystring.stringify({
                grant_type: 'refresh_token',
                refresh_token: refresh_token
            }),
            {
                headers: {
                    'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'),
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        const { access_token, expires_in } = response.data;
        
        res.json({
            access_token,
            expires_in
        });

    } catch (error) {
        console.error('Token refresh error:', error.response?.data || error.message);
        res.status(400).json({ error: 'Failed to refresh token' });
    }
});

// Get current user profile
router.get('/me', async (req, res) => {
    const access_token = req.headers.authorization?.replace('Bearer ', '');

    if (!access_token) {
        return res.status(401).json({ error: 'No access token provided' });
    }

    try {
        const response = await axios.get('https://api.spotify.com/v1/me', {
            headers: { 'Authorization': `Bearer ${access_token}` }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Profile fetch error:', error.response?.data || error.message);
        res.status(400).json({ error: 'Failed to fetch profile' });
    }
});

// Search tracks
router.get('/search', async (req, res) => {
    const access_token = req.headers.authorization?.replace('Bearer ', '');
    const query = req.query.q;
    const type = req.query.type || 'track';
    const limit = req.query.limit || 10;

    if (!access_token) {
        return res.status(401).json({ error: 'No access token provided' });
    }

    if (!query) {
        return res.status(400).json({ error: 'Query parameter required' });
    }

    try {
        const response = await axios.get(
            `https://api.spotify.com/v1/search?${querystring.stringify({ q: query, type, limit })}`,
            {
                headers: { 'Authorization': `Bearer ${access_token}` }
            }
        );

        res.json(response.data);
    } catch (error) {
        console.error('Search error:', error.response?.data || error.message);
        res.status(400).json({ error: 'Search failed' });
    }
});

// Get recommendations
router.get('/recommendations', async (req, res) => {
    const access_token = req.headers.authorization?.replace('Bearer ', '');

    if (!access_token) {
        return res.status(401).json({ error: 'No access token provided' });
    }

    try {
        const response = await axios.get(
            `https://api.spotify.com/v1/recommendations?${querystring.stringify(req.query)}`,
            {
                headers: { 'Authorization': `Bearer ${access_token}` }
            }
        );

        res.json(response.data);
    } catch (error) {
        console.error('Recommendations error:', error.response?.data || error.message);
        res.status(400).json({ error: 'Failed to get recommendations' });
    }
});

// Helper function to generate random string
function generateRandomString(length) {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    
    return text;
}

module.exports = router;
