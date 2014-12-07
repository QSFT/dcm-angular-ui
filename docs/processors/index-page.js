/**
 * @dgProcessor generateIndexPage
 * @description
 * Generate documents for each module
 */

module.exports = function generateIndexPage(moduleMap) {

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
