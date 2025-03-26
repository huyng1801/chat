const { createChatRoomService } = require('../services');
const chatRoomService = createChatRoomService();

async function getRooms(req, res) {
  try {
    const { 
      page,
      limit,
      search,
      sortBy,
      sortOrder
    } = req.query;

    const result = await chatRoomService.getRooms({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      search: search || '',
      sortBy: sortBy || 'created_at',
      sortOrder: sortOrder || 'desc'
    });

    res.json(result);
  } catch (error) {
    console.error('Error in getRooms:', error);
    res.status(500).json({ error: error.message });
  }
}

async function getRoom(req, res) {
  try {
    const room = await chatRoomService.getRoomById(req.params.id);
    if (!room) {
      throw new Error('Phòng chat không tồn tại');
    }
    res.json(room);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}

async function createRoom(req, res) {
  try {
    const { name, description } = req.body;
    const room = await chatRoomService.createRoom(name, description, req.user.id);
    res.json(room);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function updateRoom(req, res) {
  try {
    const { name, description } = req.body;
    await chatRoomService.updateRoom(req.params.id, name, description);
    const room = await chatRoomService.getRoomById(req.params.id);
    res.json(room);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function deleteRoom(req, res) {
  try {
    await chatRoomService.deleteRoom(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getRooms,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom
};