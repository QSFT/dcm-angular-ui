'use strict';


/**
 * @ngdoc directive
 * @name resizableColumns
 * @module dcm-ui.resizable-cols
 * @restrict AC
 *
 * @description
 * Enables resizable colums on this table
 *
 */

angular.module('dcm-ui.resizable-cols')
  // directive to insert controller to be shared across all cols
  .directive('resizableColumns', [function () {

    return {
      restrict: 'AC',
      controller: 'ResizableColumnsCtrl',
      compile: function() {
        return function(scope, table, attrs, ctrl) {
          // add class in case this is an attribute

          table.addClass('resizable-columns');

          ctrl.table = table;
          ctrl.visible = false;

          scope.$watch(function(){
            return table[0].offsetWidth;
          }, function(visible){
            ctrl.visible = !!visible;
          });


        };

      }

    };

  }]);