'use strict';

/**
 * @ngdoc module
 * @name dcm-ui.slider
 * @description
 *
 * The `dcm-ui.slider` module provides an angular based slider component.
 *
 * requires: jQuery
 *
 * @example
   <example name="slider-demo" module="dcm-ui" style="height:1600px;">

    <file name="index.html">
       <div ng-controller="GridExampleCtrl">

          <dcm-slider datasource="data.aThings" selected="data.thing">
            <dcm-slider-handle>-{{data.thing.id}}-</dcm-slider-handle>
          </dcm-slider>

          <p>Selected: {{data.thing.text}}</p>

      </div>
    </file>

    <file name="app.js">
      angular.module('dcm-ui.slider')
        .controller('GridExampleCtrl', ['$scope',
          function ($scope) {

            $scope.data = {

              aThings: [
                {id: 1, text: 'thing one'},
                {id: 2, text: 'thing two'},
                {id: 3, text: 'thing three'},
                {id: 4, text: 'thing four'},
                {id: 5, text: 'thing five'},
                {id: 6, text: 'thing six'},
                {id: 7, text: 'thing seven'},
                {id: 8, text: 'thing eight'},
                {id: 9, text: 'thing nine'}
              ],

              thing: null

            };

        }]);
    </file>


    <file name="dcm-slider.css">

      .dcm-slider {
        height: 40px;
        position: relative;
      }

      .dcm-slider-bar-container {
        outline: 1px solid #CBCBCB;
        height: 20px;
        position: absolute;
        left: 0px;
        right: 0px;
        bottom: 0px;
        background: #EFEFEF;
      }


      .dcm-slider-bar {
        background: #529BDA;
        height: 20px;
        width: 0px;
      }


      .dcm-slider-drag-handle {
        cursor: col-resize;
        display: block;
        background: #428BCA;
        width: 20px;
        height: 20px;
        border-radius: 8px;
        z-index: 100;
        color: #CBCBCB;
      }

      .dcm-slider-select-areas {
        position: absolute;
        z-index: 90;
        left: 0px;
        right: 0px;
        top: 0px;
        bottom: 0px;
      }

      .dcm-slider-mark {
        height: 15px;
        width: 1px;
        margin: 0 auto;
        display: block;
        background: #CBCBCB;
      }

      .dcm-slider-mark.first {
        height: 40px;
        margin: 0 auto 0 -1px;
      }

      .dcm-slider-mark.last {
        height: 40px;
        margin: 0 -1px 0 auto;
      }

    </file>



  </example>
 */

angular.module('dcm-ui.slider', ['dcm-ui.helpers.drag']);
'use strict';

angular.module('dcm-ui.slider')


/**
 * @ngdoc directive
 * @name dcmSlider
 * @module dcm-ui.slider
 * @restrict E
 *
 * @description
 * Creates a slider control
 *
 */

.directive('dcmSlider', ['$document', 'dragHelper', '$window', '$timeout', function ($document, dragHelper, $window, $timeout) {

  return {

    restrict: 'E',
    replace: false,
    // empty controller to allow directives to be children of this
    controller: function() {

    },
    scope: {
      datasource: '=',
      selected: '='
    },

    compile: function() { // tElement, tAttrs

      var container = angular.element('<div class="dcm-slider">');

      // create the container for click areas / markers
      var selectAreaContainer = angular.element('<a class="dcm-slider-select-areas"></a>');
      container.append(selectAreaContainer);


      var barContainer = angular.element('<div class="dcm-slider-bar-container">');
      var bar = angular.element('<div class="dcm-slider-bar">');
      barContainer.append(bar);
      container.append(barContainer);

      // create the drag handle and add it to the page
      var dragHandle = angular.element('<a class="dcm-slider-drag-handle"></a>');
      container.append(dragHandle);




      return function($scope, iElement, iAttrs, ctrl) {

        // this element can't have content...
        iElement.empty();
        iElement.append(container);

        // append the drag handle content to the drag handle if any was provided
        if (ctrl.handleContent) {
          ctrl.handleContent(function(clone){
            dragHandle.append(clone);
          });
        }

        var selectAreas = [];
        var selectAreaPositions = [];
        var selectedIndex = -1;

        var select = function(item) {
          // set selected item
          $scope.selected = item;
          selectedIndex = $scope.datasource.indexOf(item);
          // update bar width
          bar.css({width: 100 * (selectedIndex / ($scope.datasource.length - 1)) + '%'});
          // move drag handle
          dragHandle.offset({left: bar.offset().left + bar.width() - (dragHandle.width() / 2) });

        };


        var updatePositions = function() {

          // make stdWidth an integer
          selectAreaPositions = [];
          dragHandle.offset({top: barContainer.offset().top + (barContainer.height() / 2) - dragHandle.height() / 2 });

          // position select target areas
          angular.forEach(selectAreas, function(item){
            var left = item.offset().left;
            selectAreaPositions.push({left: left, right: item.width() + left - 1 });
          });

          if (!$scope.selected || $scope.datasource.indexOf($scope.selected) === -1) {
            select($scope.datasource[Math.floor($scope.datasource.length / 2)]);
          } else {
            select($scope.selected);
          }

        };



        // setup the slider drag handle
        var initialDragHandleOffset = 0;

        dragHelper.draggable(dragHandle, {
          dragCursor: 'col-resize',
          mouseDown: function() {
            initialDragHandleOffset = dragHandle.offset();
            dragHandle.addClass('resizing');
          },
          mouseMove: function(positionChange){
            var newCenter = initialDragHandleOffset.left + (dragHandle.width() / 2) + positionChange.dX;
            for (var i=0; i < selectAreaPositions.length; i++) {
              if (i !== selectedIndex) {
                // if position is within the select area bounds
                if (newCenter >= selectAreaPositions[i].left && newCenter <= selectAreaPositions[i].right) {
                  select($scope.datasource[i]);
                // if the position is to the left of the slider
                } else if (i === 0 && newCenter < selectAreaPositions[i].left) {
                  select($scope.datasource[i]);
                // if the position is to the right of the slider
                } else if (i === selectAreaPositions.length - 1 && newCenter > selectAreaPositions[i].right) {
                  select($scope.datasource[i]);
                }
              }
            }
          },
          mouseUp: function() {
            dragHandle.removeClass('resizing');
          }
        });



        // watch the datasource for changes, and setup the slider
        $scope.$watchCollection('datasource', function(ds){


          selectAreaContainer.empty();


          selectAreas = [];

          if (ds && ds.length > 1) {

            var stdWidth =  Math.floor(1000000 / (ds.length - 1)) / 10000;
            var width;

            var stdHeight = container.outerHeight(false);


            angular.forEach(ds, function(item, idx){

              var selectArea = angular.element('<a class="dcm-slider-select-area">');

              // set width: if first or last it should only be half wide
              if (idx === 0 || idx === (ds.length - 1)) {
                width  = (stdWidth / 2).toString() + '%';
              } else {
                width = stdWidth.toString() + '%';
              }

              selectArea.css({float: 'left', width: width, height: stdHeight + 'px'});

              // add click event
              selectArea.on('click', function(e){
                $scope.$apply(function(){
                  select(item, selectArea);
                });
                e.stopPropagation();
                e.preventDefault();
              });

              // add to the dom
              selectAreaContainer.append(selectArea);

              // add to the area of select areas
              selectAreas.push(selectArea);

              var mark = angular.element('<div class="dcm-slider-mark">');

              if (idx === 0 ) {
                mark.addClass('first');
              } else if (idx === ds.length - 1 ) {
                mark.addClass('last');
              }

              selectArea.append(mark);

            });

            updatePositions();

          } else if (ds && ds.length === 1) {
            $scope.selected = ds[0];
          } else {
            $scope.selected = undefined;
          }

        });

        // watch for a programatic change of the selection
        $scope.$watchCollection('selected', function(selected, prev){
          if (selected !== prev) {
            if (selected || $scope.datasource.indexOf(selected) !== -1) {
              select(selected);
            } else {
              select($scope.datasource[Math.floor($scope.datasource.length / 2)]);
            }
          }
        });

        var windowResize = function() {
          $scope.$apply(function(){
            updatePositions();
          });
        };

        angular.element($window).bind('resize', windowResize);

        $scope.$on('$destroy', function(){
          angular.element($window).unbind('resize', windowResize);
        });

        // watch container width in case it changes
        $scope.$watch(function(){ return container[0].offsetWidth; }, function(n, o){
          if(n !== o) {
            updatePositions();
          }
        });


      };

    }

  };


}]);
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