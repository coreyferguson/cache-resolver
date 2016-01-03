
# CacheResolver

## Summary

In-memory cache to retrieve and set values based on promise resolution.

## Usage

### Node.js

Install to your project using npm:

```
npm install cache-resolver --save-dev
```

Use it:

```javascript
var CacheResolver = require('cache-resolver');
var cache = new CacheResolver();

// first resolve, uses callback to resolve promise and save in cache
cache.resolve({
  key: 'cache-key',
  callback: function() {
    return new Promise(function(resolve, reject) {
      // perform some asynchronous operation
      setTimeout(function() {
        resolve('success');
      }, 500);
    });
  }
}).then(function(result) {
  console.log(result); // 'success'
});

// second resolve, run in parallel to first, reuses first callback promise
cache.resolve({
  key: 'cache-key',
  callback: function() {
    return new Promise(function(resolve, reject) {
      // perform some asynchronous operation
      setTimeout(function() {
        resolve('callback will not be used');
      }, 500);
    });
  }
}).then(function(result) {
  console.log(result); // 'success'
});
```

### Browser

Browser distribution files are checked into github with the source. See [Document bundles](./dist/README.md) for details on which bundle is right for you.

## API

See [API Documentation](http://coreyferguson.github.io/cache-resolver/).

## Contribute

See [Contribution Documentation](./CONTRIBUTE.md).
