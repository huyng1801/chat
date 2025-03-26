const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/register', auth, authController.register);
router.post('/login', authController.login);
router.post('/logout', auth, authController.logout);
router.get('/me', auth, authController.getCurrentUser);
router.put('/profile', auth, authController.updateProfile);
router.post('/change-password', auth, authController.changePassword);
router.post('/forgot-password', authController.forgotPassword);

module.exports = router;