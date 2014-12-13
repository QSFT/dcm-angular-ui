/**
 * @dgProcessor generateIndexPage
 * @description
 * Generate documents for each module
 */

module.exports = function generateIndexPage(moduleMap, defaultDeployment) {

  var _ = require('lodash');

  return {

    $runAfter: ['adding-extra-docs'],
    $runBefore: ['extra-docs-added'],
    $process: function(docs) {

      var indexDoc = {
        id: 'indexPage',
        docType: 'indexPage',
        modules: moduleMap,
        outputPath: 'index.html',
      };

      // Copy in the common scripts and stylesheets
      var commonFiles = (defaultDeployment.indexPage && defaultDeployment.indexPage.commonFiles) || {};
      indexDoc.scripts = _.map(commonFiles.scripts, function(script) { return { path: script }; });
      indexDoc.stylesheets = _.map(commonFiles.stylesheets || [], function(stylesheet) { return { path: stylesheet }; });


      // remove all current docs and replace with only this one
      // docs.splice(0, docs.length);
      docs.push(indexDoc);

      indexDoc = {
        id: 'moduleSummary',
        docType: 'moduleSummary',
        modules: moduleMap,
        outputPath: 'views/summary.html',
      };

      docs.push(indexDoc);

    }

  };

};
