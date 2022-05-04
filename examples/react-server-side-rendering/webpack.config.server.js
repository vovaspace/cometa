const path = require('path');
const externals = require('webpack-node-externals');

module.exports = ({ development }) => ({
  entry: './source/server.jsx',
  mode: development ? 'development' : 'production',
  target: 'node',
  externals: [externals()],

  output: {
    path: path.resolve('build/server'),
    filename: 'index.js',
  },

  resolve: {
    extensions: ['.js', '.jsx'],
  },

  module: {
    rules: [
      {
        test: /\.js(x?)$/,
        use: 'babel-loader',
      },
    ],
  },
});
