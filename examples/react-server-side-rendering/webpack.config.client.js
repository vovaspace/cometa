const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { StatsWriterPlugin } = require('webpack-stats-plugin');

module.exports = ({ development }) => ({
  mode: development ? 'development' : 'production',
  entry: `./source/client.jsx`,

  output: {
    path: path.resolve('build/client'),
    filename: `bundle.[contenthash].js`,
  },

  resolve: {
    extensions: ['.js', '.jsx'],
  },

  devtool: development ? 'inline-source-map' : false,

  optimization: {
    minimize: !development,
  },

  module: {
    rules: [
      {
        test: /\.js(x?)$/,
        use: 'babel-loader',
      },
    ],
  },

  plugins: [new CleanWebpackPlugin(), new StatsWriterPlugin()],
});
