'use strict';

angular.module('dcm-ui.position')

/**
 * @ngdoc directive
 * @name dcmPosition
 * @module dcm-ui.position
 * @restrict A
 *
 * @description
 * Provides positional info for an element
 *
 * @param {string=} dcm-position - scope variable to set position info into
 */

  .directive('dcmPosition', ['dcmWindowInfo', function (dcmWindowInfo) {
    return {
      restrict: 'A',
      scope: {
        dcmPosition: '='
      },
      link: function($scope, $elem) {

        var position = $scope.dcmPosition = {
          left: 0,
          top: 0,
          height: 0,
          width: 0,
          windowInfo: dcmWindowInfo
        };

        $scope.$watchCollection(function() { return $elem.offset(); }, function(offset){
          angular.extend(position, offset);
        });

        $scope.$watch(function() { return $elem.outerHeight(true); }, function(height){
          position.height = height;
        });

        $scope.$watch(function() { return $elem.outerWidth(true); }, function(width){
          position.width = width;
        });

      }
    };
  }]);
