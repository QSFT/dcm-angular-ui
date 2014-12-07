// Canonical path provides a consistent path (i.e. always forward slashes) across different OSes
var path = require('canonical-path');

var Package = require('dgeni').Package;

// Create and export a new Dgeni package called dgeni-example. This package depends upon
// the jsdoc and nunjucks packages defined in the dgeni-packages npm module.
module.exports = new Package('dcm-angular-ui-package', [
  require('dgeni-packages/ngdoc'),
  require('dgeni-packages/jsdoc'),
  require('dgeni-packages/examples'),
  require('dgeni-packages/nunjucks')
])

  .factory(require('./config/default'))

  .config(function(templateFinder, templateEngine) {

    // Nunjucks and Angular conflict in their template bindings so change the Nunjucks
    templateEngine.config.tags = {
      variableStart: '{$',
      variableEnd: '$}'
    };

    // Add a folder to search for our own templates to use when rendering docs
    templateFinder.templateFolders.unshift(path.resolve(__dirname, 'templates'));

    // templateFinder.templatePatterns = [
    //   '${ doc.template }',
    //   '${ doc.id }.${ doc.docType }.template.html',
    //   '${ doc.id }.template.html',
    //   '${ doc.docType }.template.html'
    // ];

  })




  .config(function(generateExamplesProcessor, generateProtractorTestsProcessor, defaultDeployment) {
    generateExamplesProcessor.deployments = [defaultDeployment];
    generateProtractorTestsProcessor.deployments = [defaultDeployment];
  })

  .config(function(computePathsProcessor) {
    computePathsProcessor.pathTemplates.push({
      docTypes: ['provider', 'service', 'directive', 'input', 'object', 'function', 'filter', 'type' ],
      pathTemplate: '${module}/${docType}/${name}',
      outputPathTemplate: 'partials/${module}/${docType}/${name}.html'
    });
    computePathsProcessor.pathTemplates.push({
      docTypes: ['module' ],
      pathTemplate: '${name}',
      outputPathTemplate: 'partials/${name}/index.html'
    });
    computePathsProcessor.pathTemplates.push({
      docTypes: ['componentGroup' ],
      pathTemplate: '${moduleName}/${groupType}',
      outputPathTemplate: 'partials/${moduleName}/${groupType}/index.html'
    });
  })



;