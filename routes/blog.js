const express = require('express');
const router = express.Router();

router.get('/posts', async (req, res) => {
    const pool = req.dbPool;
    const postType = req.query.type;

    let query = `
        SELECT id, title, post_type, content_body, thumbnail_url, created_at, updated_at
        FROM posts
        ORDER BY created_at DESC
    `;
    const values = [];

    // Filter by post_type if the query parameter is present
    if (postType) {
        query = `
            SELECT id, title, post_type, content_body, thumbnail_url, created_at, updated_at
            FROM posts
            WHERE post_type = $1
            ORDER BY created_at DESC
        `;
        values.push(postType);
    }

    try {
        const result = await pool.query(query, values);

        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching blog posts from database:', err);
        res.status(500).json({ error: 'Internal server error while fetching posts.' });
    }
});

router.get('/posts/latest', async (req, res) => {
    const pool = req.dbPool;

    const query = `
        SELECT id, title, post_type, content_body, thumbnail_url, created_at, updated_at
        FROM posts
        ORDER BY created_at DESC
        LIMIT 1;
    `;

    try {
        const result = await pool.query(query);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No posts found.' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching the latest post:', err);
        res.status(500).json({ error: 'Internal server error while fetching the latest post.' });
    }
});

module.exports = router;