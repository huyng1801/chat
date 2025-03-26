const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const forbiddenWordController = require('../controllers/forbiddenWordController');

// All routes are under /rooms/:roomId/forbidden-words
router.get('/:roomId/forbidden-words', auth, forbiddenWordController.getForbiddenWords);
router.post('/:roomId/forbidden-words', auth, forbiddenWordController.addForbiddenWord);
router.delete('/:roomId/forbidden-words/:id', auth, forbiddenWordController.removeForbiddenWord);
router.post('/:roomId/forbidden-words/check', auth, forbiddenWordController.checkMessage);

module.exports = router;