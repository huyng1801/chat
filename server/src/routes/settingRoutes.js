const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const settingController = require('../controllers/settingController');

router.get('/', auth, settingController.getSettings);
router.get('/:key', auth, settingController.getSetting);
router.put('/:key', auth, settingController.updateSetting);
router.post('/', auth, settingController.createSetting);
router.delete('/:key', auth, settingController.deleteSetting);

module.exports = router;