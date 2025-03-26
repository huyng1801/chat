const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const directMessageController = require('../controllers/directMessageController');

router.get('/:userId/messages', auth, directMessageController.getDirectMessages);
router.post('/:userId/messages', auth, directMessageController.createDirectMessage);

module.exports = router;