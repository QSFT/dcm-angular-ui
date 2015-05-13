/**
 * @dgProcessor generateIndexPage
 * @description
 * Generate documents for each module
 */

module.exports = function generateIndexPage(moduleMap, defaultDeployment) {

  var _ = require('lodash');

  return {

    $runAfter: ['moduleDocsProcessor'],
    $runBefore: ['computing-paths'],
    $process: function(docs) {

      var dcmModules = [];

      var indexDoc = {
        id: 'indexPage',
        docType: 'indexPage',
        dcmModules: dcmModules,
        outputPath: 'index.html',
      };

      // Copy in the common scripts and stylesheets
      var commonFiles = (defaultDeployment.indexPage && defaultDeployment.indexPage.commonFiles) || {};
      indexDoc.scripts = _.map(commonFiles.scripts, function(script) { return { path: script }; });
      indexDoc.stylesheets = _.map(commonFiles.stylesheets || [], function(stylesheet) { return { path: stylesheet }; });

      _.forEach(moduleMap.obj, function(mod, idx){
        dcmModules.push({name:idx, module: mod.module, description: mod.description});
      });

      docs.push(indexDoc);

      indexDoc = {
        id: 'moduleSummary',
        docType: 'moduleSummary',
        dcmModules: dcmModules,
        outputPath: 'views/summary.html',
      };

      docs.push(indexDoc);


    }

  };

};
