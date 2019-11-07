const path = require('path')

module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, 'src/steelseries.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'steelseries.js',
    library: 'steelseries',
    libraryTarget: 'umd'
  }
}
