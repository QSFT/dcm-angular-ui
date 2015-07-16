(function(angular) {
  'use strict';
angular.module('dcm-ui.read-file')
  .run(['$rootScope',
    function($rootScope) {

      $rootScope.data = {
        singleFile: undefined,
        singleFileContent: '',
        multiFile: [],
        multiFileContent: []
      };

  }])
;
})(window.angular);