const { createSettingService } = require('../services');
const settingService = createSettingService();

async function getSettings(req, res) {
  try {
    const settings = await settingService.getSettings();
    res.json(settings);
  } catch (error) {
    console.error('Error in getSettings:', error);
    res.status(500).json({ error: error.message });
  }
}

async function getSetting(req, res) {
  try {
    const { key } = req.params;
    const value = await settingService.getSetting(key);
    
    if (value === undefined) {
      return res.status(404).json({ error: 'Cài đặt không tồn tại' });
    }
    
    res.json({ key, value });
  } catch (error) {
    console.error('Error in getSetting:', error);
    res.status(500).json({ error: error.message });
  }
}

async function updateSetting(req, res) {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (value === undefined) {
      return res.status(400).json({ error: 'Giá trị cài đặt là bắt buộc' });
    }

    const setting = await settingService.updateSetting(key, value, req.user.id);
    res.json(setting);
  } catch (error) {
    console.error('Error in updateSetting:', error);
    res.status(400).json({ error: error.message });
  }
}

async function createSetting(req, res) {
  try {
    const { key, value, description } = req.body;

    if (!key || value === undefined) {
      return res.status(400).json({ error: 'Khóa và giá trị là bắt buộc' });
    }

    const setting = await settingService.createSetting(
      key,
      value,
      description,
      req.user.id
    );
    res.json(setting);
  } catch (error) {
    console.error('Error in createSetting:', error);
    res.status(400).json({ error: error.message });
  }
}

async function deleteSetting(req, res) {
  try {
    const { key } = req.params;
    await settingService.deleteSetting(key);
    res.json({ success: true, message: 'Đã xóa cài đặt' });
  } catch (error) {
    console.error('Error in deleteSetting:', error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getSettings,
  getSetting,
  updateSetting,
  createSetting,
  deleteSetting
};