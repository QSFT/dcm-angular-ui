var fs = require('fs');
var path = require('path');

module.exports = {
  name: 'git-data',
  runBefore: ['reading-files'],
  description: 'This processor adds information from the local git repository to the extraData injectable',
  exports: {
    gitData: ['factory', function() {

      // Search up the folder hierarchy for the first package.json
      var packageFolder = path.resolve('.');
      while ( !fs.existsSync(path.join(packageFolder, 'package.json')) ) {
        var parent = path.dirname(packageFolder);
        if ( parent === packageFolder) { break; }
        packageFolder = parent;
      }
      var currentPackage = JSON.parse(fs.readFileSync(path.join(packageFolder,'package.json'), 'UTF-8'));

      var GITURL_REGEX = /^(?:https|git|ssh):\/\/github.com\/([^\/]+)\/(.+).git$/;
      var match = GITURL_REGEX.exec(currentPackage.repository.url);

      var git = {
        owner: match[1],
        repo: match[2]
      };

      return {
        version: currentPackage.version,
        repository: currentPackage.repository,
        info: git
      };

    }]
  },
  process: function(extraData, gitData) {
    extraData.git = gitData;
  }
};