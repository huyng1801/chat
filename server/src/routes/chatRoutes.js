const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../middleware/auth');

// Room routes
router.get('/rooms', auth, chatController.getRooms);
router.get('/rooms/:id', auth, chatController.getRoom);
router.post('/rooms', auth, chatController.createRoom);
router.put('/rooms/:id', auth, chatController.updateRoom);
router.delete('/rooms/:id', auth, chatController.deleteRoom);

// Room membership routes
router.post('/rooms/:id/join', auth, chatController.joinRoom);
router.post('/rooms/:id/leave', auth, chatController.leaveRoom);
router.post('/rooms/:id/members/:userId/accept', auth, chatController.acceptMember);
router.post('/rooms/:id/members/:userId/reject', auth, chatController.rejectMember);
router.post('/rooms/:id/members/:userId/kick', auth, chatController.kickMember);
router.get('/rooms/:id/members', auth, chatController.getRoomMembers);
router.get('/rooms/:id/members/pending', auth, chatController.getPendingMembers);

// Ban management routes
router.post('/rooms/:roomId/bans/:userId', auth, chatController.banUser);
router.delete('/rooms/:id/bans/:userId', auth, chatController.unbanUser);
router.get('/rooms/:id/bans', auth, chatController.getBannedUsers);

// Message routes
router.get('/rooms/:roomId/messages', auth, chatController.getRoomMessages);
router.post('/rooms/:roomId/messages', auth, chatController.createMessage);

// Direct messages
router.get('/direct/:userId/messages', auth, chatController.getDirectMessages);
router.post('/direct/:userId/messages', auth, chatController.createDirectMessage);

router.put('/rooms/:roomId/members/:userId/role', auth, chatController.updateUserRole);
router.get('/rooms/:roomId/bans/:userId/status', auth, chatController.checkBanStatus);
module.exports = router;