const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

router.get('/', auth, userController.getUsers);
router.get('/chat', auth, userController.getChatUsers); // New route for chat users
router.get('/:id', auth, userController.getUser);
router.post('/', auth, userController.createUser);
router.put('/:id', auth, userController.updateUser);
router.put('/:id/avatar', auth, userController.updateAvatar);
router.put('/:id/reset-password', auth, userController.resetPassword);
router.delete('/:id', auth, userController.deleteUser);


module.exports = router;