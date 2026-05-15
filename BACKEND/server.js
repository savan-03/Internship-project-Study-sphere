// src/server.js

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = require('./src/app');
const connectDB = require('./src/db/db');
const redisUtil = require('./src/utils/redis.util');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

const start = async () => {
  try {
    // Initialize Database
    await connectDB();
    console.log('[Database] Connected');

    // Initialize Redis
    await redisUtil.initRedis();
    if (redisUtil.isRedisConnected()) {
      console.log('[Redis] Initialized');
    } else if (redisUtil.isRedisEnabled()) {
      console.log('[Redis] Unavailable, running without Redis-backed sessions/cache');
    } else {
      console.log('[Redis] Not configured, running with MongoDB-only local mode');
    }

    // Start Server
    const server = app.listen(PORT, HOST, () => {
      console.log(`[Server] Running on http://${HOST}:${PORT}`);
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('[Server] Shutting down gracefully...');
      await redisUtil.disconnectRedis();
      server.close(() => {
        console.log('[Server] Closed');
        process.exit(0);
      });
    });

    process.on('SIGTERM', async () => {
      console.log('[Server] Shutting down gracefully...');
      await redisUtil.disconnectRedis();
      server.close(() => {
        console.log('[Server] Closed');
        process.exit(0);
      });
    });
  } catch (err) {
    console.error('[Server] Startup Error:', err.message);
    process.exit(1);
  }
};

start();
