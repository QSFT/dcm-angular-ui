'use strict';

angular.module('dcm-ui.grid')

  .controller('DCMGridCtrl', ['$scope', '$compile', '$log', '$interpolate', '$timeout',
    function($scope, $compile, $log, $interpolate, $timeout) {

    var ctrl = this;

    var predefinedCols = [];
    var storedCols = [];

    // if local storage has been specified for the grid attempt to load it
    // we need to validate the data before using...
    if ($scope.storeConfig && localStorage[$scope.storeConfig]) {

      $log.info('GRID: attempting to load grid config from local storage');
      storedCols = JSON.parse(localStorage[$scope.storeConfig]);

    }


    // if there is col config provided to us on page load use it...
    // we need to validate these against the grid config before using them
    if ($scope.hasOwnProperty('columns') && angular.isArray($scope.columns)) {
      predefinedCols = $scope.columns;
    }

    var columns = ctrl.columns = $scope.columns = [];

    // editcols is a bi-directional binding to the cols away,
    // we need to set it up here
    // also grid isn't updated until update() invoked as we don't want to do this until we
    // are really ready (i.e all changes are complete)
    if ($scope.hasOwnProperty('editColumns')) {
      $scope.editColumns = columns;
      $scope.editColumns.update = function() {
        ctrl.redrawGrid();
      };
    }


    ctrl.rowActionContent = '';
    ctrl.oRowActions = undefined;

    ctrl.headerRow = '';
    ctrl.aRows = [];


    // data cache (for this grid instance)
    var cacheIndex = 0;
    var oGridData = {};
    // var oGridHTML = {};

    ctrl.getGridDataID = function(data) {
      if (!data.hasOwnProperty('$$gridDataID')) {
        cacheIndex++;
        data.$$gridDataID = $scope.$id + '-' + cacheIndex.toString();
      }
      return data.$$gridDataID;
    };

    ctrl.getGridData = function(data) {
      var id = ctrl.getGridDataID(data);
      if (oGridData.hasOwnProperty(id)) {
        return oGridData[id];
      }
      return null;
    };

    ctrl.putGridData = function(id,record) {
      oGridData[id] = record;
    };




    ctrl.addColumn = function(column) {

      // check loaded data for this col
      var aExisting = _.where(storedCols, {title: column.title, content: column.content});

      // if not found check predefined settings
      if (!aExisting.length) {
        aExisting = _.where(predefinedCols, {title: column.title, content: column.content});
      }

      if (aExisting.length) {
        column.sortDefault = aExisting[0].sortDefault;
        column.width = aExisting[0].width;
        column.enabled = aExisting[0].enabled;
      }

      columns.push(column);

    };


    ctrl.redrawGrid = function() {

      // remove existing rows
      ctrl.tableBody.empty();


      // generate a new header row and
      // add row to table head section
      ctrl.tableHead.empty();

      ctrl.tableHead.append(ctrl.generateHeaderRow());

      // generate new row templates
      ctrl.generateTemplates();

      // compile header row
      $compile(ctrl.tableHead)($scope);


      // render rows
      // we are not using forEach for perf reasons (trying to avoid #call)
      for (var index = 0, length = ctrl.aRows.length; index < length; index++) {

        var rowData = ctrl.aRows[index];
        var record = ctrl.getGridData(rowData);

        record.row = ctrl.rowTemplate(record.scope, angular.noop);
        record.checkbox = record.row.find('td.dcm-grid-selectable i');

        ctrl.tableBody.append(record.row);

      }

      $log.info('GRID: templates regenerated + table updated');

      // store updated config
      ctrl.storeConfig();

    };


    ctrl.getColWidthPct = function(col) {

      // get % with 2d.p (for storing widths as %)
      return Math.round((col.outerWidth(true) / ctrl.headerRow.width()) * 10000) / 100;

    };

    // watch for col resizes and update col objects if change found
    $scope.$on('TABLE_COL_RESIZED', function(){

      var checkCol = 0;
      var aCells = ctrl.headerRow.children();

      // first col will be active marker if active is enabled
      if (ctrl.bEnableActive) {
        checkCol++;
      }

      angular.forEach(ctrl.columns, function(col) {

        // only check enabled cols (others not in the dom)
        if (col.enabled) {

          var pageCol = angular.element(aCells[checkCol]);
          col.width = ctrl.getColWidthPct(pageCol).toString() + '%';
          checkCol++;

        }

      });

      // store updated config
      ctrl.storeConfig();

    });


    ctrl.storeConfig = function() {
      if ($scope.storeConfig) {
        var saveData = _.map(columns, function(col){
          return {
            width: col.width,
            sortDefault: col.sortDefault,
            enabled: col.enabled,
            title: col.title,
            content: col.content
          };
        });
        localStorage[$scope.storeConfig] = JSON.stringify(saveData);
        $log.info('GRID: grid config saved to local storage');
      }

    };


    ctrl.oRowAttributes = {};
    ctrl.addRowAttributes = function(attrs) {
      angular.extend(ctrl.oRowAttributes, attrs);
    };


    ctrl.oRowActionsAttributes = {};
    ctrl.addRowActionsAttributes = function(attrs) {
      angular.extend(ctrl.oRowActionsAttributes, attrs);
    };


    ctrl.getSelectedAsArray = function() {

      if (ctrl.selectType === 'single') {
        var aData = [];
        if ($scope.selected) {
          aData.push($scope.selected);
        }
        return aData;
      } else {
        return $scope.selected;
      }

    };


    ctrl.selectedPosition = function(record) {
      return _.indexOf(ctrl.getSelectedAsArray(), record.data);
    };

    ctrl.toggleSelected = function(checked) {
      var record, index, length;

      if (checked) {
        for (index = 0, length = $scope.datasource.length; index < length; index++) {
          record = ctrl.getGridData($scope.datasource[index]);
          if (!record.checkbox.hasClass(ctrl.checkedIcon)) {
            ctrl.addSelected(record);
          }
        }
      } else {
        for (index = $scope.selected.length - 1; index >= 0; index--) {
          record = ctrl.getGridData($scope.selected[index]);
          ctrl.removeSelected(record);
        }
      }
    };

    ctrl.addSelected = function(record) {

      if (ctrl.selectType === 'single') {
        if ($scope.selected && $scope.selected !== record.data) {
          ctrl.removeSelected(ctrl.getGridData($scope.selected));
        }
        $scope.selected = record.data;
      } else {
        $scope.selected.push(record.data);
      }

      record.scope.$row.checked = true;

      if (ctrl.bEnableActive && ctrl.oRowActions && $scope.activeRow === record.data) {
        ctrl.oRowActions.addClass('selected');
      }
    };

    ctrl.removeSelected = function(record) {

      if (ctrl.selectType === 'single') {
        $scope.selected = null;
      } else {
        $scope.selected.splice(ctrl.selectedPosition(record), 1);
      }
      record.scope.$row.checked = false;

      if (ctrl.bEnableActive && ctrl.oRowActions && $scope.activeRow === record.data) {
        ctrl.oRowActions.removeClass('selected');
      }

    };


    ctrl.mergeAttributes = function(el, attrs) {
      angular.forEach(attrs, function(item, key) {
        // merge ng-class tags
        if (key === 'ng-class' && el.attr('ng-class')) {
          el.attr(key, (el.attr('ng-class')  + item).replace(/}\s*{/,', ') );
        } else {
          el.attr(key, item);
        }
      });
    };






    ctrl.rowTemplate = angular.noop;
    ctrl.activeRowTemplate = angular.noop;

    ctrl.generateTemplates = function() {

      var rowTemplate = angular.element('<tr ng-class="{selected: $row.checked}">');

      var tempCol, tempCell;

      // add row attributes to row template
      ctrl.mergeAttributes(rowTemplate, ctrl.oRowAttributes);

      for (var colIndex = 0, colLength = ctrl.columns.length; colIndex < colLength; colIndex++) {
        // loop over cols, only add enabled ones
        tempCol = ctrl.columns[colIndex];
        if (tempCol.enabled) {

          // generate new cell
          tempCell = angular.element('<td>');

          // add content to cell
          tempCell.append(tempCol.content);

          // add cell attriubtes
          ctrl.mergeAttributes(tempCell, tempCol.attributes);

          rowTemplate.append(tempCell);
        }
      }

      // row selector
      if (ctrl.bEnableSelect) {

        // setup select state classes
        var ngClassVal = '{\'' +
          ctrl.checkedIcon + '\': $row.checked, \'' +
          ctrl.notCheckedIcon + '\': !$row.checked }';

        // setup faux checkbox for select state
        var checkbox = angular.element('<i class="fa" ng-class="' + ngClassVal + '"></i>');

        // add to the new row
        rowTemplate.append(angular.element('<td ng-click="toggleChecked($row, $event);" class="dcm-grid-selectable"></td>').append(checkbox));
      }


      // active marker
      if (ctrl.bEnableActive) {
        rowTemplate.attr('ng-click', 'toggleActiveRow($row)');
        rowTemplate.prepend(angular.element('<td class="dcm-grid-activemarker"></td>'));
      } else if (ctrl.bEnableSelect) {
        // if active rows are disabled but select is enabled, allow select by clicking row
        rowTemplate.attr('ng-click', 'toggleChecked($row, $event)');
      }

      ctrl.rowTemplate = $compile(rowTemplate);


      // generate the template for an active row's actions if a <dcm-grid-row-actions> element exists
      if (ctrl.bRowActions) {

        var activeRowTemplate = angular.element('<tr class="dcm-grid-details">');

        // merge in attributes from the <dell-row-actions> element
        ctrl.mergeAttributes(activeRowTemplate, ctrl.oRowActionsAttributes);

        // set colspan to span the remaining cols
        var colSpan = ctrl.colCount - 1;

        var newCell = angular.element('<td ng-click="" colspan="' + colSpan + '">').html(ctrl.rowActionContent);

        // add active marker if active is enabled
        if (ctrl.bEnableActive) {
          activeRowTemplate.append(angular.element('<td class="dcm-grid-activemarker"></td>'));
        }

        activeRowTemplate.append(newCell);
        ctrl.activeRowTemplate = $compile(activeRowTemplate);
      }

    };


    ctrl.generateHeaderRow = function() {

      ctrl.colCount = 0;

      var lastVisible = -1;
      for (var i = 0; i < ctrl.columns.length; i++) {
        if (ctrl.columns[i].enabled) {
          lastVisible = i;
        }
      }

      // add headers row to thead
      var row = angular.element('<tr>');
      angular.forEach(ctrl.columns, function(col) {

        if (col.enabled) {

          col.icon = '';

          ctrl.colCount++;

          var titleWrap;

          // create a scope for each column
          var colScope = $scope.$new(false);
          colScope.column = col;

          titleWrap = $compile('<a>{{column.title}}<i class="fa" ng-if="column.icon" ng-class="column.icon"></a>')(colScope);

          var cell = angular.element('<th class="resizable-column">').append(titleWrap);

          // set the width on this col (min 50px if not defined)
          // nb: if this is the last col the resizable col directive will replace
          // it's width with auto
          cell.css('width', col.width ? col.width : 'auto');


          // setup sort functions for each col
          if (ctrl.sortable) {

            var getData;

            if (col.field) {
              // if this col had a sort field specified (or we could get a single field from the content...)

              if (col.field.match(/\./)) {
                var aParts = col.field.split('.');
                getData = function(a) {
                  var nested = a;
                  for (var i = 0; i < aParts.length; i++) {
                    var key = aParts[i];
                    if (nested.hasOwnProperty(key)) {
                      nested = nested[key];
                    } else {
                      // key doesn't exist so return
                      return;
                    }
                  }
                  return nested;
                };
              } else {
                getData = function(a) {
                  return a[col.field];
                };
              }


            } else {
              // interpolate the content with the data
              getData = $interpolate(col.content);
            }

            switch(col.sortType) {

            case 'string':
              col.sortFunction = function(a) {
                var data = getData(a) || '';
                return data.toLowerCase();
              };
              break;

            case 'integer':
              col.sortFunction = function(a) {
                var val = getData(a);
                val = val ? val : 0;
                return parseInt(val,10);
              };
              break;

            case 'datetime':
              col.sortFunction = function(a) {
                var dt = new Date(getData(a));
                return dt.getTime();
              };
              break;

            case 'direct':
              col.sortFunction = getData;
              break;

            default:
              var firstRowType;

              col.sortFunction = function(a) {

                var data = getData(a);

                if (!firstRowType) {
                  firstRowType = typeof data;
                  // if it matches the time format the server uses... (iso date/time)
                  if (firstRowType === 'string' &&
                    data.match(/^\d{4,4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/) ) {
                    firstRowType = 'datetime';
                  }

                }

                switch (firstRowType) {

                case 'string':
                  return data ? data.toLowerCase() : '';

                case 'datetime':
                  // don't actually need to parse ISO date! (uncomment if format changes)
                  // return moment(data).valueOf();
                  return data ? data : '';

                default:
                  return data ? data : '';

                }

              };
              break;

            }

            // if this col is the default col to sort on, set up the sort
            if (col.sortDefault) {
              $scope.sortFunction = col.sortFunction;
              if (ctrl.currentSort && ctrl.currentSort !== col) {
                ctrl.currentSort.sortDefault = false;
              }
              ctrl.currentSort = col;
              $scope.sortOrder = col.sortDefault.toUpperCase();
              if ($scope.sortOrder === 'ASC') {
                col.icon ='fa-angle-up';
              } else {
                col.icon = 'fa-angle-down';
              }
            }


            cell.bind('click', function(){
              $scope.$apply(function(){

                // remove current sort if there is one
                if (ctrl.currentSort) {
                  ctrl.currentSort.icon = '';

                  if (ctrl.currentSort === col && $scope.sortOrder !== 'DESC') {
                    $scope.sortOrder = 'DESC';
                    col.icon = 'fa-angle-down';
                  } else {
                    $scope.sortOrder = 'ASC';
                    col.icon = 'fa-angle-up';
                  }

                } else {
                  $scope.sortOrder = 'ASC';
                  col.icon = 'fa-angle-up';
                }

                if (ctrl.currentSort !== col) {
                  if (ctrl.currentSort) {
                    ctrl.currentSort.sortDefault = false;
                  }
                  $scope.sortFunction = col.sortFunction;
                  ctrl.currentSort = col;
                }

                ctrl.currentSort.sortDefault = $scope.sortOrder;

                // sort order changed, store grid config
                ctrl.storeConfig();

              });

            });

          }

          row.append(cell);

        }


      });

      // row selector
      if (ctrl.bEnableSelect) {
        ctrl.colCount++;
        var cell = angular.element('<th class="dcm-grid-selectable"></th>');

        if (ctrl.selectType !== 'single') {

          var toggleSelection = angular.element('<i class="fa fa-square-o">');
          toggleSelection.bind('click', function(){
            $scope.$apply(function(){
              var checked = toggleSelection.hasClass(ctrl.checkedIcon);
              ctrl.toggleSelected(!checked);
            });
          });
          cell.append(toggleSelection);

          if (ctrl.unbindBulkCheck) {
            ctrl.unbindBulkCheck();
          }
          ctrl.unbindBulkCheck = $scope.$watchCollection('selected', function(selected){
            var allSelected = (selected.length && selected.length === ctrl.aRows.length);

            toggleSelection
              .removeClass('fa-check-square-o fa-square-o')
              .addClass(allSelected ? ctrl.checkedIcon : ctrl.notCheckedIcon)
            ;

          });


        }

        row.append(cell);
      }

      // setup active marker + watcher on active field in $scope
      if (ctrl.bEnableActive) {

        ctrl.colCount++;

        row.prepend(angular.element('<th class="dcm-grid-activemarker"></th>'));

        $scope.$watch('activeRow', function(data, previousRow){
          if(previousRow !== undefined) {
            ctrl.removeActiveRow(previousRow);
          }
          ctrl.setActiveRow(data);
        });

      }

      ctrl.headerRow = row;

      return row;

    };


    ctrl.removeActiveRow = function(row) {

      row = row || $scope.activeRow;

      // remove the active class from the currently active row (if there is one)
      // then set remove the currently active row
      if (row) {
        var record = ctrl.getGridData(row);
        if (record && record.row) {
          record.row.removeClass('active');
        }
        $scope.activeRow = undefined;
      }

      // remove the row actions row from the dom if present
      if (ctrl.oRowActions) {
        ctrl.oRowActions.remove();
      }


    };

    var activateRow = function(activeRecord) {

      if (activeRecord && activeRecord.hasOwnProperty('row')) {

        // add active class to this row
        activeRecord.row.addClass('active');

        // if the active row has row actions, render the template after it
        if (ctrl.bRowActions) {
          // compile the active row template with the rows scope then append to table
          var newRow = ctrl.activeRowTemplate(activeRecord.scope, angular.noop);
          // add selected class if this row is selected
          if (ctrl.bEnableSelect && ctrl.selectedPosition(activeRecord) !== -1) {
            newRow.addClass('selected');
          }
          ctrl.oRowActions = newRow;
          // append after the active row
          activeRecord.row.after(ctrl.oRowActions);
        }

      } else {

        ctrl.removeActiveRow();

      }

    };

    ctrl.setActiveRow = function(data) {

      ctrl.removeActiveRow();
      if (data) {

        $scope.activeRow = data;

        var activeRecord = ctrl.getGridData(data);

        // if the row was preselected then the active row may not be rendered yet
        if (activeRecord && activeRecord.hasOwnProperty('row')) {
          activateRow(activeRecord);
        } else {
          $timeout(function(){
            activateRow(activeRecord);
          },0);
        }

      }

    };


    // deselect anything selected on scope being destroyed
    $scope.$on('$destroy', function(){

      // deactivate any currently active row if it's not in the new data
      if (ctrl.bEnableActive && $scope.activeRow) {
        ctrl.removeActiveRow();
      }

      // deselect anything currently selected
      if (ctrl.bEnableSelect) {
        var aSelected = ctrl.getSelectedAsArray();
        for (var i = aSelected.length - 1; i>= 0; i-- ) {
          var record = ctrl.getGridData(aSelected[i]);
          ctrl.removeSelected(record);
        }
      }

      // clear caches
      // oGridData = {};
      // oGridHTML = {};

    });





  }]);
