
/**
 * @ngdoc module
 * @name dcm-ui.resizable-cols
 * @description
 *
 * The `dcm-ui.resizable-cols` module allows you to set table columns as resizable
 *
 * @example
   <example name="resizable-cols-demo" module="dcm-ui.resizable-cols">
    <file name="index.html">

      <table class="resizable-columns table table-bordered table-striped">

        <thead>
          <tr>
            <th class="resizable-column">First Name</th>
            <th class="resizable-column">Last Name</th>
            <th class="resizable-column">Age</th>
            <th class="resizable-column">UUID</th>
          </tr>
        </thead>

        <tbody>
          <tr ng-repeat="col in tableData">
            <td>{{col.fname}}</td>
            <td>{{col.lname}}</td>
            <td>{{col.age}}</td>
            <td>{{col.uuid}}</td>
          </tr>
        </tbody>

      </table>

    </file>

    <file name="script.js">
      angular.module('dcm-ui.resizable-cols')
        .run(['$rootScope',
          function($rootScope) {
            $rootScope.tableData= [
              {fname: 'James', lname: 'Andersen', age: 42, uuid: 'ad6d4f60-27dd-41a4-bc58-4b66eb8cc2f7'},
              {fname: 'Albertine', lname: 'Roquefort', age: 19, uuid: 'a3483f04-6d88-4cab-94e8-f37d47140112'},
              {fname: 'Harry', lname: 'Elfort', age: 42, uuid: '752501b5-8c9c-4bf8-8dbf-549d247c54de'},
              {fname: 'Mojune', lname: 'Starkadder', age: 42, uuid: 'ed788226-7fd5-4c64-8065-63e88b5414df'},
              {fname: 'Julia', lname: 'Hazeldene', age: 42, uuid: 'da428eb5-3b7d-4c21-8b04-b0deaf54c4a9'}
            ];
        }])
      ;
    </file>

    <file name="style.css">
      table.resizable-columns th.resizable-column {
        border-right: solid 5px #d9edf7;
      }

      div.resizable-columns-drag-box {
        border-right: 1px #ccc dashed;
      }


    </file>

  </example>
 */
'use strict';
angular.module('dcm-ui.resizable-cols', ['dcm-ui.helpers.drag']);
'use strict';

angular.module('dcm-ui.resizable-cols')
  .controller('ResizableColumnsCtrl', ['$timeout', function ($timeout) {

    var ctrl = this;

    var cols = ctrl.cols = [];
    var dragHandles = [];

    // box to show the resizing line
    ctrl.dragBox = angular.element('<div class="resizable-columns-drag-box" style="position: absolute;">');

    ctrl.dragBox.on('click', function(e){
      e.stopPropagation();
      e.preventDefault();
    });

    var pendingResize = false;

    ctrl.addCol = function(col, dragHandle) {
      cols.push(col);
      dragHandles.push(dragHandle);

      if (!pendingResize) {
        pendingResize = true;
        // we need to resize on the digest to make sure all col changes have completed
        $timeout(ctrl.resizeAll, 0);
      }

    };

    ctrl.removeCol = function(col) {
      var idx = cols.indexOf(col);
      cols.splice(idx,1);
      dragHandles.splice(idx,1);
    };


    ctrl.resizeAll = function() {

      // console.log('time to resize!...');


      pendingResize = false;

    };

  }]);
'use strict';

angular.module('dcm-ui.resizable-cols')

  .directive('resizableColumn', ['$log', '$document', '$timeout', 'dragHelper',

    function ($log, $document, $timeout, dragHelper) {



    return {
      restrict: 'AC',
      scope: false,
      require: '^resizableColumns',


      compile: function() {

        return function(scope, cell, attrs, ctrl) { // , attrs

          // find the next cell over
          var nextCell =  cell.next();

          // there must be a next cell & it must have either the resizable-column attribute or class
          if (!nextCell.length || !(nextCell.hasClass('resizable-column') || nextCell.attr('resizable-column') !== undefined)) {

            // remove the class and don't setup this cell
            cell.removeClass('resizable-column');

            // set the width to auto
            cell.css('width', 'auto');

          // otherwise this is a valid col to make resizable...
          } else {

            // add class in case this is an attribute
            cell.addClass('resizable-column');


            // create the drag handle and add it to the page
            var dragHandle = angular.element('<a class="resizable-columns-drag-handle"></a>');
            dragHandle.css({cursor: 'col-resize', position: 'absolute', display: 'block', width: '10px'});

            // add to controllers list of managed cells
            ctrl.addCol(cell, dragHandle);

            var positionDragHandle = function() {

              // set height on drag handle
              dragHandle.height(cell.outerHeight(false));

              // get offset of adjacent cell
              var baseOffset = nextCell.offset();
              // subtract width of border
              var left = baseOffset.left - (dragHandle.width() / 2) ;

              // set drag handles offset
              dragHandle.offset({top: baseOffset.top, left: left});
            };

            // watch for cell changing position/width. (might not be triggered by us)
            var unbindWatcher = scope.$watch(function(){
                return nextCell[0].offsetLeft + ctrl.table[0].offsetLeft;
              }, function(x1, x2) {
                if (x1 !== x2 && Math.abs(x2 - x1) >= 1) {
                  $log.info('RESIZABLE: position changed: ' + cell.text() + ' ' + (Math.round((x2 - x1) * 100) / 100).toString() + 'px');
                  positionDragHandle();
                }
              });

            // position drag handle on timeout in case DOM isn't ready yet
            $timeout(function(){

              // add drag handle into the page
              ctrl.table.after(dragHandle);

              // position drag handle
              positionDragHandle();

              // make sure the cell is sized
              // if this cell doesn't have a style attribute with width set, set one
              if (!cell.attr('style') || !cell.attr('style').match(/(\b|;)\s*width\s*:/)) {
                cell.width(cell.width());
              }

            }, 0);


            var newX = function(posChange, widths) {
              return Math.round(Math.min(Math.max(widths.current + posChange.dX, widths.min), widths.max));
            };


            var mouseMove = function(posChange){

              var widths = getWidths();
              var dX = newX(posChange, widths) - widths.current;
              ctrl.dragBox.offset({top: top, left: dX });
              dragHandle.offset({left: initialDragHandleOffset.left + dX});


            };




            var mouseUp = function(posChange) {

              ctrl.dragBox.remove();
              cell.removeClass('resizing');
              dragHandle.removeClass('resizing');

              var widths = getWidths();
              // set the new width!
              setWidth(newX(posChange, widths));
              // we need to call this in case the col didn't actually resize (content limited)
              positionDragHandle();

            };




            var initialDragHandleOffset, top, left;

            var setWidth = function(newWidth) {

              var widths = getWidths();
              var nextWidth = widths.combined - newWidth;

              // only resize if we're moving at least 1px :p
              if (Math.abs(newWidth - widths.current) >= 1) {

                // if a cell is not resizable set it to width:auto
                if (!widths.nextResizable) {
                  nextCell.css('width', 'auto');
                }

                // if we are downsizing the first cell, or if the second isn't resizable
                if (newWidth < widths.current || !widths.nextResizable) {

                  // set cell being sized down
                  cell.width(newWidth);

                  // in case cell rebounded recalc next size
                  nextWidth = widths.combined - cell.width();

                  if (widths.nextResizable && cell.width() !== widths.current ) {
                    // increase other cell
                    nextCell.width(nextWidth);
                  }


                // if we are making the second cell smaller
                } else {

                  // set cell being sized down
                  nextCell.width(nextWidth);

                  // in case cell rebounded recalc next size
                  newWidth = widths.combined - nextCell.width();

                  if (nextCell.width() !== widths.currentNext) {
                    // increase other cell
                    cell.width(newWidth);
                  }

                }

                // broadcast an event up through the scopes to notify a col resize has completed
                scope.$emit('TABLE_COL_RESIZED');

              }

            };

            var getWidths = function() {

              var currentWidth = cell.width();
              var currentNextWidth = nextCell.width();
              var combinedWidth = currentWidth + currentNextWidth;
              var minWidth = Math.round(getContentWidth(cell));
              var minNext = Math.round(getContentWidth(nextCell));
              var maxWidth = combinedWidth - minNext;

              return {
                current: currentWidth,
                currentNext: currentNextWidth,
                combined: combinedWidth,
                min: minWidth,
                minNext: minNext,
                max: maxWidth,
                nextResizable: nextCell.is('.resizable-column')
              };
            };

            var mouseDown = function() {

              var widths = getWidths();

              if (widths.combined <= (widths.min + widths.minNext) ) {

                $log.info('RESIZABLE: both cols are too narrow to resize further');
                return false;

              } else {

                initialDragHandleOffset = dragHandle.offset();

                left = Math.round(nextCell.offset().left - 1);

                cell.addClass('resizing');
                dragHandle.addClass('resizing');

                ctrl.table.after(ctrl.dragBox);

                top = ctrl.table.offset().top;

                ctrl.dragBox
                  .height(ctrl.table.height())
                  .width(left)
                  .offset({top: top, left: 0 })
                ;

              }

            };



            // returns the width of the cell contents (constrained by cell width)
            var getContentWidth = function(cell) {

              // create a span to calc width of content
              var sizing = angular.element('<span style="display:inline; padding: 0; margin: 0;">');
              cell.append(sizing);
              sizing.append(cell.contents());

              // get width of span
              var width = sizing.outerWidth(true);

              // remove span
              cell.append(sizing.contents());
              sizing.remove();

              return width;

            };

            // magical resize time
            var mouseDblClick = function(){

              var widths = getWidths();

              if (widths.combined <= (widths.min + widths.minNext) ) {

                $log.info('RESIZABLE: both cols are too narrow to resize further');

              } else {

                setWidth(widths.max);

                var idx = cell.parent().children().index(cell);

                var cellWidth = Math.min(getContentWidth(cell), widths.max);

                var aCells = ctrl.table.find('tbody>tr>td:nth-child(' + (idx+1).toString() + ')');

                angular.forEach(aCells, function(cell){
                  cellWidth = Math.max(cellWidth, Math.min(getContentWidth(angular.element(cell)), widths.max));
                });

                setWidth(cellWidth);
              }


            };

            dragHelper.draggable(dragHandle, {
              dragCursor: 'col-resize',
              mouseUp: mouseUp,
              mouseDown: mouseDown,
              mouseMove: mouseMove,
              mouseDoubleClick: mouseDblClick
            });


            cell.on('$destroy', function(){

              unbindWatcher();

              ctrl.removeCol(cell);

              dragHandle.remove();

            });

          } // end else if this a valid cell

        };


      }

    };

  }]);

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