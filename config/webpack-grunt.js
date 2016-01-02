
module.exports = {
  'dist-amd': {
    entry: './src/index.js',
    output: {
      filename: './dist/cache-resolver-amd.js',
      libraryTarget: 'amd'
    },
    devtool: 'source-map'
  },
  'dist-this': {
    entry: './src/index.js',
    output: {
      filename: './dist/cache-resolver-this.js',
      libraryTarget: 'this'
    },
    devtool: 'source-map'
  }
};
