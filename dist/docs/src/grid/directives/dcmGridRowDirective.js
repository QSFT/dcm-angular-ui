'use strict';

/**
 * @ngdoc directive
 * @name dcmGridRow
 * @module dcm-ui.grid
 * @restrict E
 *
 * @description
 * Allows attributes for each grid row (in tbody) to be passed to the grid
 *
 * @usage
 * ```html
 *  <dcm-grid-row foo="bar">...</dcm-grid-row>
 * ```
 *
 */

angular.module('dcm-ui.grid')
  .directive('dcmGridRow', [function () {
    return {
      require: '^dcmGrid',
      restrict: 'E',
      scope: false,
      compile: function() {

        return function(scope, element, attrs, dcmGridCtrl) {

          // copy over any attributes that aren't in our scope
          var attributes = {};
          angular.forEach(attrs, function(obj, key){
            if (key[0] !== '$' && !scope.hasOwnProperty(key) && attrs[key] !== '') {
              attributes[key.replace(/([A-Z])/g,'-$1').toLowerCase()] = obj;
            }
          });

          dcmGridCtrl.addRowAttributes(attributes);

        };
      }
    };
  }]);
