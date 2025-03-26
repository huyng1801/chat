const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roomBanController = require('../controllers/roomBanController');

router.post('/:roomId/bans/:userId', auth, roomBanController.banUser);
router.delete('/:id/bans/:userId', auth, roomBanController.unbanUser);
router.get('/:id/bans', auth, roomBanController.getBannedUsers);
router.get('/:roomId/bans/:userId/status', auth, roomBanController.checkBanStatus);

module.exports = router;