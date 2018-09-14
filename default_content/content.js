let processArgs = process.argv;
let extName = processArgs[2];

// package.json will be included for webpack build alone
let packageJsonFile = `
{
  "name": "${extName}",
  "version": "0.0.1",
  "description": "",
  "scripts": {
    "lint": "yarn eslint src/ lib/ webpack.config.js",
    "build:dev": "MODE=dev webpack --config webpack.config.js",
    "build:prod": "MODE=prod webpack --config webpack.config.js"
  },
  "author": "<author_name>",
  "devDependencies": {
    "@babel/core": "^7.0.0",
    "@babel/preset-env": "^7.0.0",
    "babel-loader": "^8.0.0",
    "copy-webpack-plugin": "^4.5.2",
    "eslint": "^5.4.0",
    "eslint-config-google": "^0.9.1",
    "request": "^2.88.0",
    "webpack": "^4.17.1",
    "webpack-cli": "^3.1.0",
    "webpack-dev-server": "^3.1.5"
  },
  "eslintIgnore": [
    "build/*"
  ]
}
`;

let manifestContent = `{
  "manifest_version": 2,

  "name": "${extName}",
  "description": "Describe about '${extName}' here...",
  "version": "1.0",

  "browser_action": {
    "default_icon": "assets/images/logo/logo_48.png",
    "default_popup": "popup.html",
    "default_title": "${extName}"
  },
  "icons": {
    "16": "assets/images/logo/logo_16.png",
    "48": "assets/images/logo/logo_48.png",
    "128": "assets/images/logo/logo_128.png"
  },
  "permissions": ["activeTab"]`;

let popupHtmlContent = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>${extName}</title>

    <link rel="stylesheet" href="vendor/css/bootstrap.min.css"/>
    <link rel="stylesheet" href="popup.css"/>

  </head>
  <body>
    <!-- feel free to devare this section -->
    <div id="onboarding" style="text-align: center; padding-top: 70px; font-size: 14px;">
      <img src="assets/images/logo/logo_128.png" id="logo-spin" alt="google-chrome" width="120px;" height="120px">
      <div style="margin-top: 35px;"> Are you ready to build your amazing extension? </div>
      <div> Get started by editing <code>popup.html</code> file. </div>
    </div>
    <!-- onboarding content ends -->
  </body>
  <script src="vendor/js/jquery.min.js"></script>
  <script src="vendor/js/bootstrap.min.js"></script>
  <script src="popup.js"></script>
</html>`;

let contentHtml = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>${extName}</title>
  </head>
  <body>
    <!-- content html goes here... -->
  </body>
</html>`;

let initialJsContent = `document.addEventListener('DOMContentLoaded', function() {
  // your script goes here...
})`;

let popupCssContent = `body {
  margin: 0;
  background: #d2f0fd;
  width: 300px;
  height: 400px;
}

/* css for spin */
#logo-spin {
    margin: 20px;
    width: 100px;
    height: 100px;
    -webkit-animation-name: spin;
    -webkit-animation-duration: 4000ms;
    -webkit-animation-iteration-count: infinite;
    -webkit-animation-timing-function: linear;
    -moz-animation-name: spin;
    -moz-animation-duration: 4000ms;
    -moz-animation-iteration-count: infinite;
    -moz-animation-timing-function: linear;
    -ms-animation-name: spin;
    -ms-animation-duration: 4000ms;
    -ms-animation-iteration-count: infinite;
    -ms-animation-timing-function: linear;

    animation-name: spin;
    animation-duration: 4000ms;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
}
@-ms-keyframes spin {
    from { -ms-transform: rotate(0deg); }
    to { -ms-transform: rotate(360deg); }
}
@-moz-keyframes spin {
    from { -moz-transform: rotate(0deg); }
    to { -moz-transform: rotate(360deg); }
}
@-webkit-keyframes spin {
    from { -webkit-transform: rotate(0deg); }
    to { -webkit-transform: rotate(360deg); }
}
@keyframes spin {
    from {
        transform:rotate(0deg);
    }
    to {
        transform:rotate(360deg);
    }
}`;

let dummyCssContent = `body {
  margin: 0;
}`;

let webpackConfig = `
/* global require, process, module */

const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

let { MODE } = process.env;

const isDev = MODE === 'dev';
let jsConfig = {
  entry: {
    {{popupEntry}}
    {{injectEntry}}
    {{contentEntry}}
    {{backgroundEntry}}
  },
  mode: isDev ? 'development' : 'production',
  devtool: 'source-map',
  watch: isDev,
  output: {
    path: path.resolve(__dirname, 'build/js'),
    filename: '[name].js'
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  },

  plugins: [

    // copying css files
    new CopyWebpackPlugin([
      {
        from: 'assets/',
        to: '../',
        toType: 'dir'
      },
    ], {}),

    // copying root level files
    new CopyWebpackPlugin([
      {
        from: 'popup.html',
        to: '../popup.html',
        toType: 'file'
      },
    ], {})
  ]
};

module.exports = [ jsConfig ];
`

module.exports = {
  manifestContent,
  popupHtmlContent,
  initialJsContent,
  popupCssContent,
  dummyCssContent,
  contentHtml,
  packageJsonFile,
  webpackConfig
}
