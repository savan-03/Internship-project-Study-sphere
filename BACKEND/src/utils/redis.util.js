const redis = require('redis');

let redisClient = null;
let isConnected = false;
let disabledMessageShown = false;
const memoryStore = new Map();
const memoryLists = new Map();

const redisExplicitlyDisabled = process.env.ENABLE_REDIS === 'false';
const redisConfigured = !redisExplicitlyDisabled && (
  process.env.ENABLE_REDIS === 'true' ||
  Boolean(process.env.REDIS_URL || process.env.REDIS_HOST)
);

const setMemoryEntry = (map, key, value, ttlSeconds = null) => {
  map.set(key, {
    value,
    expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
  });
};

const getMemoryEntry = (map, key) => {
  const entry = map.get(key);
  if (!entry) {
    return null;
  }

  if (entry.expiresAt && entry.expiresAt <= Date.now()) {
    map.delete(key);
    return null;
  }

  return entry;
};

const deleteMemoryEntry = (key) => {
  let deleted = 0;
  if (memoryStore.delete(key)) {
    deleted += 1;
  }
  if (memoryLists.delete(key)) {
    deleted += 1;
  }
  return deleted;
};

const fallbackClient = {
  async setEx(key, ttl, value) {
    setMemoryEntry(memoryStore, key, value, ttl);
    return 'OK';
  },
  async get(key) {
    return getMemoryEntry(memoryStore, key)?.value ?? null;
  },
  async del(key) {
    return deleteMemoryEntry(key);
  },
  async lPush(key, value) {
    const existing = getMemoryEntry(memoryLists, key);
    const nextList = existing ? [...existing.value] : [];
    nextList.unshift(value);
    setMemoryEntry(memoryLists, key, nextList, null);
    return nextList.length;
  },
  async expire(key, ttl) {
    const valueEntry = getMemoryEntry(memoryStore, key);
    if (valueEntry) {
      setMemoryEntry(memoryStore, key, valueEntry.value, ttl);
      return 1;
    }

    const listEntry = getMemoryEntry(memoryLists, key);
    if (listEntry) {
      setMemoryEntry(memoryLists, key, listEntry.value, ttl);
      return 1;
    }

    return 0;
  },
  async lRange(key, start, end) {
    const listEntry = getMemoryEntry(memoryLists, key);
    if (!listEntry) {
      return [];
    }

    const list = listEntry.value || [];
    const normalizedEnd = end < 0 ? list.length - 1 : end;
    return list.slice(start, normalizedEnd + 1);
  },
  async lRem(key, count, value) {
    const listEntry = getMemoryEntry(memoryLists, key);
    if (!listEntry) {
      return 0;
    }

    const list = [...(listEntry.value || [])];
    let removed = 0;

    if (count >= 0) {
      for (let index = 0; index < list.length && removed < count; index += 1) {
        if (list[index] === value) {
          list.splice(index, 1);
          index -= 1;
          removed += 1;
        }
      }
    } else {
      for (let index = list.length - 1; index >= 0 && removed < Math.abs(count); index -= 1) {
        if (list[index] === value) {
          list.splice(index, 1);
          removed += 1;
        }
      }
    }

    setMemoryEntry(memoryLists, key, list, listEntry.expiresAt ? Math.max(1, Math.ceil((listEntry.expiresAt - Date.now()) / 1000)) : null);
    return removed;
  },
  async quit() {
    return 'OK';
  },
};

const showDisabledMessage = () => {
  if (!disabledMessageShown) {
    console.warn('[Redis] Disabled or unavailable. Falling back to in-process no-op storage.');
    disabledMessageShown = true;
  }
};

const buildRedisConfig = () => {
  if (process.env.REDIS_URL) {
    return {
      url: process.env.REDIS_URL,
      socket: {
        reconnectStrategy: false,
      },
    };
  }

  return {
    socket: {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: Number(process.env.REDIS_PORT || 6379),
      reconnectStrategy: false,
    },
    password: process.env.REDIS_PASSWORD || undefined,
    database: Number(process.env.REDIS_DB || 0),
  };
};

const initRedis = async () => {
  if (!redisConfigured) {
    showDisabledMessage();
    redisClient = null;
    isConnected = false;
    return fallbackClient;
  }

  if (isConnected && redisClient) {
    return redisClient;
  }

  try {
    redisClient = redis.createClient(buildRedisConfig());

    redisClient.on('error', (err) => {
      console.error('[Redis Error]:', err.message);
      isConnected = false;
    });

    redisClient.on('connect', () => {
      console.log('[Redis Connected]');
      isConnected = true;
    });

    redisClient.on('ready', () => {
      console.log('[Redis Ready]');
    });

    await redisClient.connect();
    isConnected = true;

    return redisClient;
  } catch (err) {
    console.error('[Redis Init Warning]:', err.message);
    redisClient = null;
    isConnected = false;
    showDisabledMessage();
    return fallbackClient;
  }
};

const getRedisClient = () => {
  if (!redisClient || !isConnected) {
    return fallbackClient;
  }

  return redisClient;
};

const storeSession = async (userId, sessionData, ttl = 604800) => {
  try {
    const client = getRedisClient();
    const key = `session:${userId}`;
    const value = JSON.stringify({
      ...sessionData,
      createdAt: Date.now(),
    });

    await client.setEx(key, ttl, value);
    return true;
  } catch (err) {
    console.error('[Redis storeSession Error]:', err.message);
    return false;
  }
};

const getSession = async (userId) => {
  try {
    const client = getRedisClient();
    const key = `session:${userId}`;
    const data = await client.get(key);

    if (!data) {
      return null;
    }

    return JSON.parse(data);
  } catch (err) {
    console.error('[Redis getSession Error]:', err.message);
    return null;
  }
};

const deleteSession = async (userId) => {
  try {
    const client = getRedisClient();
    const key = `session:${userId}`;
    await client.del(key);
    return true;
  } catch (err) {
    console.error('[Redis deleteSession Error]:', err.message);
    return false;
  }
};

const storeRefreshToken = async (keyId, token, ttl = 604800) => {
  try {
    const client = getRedisClient();
    const key = `refresh_token:${keyId}`;
    const value = JSON.stringify({
      token,
      storedAt: Date.now(),
    });

    await client.setEx(key, ttl, value);
    return true;
  } catch (err) {
    console.error('[Redis storeRefreshToken Error]:', err.message);
    return false;
  }
};

const verifyRefreshTokenExists = async (keyId, token) => {
  try {
    if (!redisConfigured) {
      return Boolean(token);
    }

    const client = getRedisClient();
    const key = `refresh_token:${keyId}`;
    const data = await client.get(key);

    if (!data) {
      return false;
    }

    const parsed = JSON.parse(data);
    return parsed.token === token;
  } catch (err) {
    console.error('[Redis verifyRefreshTokenExists Error]:', err.message);
    return false;
  }
};

const revokeRefreshToken = async (keyId) => {
  try {
    const client = getRedisClient();
    const key = `refresh_token:${keyId}`;
    await client.del(key);
    return true;
  } catch (err) {
    console.error('[Redis revokeRefreshToken Error]:', err.message);
    return false;
  }
};

const cacheUserData = async (userId, userData, ttl = 3600) => {
  try {
    const client = getRedisClient();
    const key = `user:${userId}`;
    const value = JSON.stringify(userData);

    await client.setEx(key, ttl, value);
    return true;
  } catch (err) {
    console.error('[Redis cacheUserData Error]:', err.message);
    return false;
  }
};

const getCachedUserData = async (userId) => {
  try {
    const client = getRedisClient();
    const key = `user:${userId}`;
    const data = await client.get(key);

    if (!data) {
      return null;
    }

    return JSON.parse(data);
  } catch (err) {
    console.error('[Redis getCachedUserData Error]:', err.message);
    return null;
  }
};

const invalidateUserCache = async (userId) => {
  try {
    const client = getRedisClient();
    const key = `user:${userId}`;
    await client.del(key);
    return true;
  } catch (err) {
    console.error('[Redis invalidateUserCache Error]:', err.message);
    return false;
  }
};

const storeTemporaryData = async (key, value, ttl = 600) => {
  try {
    const client = getRedisClient();
    const redisKey = `temp:${key}`;
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

    await client.setEx(redisKey, ttl, stringValue);
    return true;
  } catch (err) {
    console.error('[Redis storeTemporaryData Error]:', err.message);
    return false;
  }
};

const getTemporaryData = async (key) => {
  try {
    const client = getRedisClient();
    const redisKey = `temp:${key}`;
    const data = await client.get(redisKey);

    if (!data) {
      return null;
    }

    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  } catch (err) {
    console.error('[Redis getTemporaryData Error]:', err.message);
    return null;
  }
};

const deleteTemporaryData = async (key) => {
  try {
    const client = getRedisClient();
    const redisKey = `temp:${key}`;
    await client.del(redisKey);

    return true;
  } catch (err) {
    console.error('[Redis deleteTemporaryData Error]:', err.message);
    return false;
  }
};

const disconnectRedis = async () => {
  try {
    if (redisClient && isConnected) {
      await redisClient.quit();
      isConnected = false;
      console.log('[Redis Disconnected]');
    }
  } catch (err) {
    console.error('[Redis Disconnect Error]:', err.message);
  }
};

const isRedisConnected = () => isConnected;
const isRedisEnabled = () => redisConfigured;

module.exports = {
  initRedis,
  getRedisClient,
  storeSession,
  getSession,
  deleteSession,
  storeRefreshToken,
  verifyRefreshTokenExists,
  revokeRefreshToken,
  cacheUserData,
  getCachedUserData,
  invalidateUserCache,
  storeTemporaryData,
  getTemporaryData,
  deleteTemporaryData,
  disconnectRedis,
  isRedisConnected,
  isRedisEnabled,
};
