const fs                   = require('fs');
var defaultContent       = require('../default_content/content');

function configureWebpackRelatedFiles({extensionPath, extOptionsArray, nodeModulesDir}) {
  fs.createReadStream(`${nodeModulesDir}/default_files/.babelrc`)
    .pipe(fs.createWriteStream(`${extensionPath}/.babelrc`));

  fs.appendFileSync(`${extensionPath}/package.json`, defaultContent.packageJsonFile);
}


module.exports = {
  configureWebpackRelatedFiles,
  buildCSSForWebpack
}