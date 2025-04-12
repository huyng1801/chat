const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const chatRoomRoutes = require('./chatRoomRoutes');
const roomMemberRoutes = require('./roomMemberRoutes');
const roomBanRoutes = require('./roomBanRoutes');
const roomMessageRoutes = require('./roomMessageRoutes');
const directMessageRoutes = require('./directMessageRoutes');
const statisticsRoutes = require('./statisticsRoutes');
const announcementRoutes = require('./announcementRoutes');
const forbiddenWordRoutes = require('./forbiddenWordRoutes');
const settingRoutes = require('./settingRoutes');
const autoReplyRoutes = require('./autoReplyRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/rooms', chatRoomRoutes);
router.use('/rooms', roomMemberRoutes); // Shares /rooms base path
router.use('/rooms', roomBanRoutes); // Shares /rooms base path
router.use('/rooms', roomMessageRoutes); // Shares /rooms base path
router.use('/direct', directMessageRoutes);
router.use('/statistics', statisticsRoutes);
router.use('/announcements', announcementRoutes);
router.use('/forbidden-words', forbiddenWordRoutes);
router.use('/settings', settingRoutes);
router.use('/auto-replies', autoReplyRoutes);

module.exports = router;