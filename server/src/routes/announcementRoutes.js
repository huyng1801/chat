const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const announcementController = require('../controllers/announcementController');

// Announcement routes
router.get('/', auth, announcementController.getAnnouncements);
router.post('/', auth, announcementController.createAnnouncement);
router.put('/:id', auth, announcementController.updateAnnouncement);
router.delete('/:id', auth, announcementController.deleteAnnouncement);

module.exports = router;