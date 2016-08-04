/**
 * DEVELOPMENT WEBPACK CONFIGURATION
 */

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = require('./webpack.base.babel')({
  // Add hot reloading in development
  entry: [
    'webpack-dev-server/client?http://localhost:5000',
    'webpack/hot/dev-server',
    path.join(process.cwd(), 'src/index.js'),
  ],

  // Don't use hashes in dev mode for better performance
  output: {
    filename: '[name].js',
    chunkFilename: '[name].chunk.js',
  },

  // Load the CSS in a style tag in development
  cssLoaders: 'style-loader!css-loader',

  // Process the CSS with PostCSS
  postcss: function (webpack) {
    return [
      postcssImport({
        addDependencyTo: webpack
      }),
      precss(),
      postcssFocus(), // Add a :focus to every :hover
      cssnext({ // Allow future CSS features to be used, also auto-prefixes the CSS...
        browsers: ['last 2 versions', 'IE > 10'], // ...based on this browser list
      }),
      calc(),
      postcssReporter({ // Posts messages from plugins to the terminal
        clearMessages: true,
      }),
      colors(),
    ];
  },

  // Add hot reloading
  plugins: [
    new webpack.HotModuleReplacementPlugin(), // Tell webpack we want hot reloading
    new webpack.NoErrorsPlugin(),
    new HtmlWebpackPlugin({
      template: 'index.html',
      inject: true, // Inject all files that are generated by webpack, e.g. bundle.js
    }),
  ],

  // Emit a source map for easier debugging
  devtool: 'cheap-module-eval-source-map',
});