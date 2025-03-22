const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statisticsController');
const auth = require('../middleware/auth');

// Ensure all routes are protected by auth middleware
router.get('/overall', auth, statisticsController.getOverallStats);
router.get('/messages', auth, statisticsController.getMessageStats);
router.get('/users', auth, statisticsController.getUserStats);
router.get('/rooms', auth, statisticsController.getRoomStats);
router.get('/activities', auth, statisticsController.getRecentActivities);

module.exports = router;