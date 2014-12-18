'use strict';

angular.module('dcm-ui.slider')

 /**
 * @ngdoc directive
 * @name dcmSliderHandle
 * @module dcm-ui.slider
 * @restrict E
 *
 * @description
 * Provides transcluded content to the handle of a dcm-slider control (optional)
  *
 * @usage
 * ```html
 * <dcm-slider-handle>[content to be transcluded]</dcm-slider-content>
 * ```
 *
 */

.directive('dcmSliderHandle', [function () {

  return {

    restrict: 'E',
    // empty controller to allow directives to be children of this
    require: '^dcmSlider',
    priority: 100,
    scope: false,
    transclude: true,

    compile: function() { // tElement, tAttrs

      return function($scope, iElement, iAttrs, ctrl, transcludeFn) {
        ctrl.handleContent = transcludeFn;
      };

    }

  };

}])

;