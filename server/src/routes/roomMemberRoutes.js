const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roomMemberController = require('../controllers/roomMemberController');

router.post('/:id/join', auth, roomMemberController.joinRoom);
router.post('/:id/leave', auth, roomMemberController.leaveRoom);
router.post('/:id/members/:userId/accept', auth, roomMemberController.acceptMember);
router.post('/:id/members/:userId/reject', auth, roomMemberController.rejectMember);
router.post('/:id/members/:userId/kick', auth, roomMemberController.kickMember);
router.get('/:id/members', auth, roomMemberController.getRoomMembers);
router.get('/:id/members/pending', auth, roomMemberController.getPendingMembers);
router.put('/:roomId/members/:userId/role', auth, roomMemberController.updateUserRole);

module.exports = router;