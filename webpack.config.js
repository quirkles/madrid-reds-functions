const path = require('path');

const nodeExternals = require('webpack-node-externals');

module.exports = {
  mode: 'development',
  target: 'node',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  entry: {
    verifyEmail: './functions/verifyEmail/main.ts'
  },
  output: {
    filename: './functions/[name]/main.js',
    path: path.join(__dirname)
  },
  externals: [nodeExternals()], // in order to ignore all modules in node_modules folder
};
