'use strict';

/**
 * @ngdoc module
 * @name dcm-ui.position
 * @description
 *
 * The `dcm-ui.position` module sets positional info for an element to a variable
 *
 * requires: jquery
 *
 * @example
   <example name="position-demo" module="dcm-ui.position">
    <file name="index.html">

      <div class="container">

        <span dcm-position="thisPosition" class="positionedBox">
          {{thisPosition | json}}
        </span>

        <span dcm-position="thisPosition2" class="positionedBox2">
          {{thisPosition2 | json}}
        </span>

      </div>
    </file>

    <file name="styles.css">

      .container {
        position: relative;
        height: 400px;
      }

      .positionedBox {
        position: absolute;
        top: 25px;
        left: 25px;
        border: 1px dashed red;
        padding: 20px;
      }

      .positionedBox2 {
        position: absolute;
        top: 100px;
        left: 150px;
        border: 1px dashed red;
        padding: 20px;
      }

    </file>

  </example>
 */
angular.module('dcm-ui.position', []);
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
