const { ForbiddenWord, User, RoomMember } = require('../models');
const { Op } = require('sequelize');

function createForbiddenWordService() {
  async function getForbiddenWords(roomId) {
    try {
      const words = await ForbiddenWord.findAll({
        where: { room_id: roomId },
        include: [{
          model: User,
          as: 'creator',
          attributes: ['username', 'display_name']
        }],
        order: [['created_at', 'DESC']]
      });

      return words;
    } catch (error) {
      console.error('Error getting forbidden words:', error);
      throw error;
    }
  }

  async function addForbiddenWord(roomId, word, action, userId) {
    try {
      // Check if user is moderator or creator
      const member = await RoomMember.findOne({
        where: {
          room_id: roomId,
          user_id: userId,
          role: 'moderator'
        }
      });

      if (!member) {
        throw new Error('Không có quyền thêm từ cấm');
      }

      // Normalize Vietnamese word
      const normalizedWord = word.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D');

      const newWord = await ForbiddenWord.create({
        room_id: roomId,
        word: normalizedWord,
        action,
        created_by: userId
      });

      return newWord;
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('Từ cấm này đã tồn tại trong phòng');
      }
      throw error;
    }
  }

  async function removeForbiddenWord(roomId, id, userId) {
    try {
      // Check if user is moderator or creator
      const member = await RoomMember.findOne({
        where: {
          room_id: roomId,
          user_id: userId,
          role: 'moderator'
        }
      });

      if (!member) {
        throw new Error('Không có quyền xóa từ cấm');
      }

      await ForbiddenWord.destroy({
        where: {
          id,
          room_id: roomId
        }
      });

      return true;
    } catch (error) {
      throw error;
    }
  }

  async function checkMessage(roomId, content, userRole) {
    try {
      // Allow admins, owners, and moderators to bypass checks
      if (['admin', 'owner', 'moderator'].includes(userRole)) {
        return {
          isAllowed: true,
          content
        };
      }

      // Get forbidden words for this room
      const forbiddenWords = await ForbiddenWord.findAll({
        where: { room_id: roomId }
      });

      let modifiedContent = content;
      let isBlocked = false;

      // Normalize message content for comparison
      const normalizedContent = content.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D');

      // Check each word in the message
      const contentWords = normalizedContent.split(/\s+/);
      for (const word of contentWords) {
        const matchingWord = forbiddenWords.find(fw => 
          word === fw.word || // Exact match
          word.includes(fw.word) || // Contains forbidden word
          fw.word.includes(word) // Word is part of a forbidden phrase
        );

        if (matchingWord) {
          if (matchingWord.action === 'block') {
            isBlocked = true;
            break;
          } else if (matchingWord.action === 'censor') {
            // Find the original word/phrase in content that matches
            const regex = new RegExp(matchingWord.word, 'gi');
            modifiedContent = modifiedContent.replace(regex, '*'.repeat(matchingWord.word.length));
          }
        }
      }

      return {
        isAllowed: !isBlocked,
        content: modifiedContent
      };
    } catch (error) {
      console.error('Error in checkMessage:', error);
      return { isAllowed: true, content }; // Allow message on error
    }
  }

  return {
    getForbiddenWords,
    addForbiddenWord,
    removeForbiddenWord,
    checkMessage
  };
}

module.exports = createForbiddenWordService;