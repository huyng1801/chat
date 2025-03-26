const { createDirectMessageService } = require('../services');
const directMessageService = createDirectMessageService();

async function getDirectMessages(req, res) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const messages = await directMessageService.getDirectMessages(
      req.user.id,
      req.params.userId,
      parseInt(page),
      parseInt(limit)
    );
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function createDirectMessage(req, res) {
  try {
    const { content, type } = req.body;
    const message = await directMessageService.createDirectMessage(
      req.user.id,
      req.params.userId,
      content,
      type
    );
    res.json(message);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = {
  getDirectMessages,
  createDirectMessage
};