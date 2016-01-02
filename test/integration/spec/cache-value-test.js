
var CacheValue = require('../../../src/cache-value');

describe('CacheValue', function() {

  it('should get promise', function() {
    var cacheValue = new CacheValue('promise');
    expect(cacheValue.promise()).to.equal('promise');
  });

  it('should set promise', function() {
    var cacheValue = new CacheValue('promise');
    expect(cacheValue.promise()).to.equal('promise');
    cacheValue.promise('next promise');
    expect(cacheValue.promise()).to.equal('next promise');
  });

  it('should get time', function() {
    var cacheValue = new CacheValue('promise');
    expect(cacheValue.time()).to.exist;
  });

  it('should set time', function() {
    var cacheValue = new CacheValue('promise');
    expect(cacheValue.time()).to.exist;
    cacheValue.time('new time');
    expect(cacheValue.time()).to.equal('new time');
  });

  it('should get expireInSeconds', function() {
    var cacheValue = new CacheValue('promise', 1);
    expect(cacheValue.expireInSeconds()).to.equal(1);
  });

  it('should set expireInSeconds', function() {
    var cacheValue = new CacheValue('promise', 1);
    expect(cacheValue.expireInSeconds()).to.equal(1);
    cacheValue.expireInSeconds(2);
    expect(cacheValue.expireInSeconds()).to.equal(2);
  });

});
