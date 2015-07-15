'use strict';

/**
 * @ngdoc directive
 * @name dcmGridRowActions
 * @module dcm-ui.grid
 * @restrict E
 *
 * @description
 * The contents of this element is transcluded into the row under the active grid
 row (spanning all the cols). The parent dcm-grid thus must have the active-row attribute
 specified. Also the data from the row is transcluded into the scope of this row.
 * Because this is transcluded/compiled it may contain additional angular elements.
 *
 * @usage
 * ```html
 *  <dcm-grid-row-actions>{{really_long_description_field_in_row_data}}</dcm-grid-row-actions>
 * ```
 *
 */

angular.module('dcm-ui.grid')
  .directive('dcmGridRowActions', [function () {
    return {
      require: '^dcmGrid',
      restrict: 'E',
      scope: false,
      compile: function(tElement) {

        return function(scope, element, attrs, dcmGridCtrl) {

          dcmGridCtrl.rowActionContent = $.trim(tElement.html());
          dcmGridCtrl.bRowActions = true;


          // copy over any attributes that aren't in our scope
          var attributes = {};
          angular.forEach(attrs, function(obj, key){
            if (key[0] !== '$' && scope[key] === undefined && obj !== '') {
              attributes[key.replace(/([A-Z])/g,'-$1').toLowerCase()] = obj;
            }
          });

          dcmGridCtrl.addRowActionsAttributes(attributes);

        };

      }
    };
  }]);
