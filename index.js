#!/usr/bin/env node

var chalk                = require('chalk');
var fs                   = require('fs');
var inquirer             = require('inquirer');
var defaultContent       = require('./default_content/content');
let scaffolder           = require('./utils/scaffolder');
let webpackHandler       = require('./utils/webpack-handler');
let constant             = require('./utils/constant');
let rimraf               = require('rimraf');

var processArgs = process.argv;
var extName = processArgs[2];

// check if the extension name is provided
if (!extName) {
  console.log(chalk.red('Kindly provide a name for your chrome extension. run `baby-chrome <your-extension-name>`'));
  return;
}

var cwd = process.cwd();
var extensionPath = `${cwd}/${extName}`;
let nodeModulesDir = __dirname;

// check for existance of the folder name 
var isPathAlreadyExists = fs.existsSync(extensionPath);
if (isPathAlreadyExists) {
  console.log(chalk.red(`Folder with the name '${extName}' already exist!`));
  return;
}

// user option messages
const buildOptionMsg = constant.buildOptionMsg;

inquirer.prompt(
  [
    {
      type: 'list',
      name: 'ext_build_options',
      message: 'Choose Build tool for your extension\n',
      choices: [buildOptionMsg.raw, buildOptionMsg.webpack],
      default: [buildOptionMsg.webpack]
    },
    {
      type: 'checkbox',
      name: 'ext_options',
      message: 'Choose the nature of your chrome extension to get a specialized project structure\n',
      choices: [buildOptionMsg.popup, buildOptionMsg.bg, buildOptionMsg.content, buildOptionMsg.jquery, buildOptionMsg.bs],
      default: [buildOptionMsg.popup, buildOptionMsg.jquery, buildOptionMsg.bs]
    }
  ]
).then(function( answers ) {
    generateExtension(answers['ext_options'], answers['ext_build_options']);
  }
);

var generateExtension = function(extOptionsArray, buildOption = '') {

  var constructedManifest = defaultContent.manifestContent;
  fs.mkdirSync(extensionPath);
  let isWebpack = buildOption === buildOptionMsg.webpack;

  try {
    console.log('\n');
    console.log(chalk.green.bold('Started scafolding the extension...'));

    if (isWebpack) {
      fs.mkdirSync(`${extensionPath}/src`);
      webpackHandler.configureWebpackRelatedFiles({extensionPath, extOptionsArray, nodeModulesDir});
    }

    scaffolder.buildAssestsFolder({extensionPath, nodeModulesDir, isWebpack});
    scaffolder.buildVendorFolder({extensionPath, extOptionsArray, nodeModulesDir, isWebpack});
    scaffolder.buildPopup({extensionPath, extOptionsArray, isWebpack});
    constructedManifest = scaffolder.buildBackground({extensionPath, extOptionsArray, constructedManifest, isWebpack});
    constructedManifest = scaffolder.buildContent({extensionPath, extOptionsArray, constructedManifest, isWebpack});
    scaffolder.manifestHandler({extensionPath, constructedManifest, isWebpack});
    scaffolder.printGettingStartedSteps({ isWebpack }); 

  } catch (error) {

    console.log(chalk.red('Error while creating extension :('));
    console.log(error);

    let isFolderCreatedEvenAfterError = fs.existsSync(extensionPath);
    console.log(chalk.red('Scaffolded folder deleted'));
    if (isFolderCreatedEvenAfterError) {
      rimraf.sync(extensionPath);
    }

  }
}
