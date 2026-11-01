const NodeCache = require('node-cache');

// TTL: 5 minutes, check interval: 2 minutes
const cache = new NodeCache({ stdTTL: 300, checkperiod: 120 });

let cacheHits = 0;
let cacheMisses = 0;
let cacheInvalidations = 0;

/**
 * Generate a user-scoped cache key.
 * IMPORTANT: Each user's data is isolated — one user's cache is never served to another.
 */
const getCacheKey = (userId, suffix = '') => {
  return `tasks:${userId}${suffix ? `:${suffix}` : ''}`;
};

/**
 * Get a value from cache
 */
const getFromCache = (key) => {
  const value = cache.get(key);
  if (value !== undefined) {
    cacheHits++;
    return value;
  }
  cacheMisses++;
  return null;
};

/**
 * Set a value in cache
 */
const setInCache = (key, value, ttl = 300) => {
  cache.set(key, value, ttl);
};

/**
 * Invalidate all cache keys for a specific user.
 * Called after any write operation (create, update, delete).
 */
const invalidateUserCache = (userId) => {
  const keys = cache.keys();
  const userPrefix = `tasks:${userId}`;
  const keysToDelete = keys.filter((k) => k.startsWith(userPrefix));
  if (keysToDelete.length > 0) {
    cache.del(keysToDelete);
    cacheInvalidations += keysToDelete.length;
    console.log(`🗑️  [Cache] Invalidated ${keysToDelete.length} key(s) for user ${userId}`);
  }
};

/**
 * Get cache statistics for the performance dashboard
 */
const getCacheStats = () => {
  const stats = cache.getStats();
  return {
    hits: cacheHits,
    misses: cacheMisses,
    invalidations: cacheInvalidations,
    hitRate: cacheHits + cacheMisses > 0
      ? ((cacheHits / (cacheHits + cacheMisses)) * 100).toFixed(1) + '%'
      : '0%',
    keys: cache.keys().length,
    nodeCache: stats,
    note: 'In-memory cache is process-local. Not shared across multiple server instances or process restarts.',
  };
};

module.exports = {
  getCacheKey,
  getFromCache,
  setInCache,
  invalidateUserCache,
  getCacheStats,
};
