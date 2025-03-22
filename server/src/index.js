require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { sequelize, User, ChatRoom, Message, RoomMember, RoomBan, DirectMessage } = require('./models');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const statisticsRoutes = require('./routes/statisticsRoutes');
const createChatHandler = require('./socket/chatHandler');
const seed = require('./database/seed');

async function checkAndSeedDatabase() {
  try {
    // Check each table for existing data
    const tables = {
      users: await User.count(),
      chatRooms: await ChatRoom.count(),
      messages: await Message.count(),
      roomMembers: await RoomMember.count(),
      roomBans: await RoomBan.count(),
      directMessages: await DirectMessage.count()
    };

    console.log('\nKiểm tra dữ liệu hiện có:');
    Object.entries(tables).forEach(([table, count]) => {
      console.log(`- ${table}: ${count} bản ghi`);
    });

    // If any table is empty, perform seeding
    const hasEmptyTables = Object.values(tables).some(count => count === 0);
    
    if (hasEmptyTables) {
      console.log('\nPhát hiện bảng trống, bắt đầu tạo dữ liệu mẫu...');
      await seed();
      
      // Verify seeding results
      const verifyTables = {
        users: await User.count(),
        chatRooms: await ChatRoom.count(),
        messages: await Message.count(),
        roomMembers: await RoomMember.count(),
        roomBans: await RoomBan.count(),
        directMessages: await DirectMessage.count()
      };

      console.log('\nKết quả tạo dữ liệu mẫu:');
      Object.entries(verifyTables).forEach(([table, count]) => {
        console.log(`- ${table}: ${count} bản ghi`);
      });
    } else {
      console.log('\nTất cả các bảng đã có dữ liệu, bỏ qua bước tạo dữ liệu mẫu.');
    }

    return true;
  } catch (error) {
    console.error('Lỗi khi kiểm tra và tạo dữ liệu mẫu:', error);
    throw error;
  }
}

async function startServer() {
  try {
    // Sync database without force or alter
    console.log('Đồng bộ hóa cơ sở dữ liệu...');
    await sequelize.sync();
    console.log('Đồng bộ hóa hoàn tất!');

    // Check and seed database if needed
    await checkAndSeedDatabase();

    const app = express();
    const server = http.createServer(app);
    const io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    // Middleware
    app.use(cors());
    app.use(express.json());

    // Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/chat', chatRoutes);
    app.use('/api/statistics', statisticsRoutes);

    // Socket.IO handling
    const chatHandler = createChatHandler(io);
    io.on('connection', chatHandler.handleConnection);

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({ error: 'Đã xảy ra lỗi!' });
    });

    const PORT = process.env.PORT || 3001;
    server.listen(PORT, () => {
      console.log(`Server đang chạy trên cổng ${PORT}`);
    });
  } catch (error) {
    console.error('Lỗi khởi động server:', error);
    process.exit(1);
  }
}

startServer().catch(console.error);