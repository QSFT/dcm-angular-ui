'use strict';

angular.module('dcm-ui.resizable-cols')
  .controller('ResizableColumnsCtrl', ['$timeout', function ($timeout) {

    var ctrl = this;

    var cols = ctrl.cols = [];
    var dragHandles = [];

    var autoCols = ctrl.autoCols = [];

    var managedCols = [];

    // box to show the resizing line
    ctrl.dragBox = angular.element('<div class="resizable-columns-drag-box" style="position: absolute;">');

    ctrl.dragBox.on('click', function(e){
      e.stopPropagation();
      e.preventDefault();
    });

    var pendingResize = false;


    ctrl.addAutoCol = function(col) {
      autoCols.push(col);
      managedCols.push(col);

      if (!pendingResize) {
        pendingResize = true;
        // we need to resize on the digest to make sure all col changes have completed
        $timeout(ctrl.resizeAll, 0);
      }

    };

    ctrl.addCol = function(col, dragHandle) {
      cols.push(col);
      managedCols.push(col);
      dragHandles.push(dragHandle);

      if (!pendingResize) {
        pendingResize = true;
        // we need to resize on the digest to make sure all col changes have completed
        $timeout(ctrl.resizeAll, 0);
      }

    };

    ctrl.removeCol = function(col) {
      var idx = cols.indexOf(col);
      if (idx > -1) {
        cols.splice(idx,1);
        dragHandles.splice(idx,1);
      } else {
        idx = autoCols.indexOf(col);
        autoCols.splice(idx,1);
      }
      idx = managedCols.indexOf(col);
      managedCols.splice(idx,1);
    };


    // take 5% total from all other resizable cells so this cell will have space.
    ctrl.resizeAll = function() {

      var shortAmount = 0;
      var shortCols = 0;

      var i, thisWidth;

      var initialWidths = [];

      for (i = 0; i< managedCols.length; i++) {
        thisWidth = managedCols[i].width();
        initialWidths.push(thisWidth);
        if (thisWidth < ctrl.minimumWidth) {
          shortAmount += ctrl.minimumWidth - thisWidth;
          shortCols++;
        }
      }

      var reduceColsAmt = shortAmount / (managedCols.length - shortCols);

      var adjustedAmount = 0;

      // increase rows under min width + reduce rows over min width
      for (i = 0; i < managedCols.length; i++) {

        thisWidth = initialWidths[i];

        if (thisWidth <  ctrl.minimumWidth) {
          managedCols[i].width(ctrl.minimumWidth);
          adjustedAmount +=  (ctrl.minimumWidth - thisWidth);
          initialWidths[i] = ctrl.minimumWidth;
          // console.log('increased wide: ', ctrl.minimumWidth - thisWidth)
        } else {
          var reduceThisAmt = Math.min(thisWidth - ctrl.minimumWidth, reduceColsAmt);
          managedCols[i].width(thisWidth - reduceThisAmt);
          adjustedAmount -= reduceThisAmt;
          initialWidths[i] = thisWidth - reduceThisAmt;
          // console.log('decrease wide: ', reduceThisAmt)
        }

      }

      // anything that couldn't be removed evenly we'll take from anywhere we can
      if (adjustedAmount > 0) {

        for (i = 0; i < managedCols.length; i++) {

          thisWidth = initialWidths[i];

          if (adjustedAmount && thisWidth > ctrl.minimumWidth) {
            var reduceByLeftoverAmt = Math.min(thisWidth - ctrl.minimumWidth, adjustedAmount);
            managedCols[i].width(thisWidth - reduceByLeftoverAmt);
            adjustedAmount -= reduceByLeftoverAmt;
            initialWidths[i] = thisWidth - reduceByLeftoverAmt;
            // console.log('decrease wide: ', reduceByLeftoverAmt)
          }

        }

      }


      // set rows back to pct / auto;
      var rowWidth = ctrl.table.outerWidth(true);

      for (i = 0; i< cols.length; i++) {
        var cell = cols[i];
        var widthPct = (Math.round((cell.outerWidth(true) / rowWidth) * 10000) / 100).toString() + '%';
        cell.css('width', widthPct);
      }

      for (i = 0; i< autoCols.length; i++) {
        autoCols[i].css('width', 'auto');
      }


      pendingResize = false;


    };

  }]);