const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /api/analytics/visit - Track page visit (public, no auth needed)
router.post('/visit', (req, res) => {
  try {
    const { visitorId } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    if (!visitorId) {
      return res.status(400).json({ error: 'visitorId required' });
    }

    db.prepare(`
      INSERT INTO visits (visitor_id, ip_address, user_agent)
      VALUES (?, ?, ?)
    `).run(visitorId, ip, userAgent);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to track visit' });
  }
});

// GET /api/analytics/stats - Get visitor stats (public)
router.get('/stats', (req, res) => {
  try {
    const totalVisits = db.prepare('SELECT COUNT(*) as count FROM visits').get().count;
    const uniqueVisitors = db.prepare('SELECT COUNT(DISTINCT visitor_id) as count FROM visits').get().count;
    
    // Visits today
    const visitsToday = db.prepare(`
      SELECT COUNT(*) as count FROM visits 
      WHERE DATE(visited_at) = DATE('now')
    `).get().count;

    // Visits this week
    const visitsThisWeek = db.prepare(`
      SELECT COUNT(*) as count FROM visits 
      WHERE DATE(visited_at) >= DATE('now', '-7 days')
    `).get().count;

    // Visits this month
    const visitsThisMonth = db.prepare(`
      SELECT COUNT(*) as count FROM visits 
      WHERE strftime('%Y-%m', visited_at) = strftime('%Y-%m', 'now')
    `).get().count;

    res.json({
      success: true,
      stats: {
        totalVisits,
        uniqueVisitors,
        visitsToday,
        visitsThisWeek,
        visitsThisMonth,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

module.exports = router;
