'use strict';

/**
 * @ngdoc directive
 * @name dcmGridRowLoader
 * @module dcm-ui.grid
 * @restrict E
 *
 * @description
 * The contents of this element are placed into the grid status cell (first cell)
 * in the row's scope you can use $row.active, $row.dataLoading and $row.showLoading
 *
 * @usage
 * ```html
 *  <dcm-grid-row-status> [state indicator here] </dcm-grid-row-status>
 * ```
 *
 */

angular.module('dcm-ui.grid')
  .directive('dcmGridRowStatus', [function () {
    return {
      require: '^dcmGrid',
      restrict: 'E',
      scope: false,
      compile: function(tElement) {

        return function(scope, element, attrs, ctrl) {

          ctrl.bRowStatus = true;
          ctrl.rowStatusContent = $.trim(tElement.html());

        };

      }
    };
  }]);
