const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roomMessageController = require('../controllers/roomMessageController');

router.get('/:roomId/messages', auth, roomMessageController.getRoomMessages);
router.post('/:roomId/messages', auth, roomMessageController.createMessage);
router.get('/:roomId/messages/unread', auth, roomMessageController.getUnreadMessageCount);

module.exports = router;