const createStatisticsService = require('../services/statisticsService');
const statisticsService = createStatisticsService();

async function getOverallStats(req, res) {
  try {
    const stats = await statisticsService.getOverallStats();
    res.json(stats);
  } catch (error) {
    console.error('Error in getOverallStats:', error);
    res.status(500).json({ error: error.message });
  }
}

async function getMessageStats(req, res) {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      throw new Error('Yêu cầu startDate và endDate');
    }
    const stats = await statisticsService.getMessageStats(startDate, endDate);
    res.json(stats);
  } catch (error) {
    console.error('Error in getMessageStats:', error);
    res.status(400).json({ error: error.message });
  }
}

async function getUserStats(req, res) {
  try {
    const stats = await statisticsService.getUserStats();
    res.json(stats);
  } catch (error) {
    console.error('Error in getUserStats:', error);
    res.status(500).json({ error: error.message });
  }
}

async function getRoomStats(req, res) {
  try {
    const stats = await statisticsService.getRoomStats();
    res.json(stats);
  } catch (error) {
    console.error('Error in getRoomStats:', error);
    res.status(500).json({ error: error.message });
  }
}

async function getRecentActivities(req, res) {
  try {
    const { limit } = req.query;
    const activities = await statisticsService.getRecentActivities(parseInt(limit) || 10);
    res.json(activities);
  } catch (error) {
    console.error('Error in getRecentActivities:', error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getOverallStats,
  getMessageStats,
  getUserStats,
  getRoomStats,
  getRecentActivities
};