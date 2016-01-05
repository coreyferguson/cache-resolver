
var Promise = require('bluebird');
var CacheValue = require('./cache-value');

/**
 * @class CacheResolver
 * @constructor
 * @description
 * In-memory cache. Resolves promises when adding to cache if the key
 * doesn't exist or has expired.
 * @param {number} options.expireInSeconds Default expiry in seconds for all caches.
 * Cache never expires if undefined.
 * Each cache key can override this value by specifying in `resolve` function.
 *
 * @example
 * var CacheResolver = require('cache-resolver');
 * var cacheResolver = new CacheResolver()
 * cacheResolver.resolve({
 *   key: 'testKey',
 *   callback: function() {
 *     return Promise.resolve('value');
 *   }
 * }).then(function(result) {
 *   console.log(result); // `value`
 * });
 */
function CacheResolver(options) {
  options = options || {};
  // cache of promises
  this._cache = {};
  this._expireInSeconds = options.expireInSeconds;
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
  // input validation
  if (options.key === null || options.key === undefined || options.key === '') {
    return Promise.reject(new Error('Illegal argument: missing required option `key`.'));
  }
  if (options.callback === null ||  options.callback === undefined) {
    return Promise.reject(new Error('Illegal argument: missing required `callback` function.'));
  }
  // cache value already exists
  if (this._cache[options.key] !== undefined) {
    var value = this._cache[options.key];
    value.expireInSeconds(options.expireInSeconds);
    // cache value has not expired
    var timePassedInSeconds = (new Date().getTime() - value.time()) / 1000;
    var expireInSeconds = value.expireInSeconds() || this._expireInSeconds;
    if (expireInSeconds === undefined ||
        expireInSeconds === null ||
        timePassedInSeconds < expireInSeconds) {
      return value.promise();
    }
  }
  // cache empty or expired, execute callback
  var promise = options.callback();
  this._cache[options.key] = new CacheValue(promise, options.expireInSeconds);
  // remove errors from cache
  promise.catch(function(error) {
    this.remove(options.key);
  }.bind(this));
  return this._cache[options.key].promise();
};

/**
 * Removes an individual cache value for the given `key`.
 * @param {string} key Unique identifier for cache value.
 */
CacheResolver.prototype.remove = function(key) {
  delete this._cache[key];
};

/**
 * Removes all cache values.
 */
CacheResolver.prototype.flush = function() {
  this._cache = {};
};

module.exports = CacheResolver;
