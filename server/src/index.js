require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { sequelize } = require('./models');
const routes = require('./routes');
const createChatHandler = require('./socket/chatHandler');
const createAnnouncementService = require('./services/announcementService');
const seed = require('./database/seed');

async function startServer() {
  try {
    // Sync database without force or alter
    console.log('Đồng bộ hóa cơ sở dữ liệu...');
    await sequelize.sync();
    console.log('Đồng bộ hóa hoàn tất!');

    // Check and seed database if needed
    await seed();

    const app = express();
    const server = http.createServer(app);
    const io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      },
      maxHttpBufferSize: 5e6 // 5MB for Socket.IO
    });

    // Initialize announcement service with socket.io
    const announcementService = createAnnouncementService(io);
    await announcementService.initializeScheduledAnnouncements();

    // Middleware
    app.use(cors());
    // Increase JSON payload limit to 5MB
    app.use(express.json({ limit: '5mb' }));
    // Increase URL-encoded payload limit to 5MB
    app.use(express.urlencoded({ limit: '5mb', extended: true }));

    // Mount all routes under /api
    app.use('/api', routes);

    // Socket.IO handling
    const chatHandler = createChatHandler(io);
    io.on('connection', chatHandler.handleConnection);

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error(err.stack);
      if (err.type === 'entity.too.large') {
        return res.status(413).json({ 
          error: 'Kích thước dữ liệu vượt quá giới hạn cho phép (5MB)'
        });
      }
      res.status(500).json({ error: 'Đã xảy ra lỗi!' });
    });

    // Cleanup on server shutdown
    process.on('SIGTERM', () => {
      console.log('Server shutting down...');
      announcementService.cleanup();
      process.exit(0);
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