const path = require('path');

module.exports = {
  mode: 'production',
  entry: {
    'load-test': './load-test.ts',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    libraryTarget: 'commonjs',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  target: 'web',
  externals: /k6(\/.*)?/,
};