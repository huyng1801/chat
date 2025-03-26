const { ForbiddenWord } = require('../../models');

async function seedForbiddenWords(users, rooms) {
  const wordCount = await ForbiddenWord.count();
  if (wordCount > 0) {
    console.log('Bảng forbidden_words đã có dữ liệu, bỏ qua...');
    return;
  }

  console.log('Tạo dữ liệu mẫu cho bảng forbidden_words...');
  await ForbiddenWord.bulkCreate([
    {
      room_id: rooms[0].id,
      word: 'spam',
      action: 'block',
      created_by: users[0].id
    },
    {
      room_id: rooms[0].id,
      word: 'hack',
      action: 'block',
      created_by: users[0].id
    },
    {
      room_id: rooms[1].id,
      word: 'stupid',
      action: 'censor',
      created_by: users[1].id
    },
    {
      room_id: rooms[2].id,
      word: 'idiot',
      action: 'censor',
      created_by: users[2].id
    }
  ]);
}

module.exports = seedForbiddenWords;