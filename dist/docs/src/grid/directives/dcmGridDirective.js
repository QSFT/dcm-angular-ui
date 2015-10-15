'use strict';

/**
 * @ngdoc directive
 * @name dcmGrid
 * @module dcm-ui.grid
 * @restrict E
 *
 * @description
 * Creates a grid from the array passed in via the datasource attribute. The dcm-grid-column
 child tags configure each column in the grid. The contents of these tags is interpolated into
 that column in the grid with the data from the current array item.
 *
 * The dcm-grid-row-actions content is transcluded into the currently active row.
 The scope for that transclusion has the data from the array item copied into it, so you can use any
 angular functionality. (unlike the individual cells)
 *
 * If a binding for the sort function is provided whenever a column is clicked a function to
 calculate the value of each row is placed into it.
 *
 * @usage
 * ```html
   <dcm-grid datasource="Array">
      <dcm-grid-column>{{col1}}</dcm-grid-column>
      <dcm-grid-column>{{col2}}</dcm-grid-column>
      ...
      <dcm-grid-row-actions>
          <dcm-grid-row-action-buttons></dcm-grid-row-action-buttons>
      </dcm-grid-row-actions>
    </dcm-grid>
  ```
 *
 * @param {array} datasource - the data to be displayed in the grid
 *
 * @param {string=} activeRow - variable to bind the active rows data to
 * @param {Object|Array=} selected - variable to bind the selected item data to
 (object or array depending on if this is a single select)
 * @param {string=} [select-type=multiple] - type of select can be single or multiple
 * @param {Object=} additionalRowData - variable containing additional data for
 each row. This is used by the optional dcm-grid-row-actions element.
 * @param {Function=} sortFunction - variable to bind the sort function provided when a col is clicked on
 * @param {string} [sortOrder=ASC] - variable to bind the sort order string to (ASC/DESC)
 *
 * @param {String=} [open-row] - function that returns data or a promise for data to be merged
 into row data when row is opened. row being opened is passed to it
 *
 * @param {String=} [reload-row] - function that returns data or a promise for data to be merged
 into row data when row is reloaded. row being reloaded is passed to it.
 *
 * @param {String=} [reload-trigger] - sets this to a function which can be used to trigger the
 reloading of a row, the first param is a unique selector for the row to be reloaded
 *
 * @param {Integer=}[loading-delay=500] - the default delay (ms) before adding the show-loading class to the row
 *
 * @param {Boolean=}[cache-opened-rows=true] - if the open-row function needs to be invoked for a
 previously opened row
 *
 * @example
   <example name="grid-demo" module="dcm-ui.grid">
    <file name="index.html">
       <div ng-controller="GridExampleCtrl">

          <dcm-grid
            datasource="tableData"
            width="100%"
          >

            <dcm-grid-row>
              <dcm-grid-column title="Name">{{fname}} {{lname}}</dcm-grid-column>
              <dcm-grid-column title="Age">{{age}}</dcm-grid-column>
              <dcm-grid-column title="Serial">{{uuid}}</dcm-grid-column>
            </dcm-grid-row>

            <dcm-grid-row-actions>
                We can include additional controls here for when a row is "active" (they are transcluded in the context of this row)
            </dcm-grid-row-actions>

          </dcm-grid>

      </div>
    </file>
    <file name="app.js">
      angular.module('dcm-ui.grid')
        .controller('GridExampleCtrl', ['$scope', //  'datasource', '$log', 'filters', '$q', '$timeout',
          function ($scope) { // , datasource, $log, filters, $q, $timeout

          $scope.tableData = [
            {fname: 'James', lname: 'Andersen', age: 41, uuid: 'ad6d4f60-27dd-41a4-bc58-4b66eb8cc2f7'},
            {fname: 'Albertine', lname: 'Roquefort', age: 19, uuid: 'a3483f04-6d88-4cab-94e8-f37d47140112'},
            {fname: 'Harry', lname: 'Elfsport', age: 52, uuid: '752501b5-8c9c-4bf8-8dbf-549d247c54de'},
            {fname: 'Mojune', lname: 'Starkadder', age: 27, uuid: 'ed788226-7fd5-4c64-8065-63e88b5414df'},
            {fname: 'Julia', lname: 'Hazeldene', age: 84, uuid: 'da428eb5-3b7d-4c21-8b04-b0deaf54c4a0'}
          ];

        }]);
    </file>
  </example>
 */

angular.module('dcm-ui.grid')
  .directive('dcmGrid', ['$animate', '$log', '$compile', '$window',
    function ($animate, $log, $compile, $window) {

    return {
      restrict: 'E',
      require: 'dcmGrid',
      scope: {
        datasource: '=',
        activeRow: '=?',
        selected: '=?',
        additionalRowData: '=?',
        sortFunction: '=?',
        sortOrder: '=?',
        editColumns: '=?',
        storeConfig: '@',

        openRow: '=?',
        reloadRow: '=?',
        reloadTrigger: '=?',
        cacheOpenedRows: '@?',
        loadingDelay: '@?'
      },

      controller: 'DCMGridCtrl',

      compile: function() {

        return function postLink(scope, element, attrs, ctrl) {

          ctrl.bEnableSelect = !!attrs.selected;
          ctrl.bEnableActive = !!attrs.activeRow;
          ctrl.sortable = !!attrs.sortFunction;

          ctrl.selectType = attrs.selectType ? attrs.selectType.toLowerCase() : 'multiple';

          if (ctrl.selectType === 'multiple') {
            ctrl.checkedIcon = 'fa-check-square-o';
            ctrl.notCheckedIcon = 'fa-square-o';
          } else {
            ctrl.checkedIcon = 'fa-dot-circle-o';
            ctrl.notCheckedIcon = 'fa-circle-o';
          }


          ctrl.reloadRow = scope.reloadRow;

          scope.reloadTrigger = ctrl.reloadTrigger;

          ctrl.rowOpener = scope.openRow;

          if (scope.loadingDelay !== undefined && scope.loadingDelay.match(/^\d+$/)) {
            ctrl.rowLoadingDelay = parseInt(scope.loadingDelay, 10);
          } else {
            ctrl.rowLoadingDelay = 500;
          }

          if (scope.cacheOpenedRows !== undefined && scope.cacheOpenedRows.toLowerCase() === 'false') {
            ctrl.bRowLoaderRememberOpened = false;
          } else {
            ctrl.bRowLoaderRememberOpened = true;
          }

          if (scope.additionalRowData) {
            ctrl.additionalRowData = scope.additionalRowData;
          }

          // replace it with a table (once we've contructed it)
          var tableHead = ctrl.tableHead = angular.element('<thead>');
          var tableBody = ctrl.tableBody = angular.element('<tbody>');
          var table = ctrl.table = angular.element('<table class="dcm-grid-table resizable-columns">');

          if (attrs.width) {
            table.css('width', attrs.width);
          }

          if (ctrl.bRowActions) {
            table.addClass('has-row-actions');
          } else {
            table.addClass('no-row-actions');
          }

          // add table head to table
          table.append(tableHead);

          // add cols to table head
          tableHead.append(ctrl.generateHeaderRow());

          // compile table + thead (to get the resizable working...)
          $compile(table)(scope);


          // generate templates for body
          ctrl.generateTemplates();


          // if data changes... (and on first load)
          // note this is only a shallow watch, will not trigger on col changes.

          var aRecords = [];
          var oVisibleRecordId = {};

          // watch for external changes to selection
          if (ctrl.bEnableSelect) {
            if (ctrl.selectType === 'single') {

              scope.$watch('selected', function(newSelected, oldSelected){
                var rec;

                if (newSelected !== oldSelected) {

                  // remove previously selected value
                  if (oldSelected) {
                    rec = ctrl.getGridData(oldSelected);
                    if (rec) {
                      ctrl.removeSelected(rec);
                    }
                  }

                  if (newSelected) {
                    rec = ctrl.getGridData(newSelected);
                    if (rec) {
                      ctrl.addSelected(rec);
                    } else {
                      // if this value wasn't in the grid
                      scope.selected = null;
                    }
                  }
                }

              });

            }

          }


          scope.$watchCollection('datasource', function(aData) {

            var requestStart = (new Date()).getTime();

            ctrl.aRows = aData;

            var aSelected = [];
            var restoreActiveRow;

            // if for some reason the data isn't an array (probably undefined or null)
            // set it to an empty array
            if (!_.isArray(aData)) {
              aData = [];
            }

            // deactivate any currently active row if it's not in the new data
            // if it is in the data close and reopen after re-render (position may move)
            if (ctrl.bEnableActive && scope.activeRow) {
              if (_.indexOf(aData,scope.activeRow) !== -1) {
                $log.info('GRID: storing active row to reopen later');
                restoreActiveRow = scope.activeRow;
              }
              ctrl.removeActiveRow();
            }

            // deselect anything currently selected but not in the new data
            if (ctrl.bEnableSelect) {
              aSelected = ctrl.getSelectedAsArray();
              for (var i = aSelected.length - 1; i>= 0; i-- ) {
                if (_.indexOf(aData,aSelected[i]) === -1) {
                  var rec = ctrl.getGridData(aSelected[i]);
                  if (rec) {
                    ctrl.removeSelected(rec);
                  } else {
                    if (ctrl.selectType === 'single') {
                      scope.selected = null;
                    } else {
                      scope.selected.splice(i, 1);
                    }
                  }
                }
              }
            }



            scope.toggleActiveRow = function($row) {
              // check for selected text.  If there is a selection, user is copying text and not toggling
              var selection = $window.getSelection().toString();
              if(!selection){
                if (scope.activeRow === $row.data) {
                  scope.activeRow = undefined;
                } else {
                  scope.activeRow = $row.data;
                }
              }
            };

            scope.toggleChecked = function($row, evt) {
              $row.checked = !$row.checked;
              if($row.checked) {
                ctrl.addSelected($row.record);
              } else {
                ctrl.removeSelected($row.record);
              }
              evt.stopPropagation();
            };


            var id, record, position, oldPosition;

            var aNewRecords = [];
            var oNewRecordId = {};



            var watchRow = function(item, key){
              var scope = this;
              scope[key] = item;
              scope.$watch(function() { return scope.$$gridData[key]; }, function(newVal){
                if (newVal !== scope[key]) {
                  scope[key] = newVal;
                }
              });
            };


            // we are not using forEach for perf reasons (trying to avoid #call)
            for (var index = 0, length = aData.length; index < length; index++) {

              var rowData = aData[index];

              id = ctrl.getGridDataID(rowData);

              record = ctrl.getGridData(rowData);

              // if this row does not have a record setup or the data has changed
              // create a new record for it
              if (!record || !_.isEqual(record.lastValue,rowData) ) {
                // create a new scope for the transcluded row options
                var newScope = scope.$new(false);
                var thisRow = rowData;
                var thisRecord = {};

                newScope.$$gridData = aData[index];

                // setup watchers for the data in each row
                angular.forEach(rowData, watchRow, newScope);

                //copy in the additional row data
                if (ctrl.additionalRowData) {
                  angular.extend(newScope, ctrl.additionalRowData);
                }

                // if there is a loader configured add it to the scope
                // if (ctrl.bRowLoader) {
                //   newScope.$$load = ctrl.rowLoader.call(newScope);
                // }

                newScope.$row = {
                  checked: (_.indexOf(aSelected, thisRow) !== -1) ? true : false,
                  data: thisRow,
                  record: thisRecord,
                  dataLoading: false,
                  showLoading: false,
                  openCached: false,
                  open: false,
                  closed: ctrl.bRowActions ? true : false
                };


                angular.extend(thisRecord, {
                  scope: newScope,
                  data: thisRow,
                  lastValue: _.clone(thisRow),
                  id: id
                });

                ctrl.putGridData(id, thisRecord);

                // if this row was already marked active, rerun the activate command to setup the dom
                if (ctrl.bEnableActive && scope.activeRow === thisRow) {
                  // invoke the set active function
                  ctrl.setActiveRow(thisRow.data);
                }

                record = thisRecord;

              }

              //  ctrl.bindRowData(record);

              // we now have this row's record.
              oNewRecordId[id] = aNewRecords.length; // = position in records
              aNewRecords.push(record);

            }



            // remove old records
            for (index = aRecords.length - 1; index >= 0; index--) {

              record = aRecords[index];

              // if this is a new item vs one being moved / left
              if (!oNewRecordId.hasOwnProperty(record.id)) {

                position = oVisibleRecordId[record.id];

                delete oVisibleRecordId[record.id];
                aRecords.splice(position,1);

                // loop over records after this and update their positions
                if (index - 1 < aRecords.length - 1) {
                  shiftBack(index, aRecords.length);
                }

                $animate.leave(record.row);

              }

            }

            // add new rows + move/leave existing rows
            for (index = 0, length = aNewRecords.length; index < length; index++) {

              record = aNewRecords[index];

              // no need to do anything if this record is already in the correct position
              if ( !(aRecords.length >= index && aRecords[index] === record) ) {


                // if this is a new item vs one being moved / left
                if (!oVisibleRecordId.hasOwnProperty(record.id)) {

                  // compile row + find checkbox
                  record.row = ctrl.rowTemplate(record.scope, angular.noop);
                  record.checkbox = record.row.find('td.dcm-grid-selectable i');

                  if (index === 0) {
                    $animate.enter(record.row, tableBody, null);
                  } else {
                    $animate.enter(record.row, tableBody, aRecords[index - 1].row);
                  }

                  // add into aRecords
                  aRecords.splice(index, 0, record);
                  oVisibleRecordId[record.id] = index;


                  // update indexes for all records after this in aRecords
                  if (index + 1 < aRecords.length) {
                    shiftForward(index+1, aRecords.length);
                  }

                } else {

                  // this is an item already visible, we need to move it if it's not in the correct position
                  if (index === 0) {
                    $animate.move(record.row, tableBody, null);
                  } else {
                    $animate.move(record.row, tableBody, aRecords[index - 1].row);
                  }

                  oldPosition = oVisibleRecordId[record.id];

                  // remove from old position
                  aRecords.splice(oldPosition,1);
                  // add back to new position
                  aRecords.splice(index,0,record);

                  oVisibleRecordId[record.id] = index;

                  // update the indexes on things between start and end
                  // this is if we have pulled something from in front of us closer to the start
                  shiftForward(index+1, oldPosition + 1);

                }

              }

            }



            // restore the active row if there was one before new data arrived
            if (restoreActiveRow) {
              $log.info('GRID: restoring active row');
              ctrl.setActiveRow(restoreActiveRow);
            }


            var ms = (new Date()).getTime() - requestStart;
            $log.info('GRID: Update after data change ' + ms + 'ms');


          }); // end of data watcher

          var shiftForward = function(start, end) {
            _.each(_.range(start, end), function(idx){
              oVisibleRecordId[aRecords[idx].id]++;
            });
          };

          var shiftBack = function(start, end) {
            _.each(_.range(start, end), function(idx){
              oVisibleRecordId[aRecords[idx].id]--;
            });


          };

          // replace the contents of this element with the table
          table.append(tableBody);
          element.empty().append(table);

        };


      }
    };


  }]);
