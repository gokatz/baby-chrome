#!/usr/bin/env node

var chalk                = require('chalk');
var fs                   = require('fs');
var inquirer             = require('inquirer');

var defaultContent       = require('./default_content/content');

var processArgs = process.argv;
var extName = processArgs[2];

if (!extName) {
  console.log(chalk.red('Kindly provide a name for your chrome extension'));
  return;
}

var cwd = process.cwd();
var extensionPath = `${cwd}/${extName}`

var isPathAlreadyExists = fs.existsSync(extensionPath);
if (isPathAlreadyExists) {
  console.log(chalk.red(`Folder with the name '${extName}' already exist!`));
  return;
}

inquirer.prompt(
  [
    {
      type: 'checkbox',
      name: 'ext_options',
      message: 'Choose the nature of your chrome extension to get a specialized project structure\n',
      choices: ['Need a popup page when clicking on extension icon',
                'Has background activity',
                'Need to manipulate other website with your chrome extension',
                'Need jQuery for DOM maniuplation',
                'Need Bootstrap for basic styling'],
      default: ['Need a popup page when clicking on extension icon', 'Need jQuery for DOM maniuplation', 'Need Bootstrap for basic styling']
    }
  ]
).then(function( answers ) {
    generateExtension(answers['ext_options']);
  }
);

var generateExtension = function(extOptionsArray) {
  var constructedManifest = defaultContent.manifestContent;
  fs.mkdirSync(extensionPath);
  fs.mkdirSync(`${extensionPath}/assets`);

  fs.mkdirSync(`${extensionPath}/assets/css`);
  fs.mkdirSync(`${extensionPath}/assets/js`);
  fs.mkdirSync(`${extensionPath}/assets/images`);
  fs.mkdirSync(`${extensionPath}/assets/images/logo`);

  if (extOptionsArray.indexOf('Need Bootstrap for basic styling') !== -1 || extOptionsArray.indexOf('Need jQuery for DOM maniuplation') !== -1) {
    fs.mkdirSync(`${extensionPath}/vendor`);
    fs.mkdirSync(`${extensionPath}/vendor/css`);
    fs.mkdirSync(`${extensionPath}/vendor/js`);
  }

  if (extOptionsArray.indexOf('Need a popup page when clicking on extension icon') !== -1) {
    fs.appendFileSync(`${extensionPath}/popup.html`, defaultContent.popupHtmlContent);
    fs.appendFileSync(`${extensionPath}/popup.js`, defaultContent.initialJsContent);
    fs.appendFileSync(`${extensionPath}/popup.css`, defaultContent.popupCssContent);
    console.log(chalk.green('added popup files'));
  }

  if (extOptionsArray.indexOf('Has background activity') !== -1) {
    fs.appendFileSync(`${extensionPath}/assets/js/background.js`, defaultContent.initialJsContent);
    console.log(chalk.green('added background files'));

    constructedManifest = constructedManifest + `,
  "background": {
    "persistent": true,
    "scripts": ["vendor/js/jquery.min.js", "assets/js/background.js"]
  }`;
  }

  if (extOptionsArray.indexOf('Need to manipulate other website with your chrome extension') !== -1) {
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

  if (extOptionsArray.indexOf('Need Bootstrap for basic styling') !== -1) {
    fs.createReadStream('./default_files/bootstrap.min.css').pipe(fs.createWriteStream(`${extensionPath}/vendor/css/bootstrap.min.css`));
    fs.createReadStream('./default_files/bootstrap.min.js').pipe(fs.createWriteStream(`${extensionPath}/vendor/js/bootstrap.min.js`));
    console.log(chalk.green('added bootstrap'));
  }

  if (extOptionsArray.indexOf('Need jQuery for DOM maniuplation') !== -1) {
    fs.createReadStream('./default_files/jquery.min.js').pipe(fs.createWriteStream(`${extensionPath}/vendor/js/jquery.min.js`));
    console.log(chalk.green('added jQuery'));
  }

  fs.createReadStream('./default_files/logo.png').pipe(fs.createWriteStream(`${extensionPath}/assets/images/logo/logo_16.png`));
  fs.createReadStream('./default_files/logo.png').pipe(fs.createWriteStream(`${extensionPath}/assets/images/logo/logo_48.png`));
  fs.createReadStream('./default_files/logo.png').pipe(fs.createWriteStream(`${extensionPath}/assets/images/logo/logo_128.png`));
  console.log(chalk.green('added logos'));

  constructedManifest = constructedManifest + `
}`;

  fs.appendFileSync(`${extensionPath}/manifest.json`, constructedManifest);
  console.log(chalk.green('added manifest file'));

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
