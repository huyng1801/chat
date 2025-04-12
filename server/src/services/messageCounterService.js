const { createClient } = require('redis');

function createMessageCounterService() {
  // Create Redis client using secure connection to Redis Cloud
  const client = createClient({
    url: 'redis://default:Sro9wcIp7nIQkQih1xP3uaZS5vbF546I@redis-19382.c299.asia-northeast1-1.gce.redns.redis-cloud.com:19382'
  });


  // Connect to Redis
  client.connect().catch(console.error);

  // Handle Redis errors
  client.on('error', err => console.error('Redis Client Error:', err));

  // Helper functions
  const getCounterKey = (type, userId, targetId) => `counter:${type}:${userId}:${targetId}`;
  const getUnreadKey = (type, userId, targetId) => `unread:${type}:${userId}:${targetId}`;
  const getLastReadKey = (type, userId, targetId) => `lastread:${type}:${userId}:${targetId}`;

  async function incrementMessageCount(type, targetId, senderId, recipientIds) {
    try {
      const pipeline = client.multi();
      for (const recipientId of recipientIds) {
        if (recipientId === senderId) continue;
        pipeline.incr(getCounterKey(type, recipientId, targetId));
        pipeline.incr(getUnreadKey(type, recipientId, targetId));
      }
      await pipeline.exec();
      return true;
    } catch (error) {
      console.error('Error in incrementMessageCount:', error);
      throw error;
    }
  }

  async function markAsRead(type, userId, targetId, messageCount = null) {
    try {
      const pipeline = client.multi();
      pipeline.set(getUnreadKey(type, userId, targetId), 0);
      pipeline.set(getLastReadKey(type, userId, targetId), new Date().toISOString());
      if (messageCount !== null) {
        pipeline.set(getCounterKey(type, userId, targetId), messageCount);
      }
      await pipeline.exec();
      return true;
    } catch (error) {
      console.error('Error in markAsRead:', error);
      throw error;
    }
  }

  async function getUnreadCounts(type, userId, targetIds = null) {
    try {
      const pipeline = client.multi();
      const targets = targetIds || [];
      if (!targetIds) {
        const pattern = `unread:${type}:${userId}:*`;
        const keys = await client.keys(pattern);
        targets.push(...keys.map(key => key.split(':')[3]));
      }
      for (const targetId of targets) {
        pipeline.get(getUnreadKey(type, userId, targetId));
      }
      const results = await pipeline.exec();
      return targets.reduce((acc, targetId, index) => {
        const count = parseInt(results[index]) || 0;
        if (count > 0) acc[targetId] = count;
        return acc;
      }, {});
    } catch (error) {
      console.error('Error in getUnreadCounts:', error);
      throw error;
    }
  }

  async function cleanup() {
    await client.quit();
  }

  return {
    incrementMessageCount,
    markAsRead,
    getUnreadCounts,
    cleanup
  };
}

module.exports = createMessageCounterService;
