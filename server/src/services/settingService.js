const { Setting } = require('../models');

function createSettingService() {
  async function getSettings() {
    try {
      const settings = await Setting.findAll();
      return settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {});
    } catch (error) {
      console.error('Error getting settings:', error);
      throw error;
    }
  }

  async function getSetting(key) {
    try {
      const setting = await Setting.findOne({ where: { key } });
      return setting?.value;
    } catch (error) {
      console.error('Error getting setting:', error);
      throw error;
    }
  }

  async function updateSetting(key, value, userId) {
    try {
      const setting = await Setting.findOne({ where: { key } });
      
      if (!setting) {
        throw new Error('Cài đặt không tồn tại');
      }

      await setting.update({
        value,
        created_by: userId
      });

      return setting;
    } catch (error) {
      console.error('Error updating setting:', error);
      throw error;
    }
  }

  async function createSetting(key, value, description, userId) {
    try {
      const setting = await Setting.create({
        key,
        value,
        description,
        created_by: userId
      });

      return setting;
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('Cài đặt này đã tồn tại');
      }
      throw error;
    }
  }

  async function deleteSetting(key) {
    try {
      const result = await Setting.destroy({ where: { key } });
      
      if (result === 0) {
        throw new Error('Cài đặt không tồn tại');
      }

      return true;
    } catch (error) {
      console.error('Error deleting setting:', error);
      throw error;
    }
  }

  return {
    getSettings,
    getSetting,
    updateSetting,
    createSetting,
    deleteSetting
  };
}

module.exports = createSettingService;