
var CacheResolver = require('../../../src');
var Promise = require('bluebird');

describe('CacheResolver', function() {

  /////////////
  // resolve //
  /////////////

  describe('.resolve', function() {

    it('should reject when key is null');
    it('should reject when key is undefined');
    it('should reject when key is empty');

    it('should execute callback on first execution', function() {
      var cacheResolver = new CacheResolver();
      return expect(cacheResolver.resolve({
        key: 'testKey',
        callback: function() {
          return new Promise(function(resolve, reject) {
            resolve('value');
          });
        }
      })).to.eventually.equal('value');
    });

    it('should not execute callback on second execution in series', function() {
      var cacheResolver = new CacheResolver();
      return expect(Promise.mapSeries(
        // this callback should be executed
        [{
          key: 'testKey',
          callback: function() {
            return new Promise(function(resolve, reject) {
              setTimeout(function() {
                resolve('cachedValue');
              }, 50);
            });
          }
        // this callback should not be executed
        }, {
          key: 'testKey',
          callback: function() {
            return new Promise(function(resolve, reject) {
              setTimeout(function() {
                resolve('should not be called');
              }, 50);
            });
          }
        }], function(options) {
          return cacheResolver.resolve(options);
        }
      )).to.eventually.eql(['cachedValue', 'cachedValue']);
    });

    it('should queue responses when resolve called twice in parallel', function() {
      var cacheResolver = new CacheResolver();
      return expect(Promise.map(
        // this callback should be executed
        [{
          key: 'testKey',
          callback: function() {
            return new Promise(function(resolve, reject) {
              setTimeout(function() {
                resolve('cachedValue');
              }, 50);
            });
          }
        // this callback should not be executed
        }, {
          key: 'testKey',
          callback: function() {
            return new Promise(function(resolve, reject) {
              setTimeout(function() {
                resolve('should not be called');
              }, 50);
            });
          }
        }], function(options) {
          return cacheResolver.resolve(options);
        }
      )).to.eventually.eql(['cachedValue', 'cachedValue']);
    });

    it.only('should expire cached values', function() {
      var cacheResolver = new CacheResolver();
      return expect(Promise.mapSeries(
        [{
          key: 'testKey',
          expireInSeconds: 0.5,
          callback: function() {
            return new Promise(function(resolve, reject) {
              setTimeout(function() {
                resolve('firstValue');
              }, 200);
            });
          }
        }, {
          key: 'testKey',
          expireInSeconds: 0.5,
          callback: function() {
            return new Promise(function(resolve, reject) {
              setTimeout(function() {
                resolve('secondValue');
              }, 200);
            });
          }
        }, {
          key: 'testKey',
          expireInSeconds: 0.5,
          callback: function() {
            return new Promise(function(resolve, reject) {
              setTimeout(function() {
                resolve('thirdValue');
              }, 200);
            });
          }
        }], function(options) {
          return cacheResolver.resolve(options);
        }
      ).then(function(results) {
        console.log(results);
      })).to.eventually.eql(['firstValue', 'firstValue', 'thirdValue']);
    });

    it('should remove expiry with null value');

  }); // End resolve

  ////////////
  // remove //
  ////////////

  describe('remove', function() {
  }); // End remove

  ///////////
  // flush //
  ///////////

  describe('flush', function() {
  }); // End flush

});
