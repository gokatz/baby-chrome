const fs                   = require('fs');
const chalk                = require('chalk');
const defaultContent       = require('../default_content/content');
const constant             = require('./constant');
const webpackHandler       = require('./webpack-handler');

const buildOptionMsg = constant.buildOptionMsg;

function printGettingStartedSteps({  isWebpack }) {
  console.log(chalk.green.bold('done scafolding the extension'));
  console.log('\n');
  console.log(chalk.blue.bold('Steps to install unpacked (development mode) chrome extension:'));
  console.log(chalk.blue("1) Open Google chrome and navigate to 'chrome://extensions/'"));
  console.log(chalk.blue("2) Click on the button saying 'Load unpacked extension'"));
  console.log(chalk.blue("3) Choose the generated extension project and Click 'OK'. On clicking 'OK', extension will be loaded"));
  console.log(chalk.blue("4) Ensure that the 'Enable' checkbox is checked"));
  console.log(chalk.blue("5) At this moment, you should see a extension icon left to the address bar. Click on the icon to open the extension"));
  console.log('\n');
  console.log(chalk.black.bold('NOTE: ') + chalk.black("If you edit any extension file, click on the 'Reload' link (cmd+R / cntrl+R) to get the changes."));
  console.log('\n');
}

function buildAssestsFolder({extensionPath, nodeModulesDir,  isWebpack}) {
  fs.mkdirSync(`${extensionPath}/assets`);
  fs.mkdirSync(`${extensionPath}/assets/css`);

  if (!isWebpack) {
    fs.mkdirSync(`${extensionPath}/assets/js`);
  }

  fs.mkdirSync(`${extensionPath}/assets/images`);
  fs.mkdirSync(`${extensionPath}/assets/images/logo`);

  fs.createReadStream(`${nodeModulesDir}/default_files/logo.png`).pipe(fs.createWriteStream(`${extensionPath}/assets/images/logo/logo_16.png`));
  fs.createReadStream(`${nodeModulesDir}/default_files/logo.png`).pipe(fs.createWriteStream(`${extensionPath}/assets/images/logo/logo_48.png`));
  fs.createReadStream(`${nodeModulesDir}/default_files/logo.png`).pipe(fs.createWriteStream(`${extensionPath}/assets/images/logo/logo_128.png`));
  console.log(chalk.green('added logos'));
}

function buildVendorFolder({extensionPath, extOptionsArray, nodeModulesDir,  isWebpack}) {

  let vendorPath = isWebpack ? `${extensionPath}/assets/vendor` : `${extensionPath}/vendor`;

  if (extOptionsArray.indexOf(buildOptionMsg.bs) !== -1 || extOptionsArray.indexOf(buildOptionMsg.jquery) !== -1) {
    fs.mkdirSync(vendorPath);
    fs.mkdirSync(`${vendorPath}/css`);
    fs.mkdirSync(`${vendorPath}/js`);
  }

  if (extOptionsArray.indexOf(buildOptionMsg.bs) !== -1) {
    fs.createReadStream(`${nodeModulesDir}/default_files/bootstrap.min.css`).pipe(fs.createWriteStream(`${vendorPath}/css/bootstrap.min.css`));
    fs.createReadStream(`${nodeModulesDir}/default_files/bootstrap.min.js`).pipe(fs.createWriteStream(`${vendorPath}/js/bootstrap.min.js`));
    console.log(chalk.green('added bootstrap'));
  }

  if (extOptionsArray.indexOf(buildOptionMsg.jquery) !== -1) {
    fs.createReadStream(`${nodeModulesDir}/default_files/jquery.min.js`).pipe(fs.createWriteStream(`${vendorPath}/js/jquery.min.js`));
    console.log(chalk.green('added jQuery'));
  }
}

function buildPopup({extensionPath, extOptionsArray,  isWebpack}) {
  if (extOptionsArray.indexOf(buildOptionMsg.popup) !== -1) {
    fs.appendFileSync(`${extensionPath}/popup.html`, defaultContent.popupHtmlContent);

    if (isWebpack) {
      fs.mkdirSync(`${extensionPath}/src/popup`);
    }
    
    let popupJsPath = isWebpack ? `${extensionPath}/src/popup/index.js` : `${extensionPath}/popup.js`;
    fs.appendFileSync(popupJsPath, defaultContent.initialJsContent);

    let popupCssPath = isWebpack ? `${extensionPath}/assets/popup.css` : `${extensionPath}/popup.css`;
    fs.appendFileSync(popupCssPath, defaultContent.popupCssContent);  

    console.log(chalk.green('added popup files'));
  }
}

function buildBackground({extensionPath, extOptionsArray, constructedManifest, isWebpack}) {
  if (extOptionsArray.indexOf(buildOptionMsg.bg) !== -1) {

    if (isWebpack) {
      fs.mkdirSync(`${extensionPath}/src/background`);
    }
    
    let backgroundJSPath = isWebpack ? `${extensionPath}/src/background/index.js` : `${extensionPath}/assets/js/background.js`;
    fs.appendFileSync(backgroundJSPath, defaultContent.initialJsContent);
    console.log(chalk.green('added background files'));

    // TODO: need to revisit if vendor/js/jquery.min.js is required
    constructedManifest = constructedManifest + `,
  "background": {
    "persistent": true,
    "scripts": ["vendor/js/jquery.min.js", "assets/js/background.js"]
  }`;
  }

  return constructedManifest;
}

function buildContent({extensionPath, extOptionsArray, constructedManifest}) {
  if (extOptionsArray.indexOf(buildOptionMsg.content) !== -1) {
    fs.mkdirSync(`${extensionPath}/content`);
    fs.appendFileSync(`${extensionPath}/content/content_script.js`, defaultContent.initialJsContent);
    fs.appendFileSync(`${extensionPath}/content/content.css`, defaultContent.dummyCssContent);
    fs.appendFileSync(`${extensionPath}/content/content.html`, defaultContent.contentHtml);
    console.log(chalk.green('added content script files'));

    constructedManifest = constructedManifest + `,
  "content_scripts": [
    {
      "matches": [ "http://*/*" ],
      "js": ["vendor/js/jquery.min.js", "content/content_script.js"],
      "css": ["content/content.css"],
      "run_at": "document_end"
    }
  ],
  "web_accessible_resources": [
    "assets/content/content.html",
    "assets/images/logo/logo_128.png"
  ]`;
  }

  return constructedManifest;
}

function manifestHandler({extensionPath, constructedManifest}) {
  
  constructedManifest = constructedManifest + `
}`;

  fs.appendFileSync(`${extensionPath}/manifest.json`, constructedManifest);
  console.log(chalk.green('added manifest file'));
}

module.exports = {
  printGettingStartedSteps,
  buildAssestsFolder,
  buildVendorFolder,
  buildPopup,
  buildBackground,
  buildContent,
  manifestHandler
}

