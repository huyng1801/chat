require('dotenv').config();

module.exports = {
  // Default to SQLite
  dialect: process.env.DB_DIALECT || 'sqlite',
  
  // SQLite specific config
  storage: process.env.DB_STORAGE || './src/database/chat.db',
  
  // MySQL specific config (used when DB_DIALECT=mysql)
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  
  // Common config
  logging: false,
  define: {
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
};