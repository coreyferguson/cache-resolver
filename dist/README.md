
# Distribution Bundles

## Summary

Distribution bundles are intended for browser consumption. The bundles are checked into version control so they can be easily downloaded or used by bower.

Bundles are compiled using [webpack][]. The bundles within this folder are named after the target library specified by [webpack][] [`libraryTarget`](https://webpack.github.io/docs/configuration.html#output-librarytarget)

## Bundle Descriptions

File name                  | Short description
-------------------------- | -----------------
cache-resolver-amd.js      | AMD format such as [RequireJS][].
cache-resolver-amd.min.js  | Minified for production.
cache-resolver-this.js     | Exported to `this` variable.
cache-resolver-this.min.js | Minified for production.

[RequireJS]: http://requirejs.org/
[webpack]: https://webpack.github.io/docs/what-is-webpack.html

## CommonJS

No bundle is compiled for CommonJS. Simply `require` via [npm][] or reference `src/index.js`.

[npm]: https://www.npmjs.com/
