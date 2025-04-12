const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const autoReplyController = require('../controllers/autoReplyController');

router.get('/', auth, autoReplyController.getAutoReplies);
router.post('/', auth, autoReplyController.createAutoReply);
router.put('/:id', auth, autoReplyController.updateAutoReply);
router.delete('/:id', auth, autoReplyController.deleteAutoReply);
router.post('/check', auth, autoReplyController.checkMessage);

module.exports = router;