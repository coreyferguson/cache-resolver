
function CacheValue(promise, expireInSeconds) {
  this._promise = promise;
  this._time = new Date().getTime();
  this._expireInSeconds = expireInSeconds;
}

CacheValue.prototype.promise = function(promise) {
  if (promise !== undefined) {
    this._promise = promise;
    return this;
  } else {
    return this._promise;
  }
};

CacheValue.prototype.time = function(time) {
  if (time !== undefined) {
    this._time = time;
    return this;
  } else {
    return this._time;
  }
};

CacheValue.prototype.expireInSeconds = function(expireInSeconds) {
  if (expireInSeconds !== undefined) {
    this._expireInSeconds = expireInSeconds;
    return this;
  } else {
    return this._expireInSeconds;
  }
};

module.exports = CacheValue;
