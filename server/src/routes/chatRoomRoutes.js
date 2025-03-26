const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const chatRoomController = require('../controllers/chatRoomController');

router.get('/', auth, chatRoomController.getRooms);
router.get('/:id', auth, chatRoomController.getRoom);
router.post('/', auth, chatRoomController.createRoom);
router.put('/:id', auth, chatRoomController.updateRoom);
router.delete('/:id', auth, chatRoomController.deleteRoom);

module.exports = router;