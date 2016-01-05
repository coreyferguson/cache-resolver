
var CacheResolver = require('../../../src');
var Promise = require('bluebird');

describe('CacheResolver', function() {

  describe('constructor', function() {

    it('should accept default expiry', function() {
      var cacheResolver = new CacheResolver({ expireInSeconds: 0.1 });
      // set cached value
      return expect(cacheResolver.resolve({
        key: 'testKey',
        callback: function() {
          return Promise.resolve('1');
        }
      })
      // retrieve from cache
      .then(function(results) {
        expect(results).to.equal('1');
        return new Promise(function(resolve, reject) {
          setTimeout(function() {
            cacheResolver.resolve({
              key: 'testKey',
              callback: function() {
                return Promise.resolve('2');
              }
            }).then(resolve).catch(reject);
          }, 50);
        });
      })
      // cache should have expired by now
      .then(function(results) {
        expect(results).to.equal('1');
        return new Promise(function(resolve, reject) {
          setTimeout(function() {
            cacheResolver.resolve({
              key: 'testKey',
              callback: function() {
                return Promise.resolve('3');
              }
            }).then(resolve).catch(reject);
          }, 100);
        });
      })).to.eventually.equal('3');
    });

  });

  //////////////
  // .resolve //
  //////////////

  describe('.resolve', function() {

    it('should reject when key is null', function() {
      var cacheResolver = new CacheResolver();
      return expect(cacheResolver.resolve({
        key: null,
        callback: function() {
          return Promise.resolve('value');
        }
      })).to.eventually.be.rejectedWith(/Illegal argument.*key/);
    });

    it('should reject when key is undefined', function() {
      var cacheResolver = new CacheResolver();
      return expect(cacheResolver.resolve({
        callback: function() {
          return Promise.resolve('value');
        }
      })).to.eventually.be.rejectedWith(/Illegal argument.*key/);
    });

    it('should reject when key is empty', function() {
      var cacheResolver = new CacheResolver();
      return expect(cacheResolver.resolve({
        key: '',
        callback: function() {
          return Promise.resolve('value');
        }
      })).to.eventually.be.rejectedWith(/Illegal argument.*key/);
    });

    it('should reject when callback is undefined', function() {
      var cacheResolver = new CacheResolver();
      return expect(cacheResolver.resolve({
        key: 'testKey'
      })).to.eventually.be.rejectedWith(/Illegal argument.*callback/);
    });

    it('should reject when callback is null', function() {
      var cacheResolver = new CacheResolver();
      return expect(cacheResolver.resolve({
        key: 'testKey',
        callback: null
      })).to.eventually.be.rejectedWith(/Illegal argument.*callback/);
    });

    it('should execute callback on first execution', function() {
      var cacheResolver = new CacheResolver();
      return expect(cacheResolver.resolve({
        key: 'testKey',
        callback: function() {
          return Promise.resolve('value');
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
              }, 10);
            });
          }
        // this callback should not be executed
        }, {
          key: 'testKey',
          callback: function() {
            return new Promise(function(resolve, reject) {
              setTimeout(function() {
                resolve('should not be called');
              }, 10);
            });
          }
        }], function(options) {
          return cacheResolver.resolve(options);
        }
      )).to.eventually.eql(['cachedValue', 'cachedValue']);
    });

    it('should not execute callback on second execution in parallel', function() {
      var cacheResolver = new CacheResolver();
      return expect(Promise.map(
        // this callback should be executed
        [{
          key: 'testKey',
          callback: function() {
            return new Promise(function(resolve, reject) {
              setTimeout(function() {
                resolve('cachedValue');
              }, 10);
            });
          }
        // this callback should not be executed
        }, {
          key: 'testKey',
          callback: function() {
            return new Promise(function(resolve, reject) {
              setTimeout(function() {
                resolve('should not be called');
              }, 10);
            });
          }
        }], function(options) {
          return cacheResolver.resolve(options);
        }
      )).to.eventually.eql(['cachedValue', 'cachedValue']);
    });

    it('should not cache when promise is rejected', function() {
      var cacheResolver = new CacheResolver();
      return expect(cacheResolver.resolve({
        key: 'testKey',
        callback: function() {
          return Promise.reject(new Error('something bad happened'));
        }
      }).catch(function(error) {
        expect(error).not.to.be.null;
        return cacheResolver.resolve({
          key: 'testKey',
          callback: function() {
            return Promise.resolve('success');
          }
        });
      })).to.eventually.equal('success');
    });

  }); // End .resolve

  //////////////////////////
  // .resolve with expiry //
  //////////////////////////

  describe('.resolve with expiry', function() {

    it('should expire cached values', function(done) {
      var cacheResolver = new CacheResolver();
      var valueOne, valueTwo, valueThree;
      // execute immediately, saved in cache for 10 milliseconds
      cacheResolver.resolve({
        key: 'testKey',
        expireInSeconds: 0.01,
        callback: function() {
          return Promise.resolve('firstValue');
        }
      }).then(function(value) {
        valueOne = value;
      });
      // execute after 5 milliseconds, last value should be cached
      setTimeout(function() {
        cacheResolver.resolve({
          key: 'testKey',
          expireInSeconds: 0.01,
          callback: function() {
            return Promise.resolve('secondValue');
          }
        }).then(function(value) {
          valueTwo = value;
        });
      }, 5);
      // execute after 15 milliseconds, should no longer be cached
      setTimeout(function() {
        cacheResolver.resolve({
          key: 'testKey',
          expireInSeconds: 0.01,
          callback: function() {
            return Promise.resolve('thirdValue');
          }
        }).then(function(value) {
          valueThree = value;
        }).finally(function() {
          expect(valueOne).to.eql('firstValue');
          expect(valueTwo).to.eql('firstValue');
          expect(valueThree).to.eql('thirdValue');
          done();
        });
      }, 15);
    });

    it('should override expiry on second resolve', function(done) {
      var cacheResolver = new CacheResolver();
      var valueOne, valueTwo, valueThree;
      // execute immediately, saved in cache for 10 milliseconds
      cacheResolver.resolve({
        key: 'testKey',
        expireInSeconds: 0.01,
        callback: function() {
          return Promise.resolve('firstValue');
        }
      }).then(function(value) {
        valueOne = value;
      });
      // execute after 15 milliseconds, should still be cached from expireInSeconds override
      setTimeout(function() {
        cacheResolver.resolve({
          key: 'testKey',
          expireInSeconds: 1,
          callback: function() {
            return Promise.resolve('secondValue');
          }
        }).then(function(value) {
          valueTwo = value;
        }).finally(function() {
          expect(valueOne).to.equal('firstValue');
          expect(valueTwo).to.equal('firstValue');
          done();
        });
      }, 15);
    });

    it('should override default expiry', function() {
      // set default cache expiry to 10 ms
      var cacheResolver = new CacheResolver({ expireInSeconds: 0.01 });
      // override expiry for 'testKey' to 100 ms
      return expect(cacheResolver.resolve({
        key: 'testKey',
        expireInSeconds: 0.1,
        callback: function() {
          return Promise.resolve('1');
        }
      })
      // expect the cache to still exist after 50 ms
      .then(function(results) {
        expect(results).to.equal('1');
        return new Promise(function(resolve, reject) {
          setTimeout(function() {
            cacheResolver.resolve({
              key: 'testKey',
              callback: function() {
                return Promise.resolve('2');
              }
            }).then(resolve).catch(reject);
          }, 50);
        });
      })).to.eventually.equal('1');
    });

    it('should remove expiry with null value', function(done) {
      var cacheResolver = new CacheResolver();
      var valueOne, valueTwo, valueThree;
      // execute immediately, saved in cache for 10 milliseconds
      cacheResolver.resolve({
        key: 'testKey',
        expireInSeconds: 0.01,
        callback: function() {
          return Promise.resolve('firstValue');
        }
      }).then(function(value) {
        valueOne = value;
      });
      // execute after 15 milliseconds, should still be cached from expireInSeconds override
      setTimeout(function() {
        cacheResolver.resolve({
          key: 'testKey',
          expireInSeconds: null,
          callback: function() {
            return Promise.resolve('secondValue');
          }
        }).then(function(value) {
          valueTwo = value;
        }).finally(function() {
          expect(valueOne).to.equal('firstValue');
          expect(valueTwo).to.equal('firstValue');
          done();
        });
      }, 15);
    });

  }); // End .resolve with expiry

  /////////////
  // .remove //
  /////////////

  describe('.remove', function() {

    it('should remove cache value for given `key`', function() {
      var cacheResolver = new CacheResolver();
      return expect(
        cacheResolver.resolve({
          key: 'testKey',
          callback: function() {
            return Promise.resolve('firstValue');
          }
        }).then(function(firstValue) {
          cacheResolver.remove('testKey');
          return cacheResolver.resolve({
            key: 'testKey',
            callback: function() {
              return Promise.resolve('secondValue');
            }
          });
        })
      ).to.eventually.eql('secondValue');
    });

  }); // End .remove

  ////////////
  // .flush //
  ////////////

  describe('.flush', function() {

    it('should remove cache value', function() {
      var cacheResolver = new CacheResolver();
      return expect(
        cacheResolver.resolve({
          key: 'testKey',
          callback: function() {
            return Promise.resolve('firstValue');
          }
        }).then(function(firstValue) {
          cacheResolver.flush();
          return cacheResolver.resolve({
            key: 'testKey',
            callback: function() {
              return Promise.resolve('secondValue');
            }
          });
        })
      ).to.eventually.eql('secondValue');
    });

  }); // End .flush

});
