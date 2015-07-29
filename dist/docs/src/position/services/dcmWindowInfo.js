'use strict';


/**
 * @ngdoc service
 * @name dcmWindowInfo
 * @module dcm-ui.position
 *
 * @description
 * Returns an object containing the width and height of the current browser window
 *
 */

angular.module('dcm-ui.position')
  .factory('dcmWindowInfo', ['$rootScope', '$window', '$timeout', function ($rootScope, $window, $timeout) {

    var windowInfo = {
      height: -1,
      width: -1
    };

    var updateInProgress = false;

    // Setup some variables we'll need.
    var updateWindowDimensions = function() {

      var shouldUpdate = false;

      if (windowInfo.height !== $window.innerHeight) {
        shouldUpdate = true;
      }

      if (windowInfo.width !== $window.innerWidth) {
        shouldUpdate = true;
      }

      windowInfo.width = $window.innerWidth;
      windowInfo.height = $window.innerHeight;

      // only trigger update digest if there isn't already one scheduled
      if(shouldUpdate && !updateInProgress) {
        updateInProgress = true;
        $timeout(function(){
          updateInProgress = false;
        }, 0);
      }

    };

    // update whenever the window triggers the resize event.
    angular.element($window).bind('resize', updateWindowDimensions);

    // update on initial load.
    updateWindowDimensions();

    // Public API here
    return windowInfo;

  }]);
