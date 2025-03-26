const { MessageCounter, sequelize } = require('../models');
const { Op } = require('sequelize');

function createMessageCounterService() {

  async function incrementMessageCount(type, targetId, senderId, recipientIds) {
    try {
      // Process recipients in batches to avoid locking
      const batchSize = 5;
      for (let i = 0; i < recipientIds.length; i += batchSize) {
        const batch = recipientIds.slice(i, i + batchSize);
        const t = await sequelize.transaction();
        
        try {
          const updates = batch.map(async (recipientId) => {
            if (recipientId === senderId) return; // Skip sender

            const counter = await MessageCounter.findOne({
              where: {
                user_id: recipientId,
                [type === 'room' ? 'room_id' : 'sender_id']: type === 'room' ? targetId : senderId
              },
              transaction: t,
              lock: t.LOCK.UPDATE
            });

            if (counter) {
              await counter.increment({
                total_messages: 1,
                unread_messages: 1
              }, { transaction: t });
              await counter.update({ updated_at: new Date() }, { transaction: t });
            } else {
              await MessageCounter.create({
                user_id: recipientId,
                [type === 'room' ? 'room_id' : 'sender_id']: type === 'room' ? targetId : senderId,
                total_messages: 1,
                unread_messages: 1,
                last_read_at: new Date()
              }, { transaction: t });
            }
          });

          await Promise.all(updates);
          await t.commit();
        } catch (error) {
          await t.rollback();
          throw error;
        }
      }

      return true;
    } catch (error) {
      console.error('Error in incrementMessageCount:', error);
      throw error;
    }
  }

  async function markAsRead(type, userId, targetId, messageCount = null) {
    const t = await sequelize.transaction();
    
    try {
      const counter = await MessageCounter.findOne({
        where: {
          user_id: userId,
          [type === 'room' ? 'room_id' : 'sender_id']: targetId
        },
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      const updateData = {
        unread_messages: 0,
        last_read_at: new Date()
      };

      if (messageCount !== null) {
        updateData.total_messages = messageCount;
      }

      if (counter) {
        await counter.update(updateData, { transaction: t });
      } else {
        await MessageCounter.create({
          user_id: userId,
          [type === 'room' ? 'room_id' : 'sender_id']: targetId,
          total_messages: messageCount || 0,
          unread_messages: 0,
          last_read_at: new Date()
        }, { transaction: t });
      }

      await t.commit();
      return true;
    } catch (error) {
      await t.rollback();
      console.error('Error in markAsRead:', error);
      throw error;
    }
  }

  async function getUnreadCounts(type, userId, targetIds = null) {
    try {
      const where = {
        user_id: userId,
        unread_messages: { [Op.gt]: 0 }
      };

      if (type === 'room') {
        where.room_id = targetIds ? { [Op.in]: targetIds } : { [Op.ne]: null };
      } else {
        where.sender_id = targetIds ? { [Op.in]: targetIds } : { [Op.ne]: null };
      }

      const counters = await MessageCounter.findAll({ where });

      return counters.reduce((acc, counter) => {
        const targetId = type === 'room' ? counter.room_id : counter.sender_id;
        acc[targetId] = counter.unread_messages;
        return acc;
      }, {});
    } catch (error) {
      console.error('Error in getUnreadCounts:', error);
      throw error;
    }
  }

  return {
    incrementMessageCount,
    markAsRead,
    getUnreadCounts
  };
}

module.exports = createMessageCounterService;