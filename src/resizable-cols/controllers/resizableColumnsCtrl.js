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