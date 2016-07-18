/**
 * TEST WEBPACK CONFIGURATION
 */

const path = require('path');
const webpack = require('webpack');
const modules = [
  'src',
  'node_modules',
];

module.exports = {
  devtool: 'inline-source-map',
  isparta: {
    babel: {
      presets: ['es2015', 'react', 'stage-0'],
    },
  },
  module: {
    // Some libraries don't like being run through babel.
    // If they gripe, put them here.
    noParse: [
      /node_modules(\\|\/)sinon/,
      /node_modules(\\|\/)acorn/,
    ],
    loaders: [
      { test: /\.json$/, loader: 'json-loader' },
      { test: /\.css$/, loader: 'null-loader' },

      // sinon.js--aliased for enzyme--expects/requires global vars.
      // imports-loader allows for global vars to be injected into the module.
      // See https://github.com/webpack/webpack/issues/304
      { test: /sinon(\\|\/)pkg(\\|\/)sinon\.js/,
        loader: 'imports?define=>false,require=>false',
      },
      { test: /\.js$/,
        loader: 'babel',
        exclude: [/node_modules/],
      },
      { test: /\.jpe?g$|\.gif$|\.png$/i,
        loader: 'null-loader',
      },
    ],
  },

  plugins: [

    // Always expose NODE_ENV to webpack, in order to use `process.env.NODE_ENV`
    // inside your code for any environment checks; UglifyJS will automatically
    // drop any unreachable code.
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      },
    })],

  // required for enzyme to work properly
  externals: {
    jsdom: 'window',
    'react/addons': true,
    'react/lib/ExecutionEnvironment': true,
    'react/lib/ReactContext': 'window',
  },
  resolve: {
    modulesDirectories: modules,
    modules,
    alias: {
      // required for enzyme to work properly
      sinon: 'sinon/pkg/sinon',
    },
  },
};