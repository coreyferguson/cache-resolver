
var Promise = require('bluebird');

/**
 * @class CacheResolver
 * @constructor
 * @description
 * In-memory cache. Resolves promises when adding to cache if the key
 * doesn't exist or has expired.
 *
 * @example
 * TODO
 */
function CacheResolver() {
  this._cache = {};
  this._cacheExpiry = {};
  this._promiseQueues = {};
}

/**
 * @callback CacheResolver~resolveCallback
 * @description
 * Callback used when cache key does not already exist or has expired.
 * @returns {Promise.<*>}
 */

/**
 * Retrieve `key` from cache. If the `key` doesn't exist, use the provided
 * `callback` to retrieve the value and save to cache. The `callback` function
 * is only executed once if called multiple times in parallel for the same `key`.
 *
 * @param {string} options.key Unique identifier for cache value.
 * @param {CacheResolver~resolveCallback} options.callback Used when cache key undefined or expired.
 * @param {number} [options.expireInSeconds] Number of seconds before expiring cache value.
 */
CacheResolver.prototype.resolve = function(options) {
  return new Promise(function(resolve, reject) {

    // set expiration in seconds
    this._expireInSeconds(options.key, options.expireInSeconds);

    // Retrieve cached results
    if (this._cache[options.key] !== null &&
        this._cache[options.key] !== undefined &&
        !this._isExpired(options.key)) {
      resolve(this._cache[options.key]);
      return;
    }

    // No cached results, fetch actual results and store in cache
    else {
      this._promiseQueues[options.key] = this._promiseQueues[options.key] || [];
      this._promiseQueues[options.key].push({ resolve: resolve, reject: reject });
      if (this._promiseQueues[options.key].length === 1) {
        options.callback()
        .then(function(response) {
          this._cache[options.key] = response;
          this._expiryTime(options.key, new Date().getTime());
          this._resolvePromiseQueue(options.key, response);
        }.bind(this))
        .catch(function(error) {
          this._rejectPromiseQueue(options.key, error);
        }.bind(this));
      }
    }

  }.bind(this));
};

/**
 * Removes an individual cache value for the given `key`.
 * @param {string} key Unique identifier for cache value.
 */
CacheResolver.prototype.remove = function(key) {
};

/**
 * Removes all cache values.
 */
CacheResolver.prototype.flush = function() {
};

/**
 * @private
 * @description
 * Resolve the promise queue for a given key. The promise queue is initiated on
 * the first request for a given key. Until that first request completes, all subsequent
 * calls will be added to promise queue and fulfilled together as part of the first
 * request.
 *
 * @param {string} key Unique identifier for cache value.
 * @param {*} response Response from `callback` provided to `resolve` function.
 */
CacheResolver.prototype._resolvePromiseQueue = function(key, response) {
  var promiseQueue = this._promiseQueues[key];
  promiseQueue.forEach(function(promise) {
    promise.resolve(response);
  });
  this._promiseQueues[key] = null;
};

/**
 * @private
 * @description
 * Reject the promise queue for a given key. The promise queue is initiated on
 * the first request for a given key. Until that first request completes, all subsequent
 * calls will be added to promise queue and fulfilled together as part of the first
 * request.
 *
 * @param {string} key Unique identifier for cache value.
 * @param {*} response Response from `callback` provided to `resolve` function.
 */
CacheResolver.prototype._rejectPromiseQueue = function(key, error) {
  var promiseQueue = this._promiseQueues[key];
  promiseQueue.forEach(function(promise) {
    promise.reject(error);
  });
  this._promiseQueues[key] = null;
};

CacheResolver.prototype._expireInSeconds = function(key, seconds) {
  console.log('_expireInSeconds:', key, seconds);
  if (seconds !== undefined) {
    this._cacheExpiry[key] = this._cacheExpiry[key] || {};
    this._cacheExpiry[key].expireInSeconds = seconds;
    return this;
  } else {
    console.log(this._cacheExpiry[key].expireInSeconds);
    return this._cacheExpiry[key].expireInSeconds;
  }
};

/**
 * TODO
 */
CacheResolver.prototype._expiryTime = function(key, time) {
  console.log('_expiryTime:', key, time);
  if (time !== undefined) {
    this._cacheExpiry[key] = this._cacheExpiry[key] || {};
    this._cacheExpiry[key].time = time;
    return this;
  } else {
    return this._cacheExpiry[key].time;
  }
};

/**
 * Indicates whether cache has expired for the given `key`.
 * @param {string} key Unique identifier for a cache value.
 * @returns {boolean}
 */
CacheResolver.prototype._isExpired = function(key) {
  console.log('_isExpired:', key);
  if (this._cacheExpiry === null ||
      this._cacheExpiry[key] === undefined ||
      this._cacheExpiry[key].time === null ||
      this._cacheExpiry[key].time === undefined ||
      this._cacheExpiry[key].expireInSeconds === null ||
      this._cacheExpiry[key].expireInSeconds === undefined) {
    console.log('false', this._cacheExpiry[key]);
    return false; // default never expire
  } else {
    var expiry = this._cacheExpiry[key];
    var now = new Date().getTime();
    var diff = now - expiry.time;
    var isExpired = diff > expiry.expireInSeconds*1000;
    console.log('now, diff, isExpired:', now, diff, isExpired);
    return isExpired;
  }
};

module.exports = CacheResolver;
