'use strict';

/**
 * @ngdoc module
 * @name dcm-ui.grid
 * @description
 *
 * The `dcm-ui.grid` module provides an angular based grid component.
 * Also includes a service for managing the grid datasource and filters.
 *
 * requires: underscore.js, jQuery</p>
 *
 * @example
   <example name="grid-demo" module="dcm-ui" style="height:1600px;">

    <file name="first.js">
      // This grid uses most of the available functionality
      // A minimal example can be found in the dcm-grid directive docs
    </file>


    <file name="index.html">
       <div ng-controller="GridExampleCtrl">

          <div class="panel panel-default">

            <div class="panel-heading">
              <h3 class="panel-title">Grid Setup</h3>
            </div>

            <div class="panel-body form-inline">

              <div class="input-group input-group" style="float: left;">
                  <button class="btn btn btn-warning" ng-click="toggleConfig()">Configure Columns</button>
              </div>

              <div class="input-group input-group" style="margin-left: 5px; width: 160px; float: left;">
                  <span class="input-group-addon">Record Sets</span>
                  <input type="number" class="form-control input" placeholder="Sets" ng-model="dsOpts.iterations">
              </div>

              <div class="input-group input-group" style="width: 175px; margin-left: 5px; float: left;">
                  <span class="input-group-addon">Records/Set</span>
                  <input type="number" class="form-control input" placeholder="Records" ng-model="dsOpts.recordsPerIteration">
              </div>

              <div class="input-group input-group" style="margin-left: 5px; float: left;">
                  <button class="btn btn btn-primary" ng-click="datasource.loadData()">
                    <i ng-if="datasource.bLoading || datasource.bFiltering" class="fa fa-spin fa-spinner"></i> reload
                  </button>
              </div>

              <div class="input-group input-group" style="margin-left: 5px; float: left;">
                  <button class="btn btn btn-primary" ng-click="randomReload()">
                     reload a row
                  </button>
              </div>

              <div class="input-group input-group" style="width: 175px; margin-left: 5px; float: right;">
                  <span class="input-group-addon">Records/Page</span>
                  <input type="number" class="form-control input" placeholder="Records" ng-model="paginationOptions.perPage">
              </div>

            </div>

          </div>

          <div class="panel panel-warning" ng-if="showConfig">

            <div class="panel-heading">
              <h3 class="panel-title">Columns</h3>
            </div>

            <div class="panel-body form">

              <div class="checkbox" ng-repeat="col in serverGrid.cols">
                <label>
                  <input type="checkbox" ng-model="col.enabled">
                  {{col.title}}
                </label>
              </div>

            </div>

            <div class="panel-footer">
              <button class="btn btn-link text-danger" aria-hidden="true" ng-click="toggleConfig()">Cancel</button>
              <button class="btn btn-primary" ng-click="serverGrid.cols.update(); toggleConfig();">Update</button>
            </div>

          </div>


          <div class="panel panel-primary">

            <div class="panel-heading">
              <h3 class="panel-title">Example filters</h3>
            </div>

            <div class="panel-body form-inline">

              <div class="form-group">
                <input
                  type="hidden"
                  dcm-select2="{allowClear: true, placeholder: 'Any model...'}"
                  data="filter.data.models"
                  ng-model="filter.values.model"
                  class="form-control"
                  style="width:175px"
                >
              </div>

              <div class='form-group'>
                <input
                    ng-model="filter.values.serviceTag"
                    type='text'
                    class='form-control'
                    placeholder='Filter Service Tag'
                    style="width:175px"
                  >
              </div>


              <div class="form-group">
                <div class="checkbox" style="margin-top: 7px; margin-bottom: 7px;">
                  <label>
                    <input type="checkbox" ng-model="filter.values.isOnline">
                    Only Online
                  </label>
                </div>
              </div>

              <div class="form-filter pull-right">
                <a ng-click="filter.resetFilters()" class="btn btn-clear btn-link pull-right">reset filters</a>
              </div>


            </div>

          </div>


          <div class="dcm-grid">

            <dcm-grid
              datasource="datasource.pageData"
              width="100%"
              active-row="serverGrid.activeServer"
              selected="serverGrid.selectedServers"
              sort-function="datasource.sortFunction"
              sort-order="datasource.sortOrder"
              edit-columns="serverGrid.cols"
              store-config="grid.testGridConfig"
              open-row="serverGrid.loadRow"
              reload-row="serverGrid.loadRow"
              reload-trigger="serverGrid.triggerReload"
              cache-opened-rows="true"
            >

              <dcm-grid-row ng-class="{muted: !isOnline}">
                <dcm-grid-column title="Status" width="10%">
                    <span class="{{iconColor}}"><i class="fa {{icon}}"></i></span>
                </dcm-grid-column>
                <dcm-grid-column width="20%" title="IP Address" enabled="false">{{ip}}</dcm-grid-column>
                <dcm-grid-column width="20%" title="Service Tag">{{serviceTag}} {{$row.active}}</dcm-grid-column>
                <dcm-grid-column width="30%" title="Model">{{model}}</dcm-grid-column>
                <dcm-grid-column width="20%" title="Memory" sort-type="integer" enabled="true">{{memory}}</dcm-grid-column>
              </dcm-grid-row>

              <dcm-grid-row-status>
                <i
                  class="fa"
                  ng-class="{
                    'fa-spinner fa-pulse': $row.dataLoading,
                    'fa-caret-down': !$row.dataLoading && $row.open,
                    'fa-caret-right': !$row.dataLoading && $row.closed
                  }"
                ></i>
              </dcm-grid-row-status>

              <dcm-grid-row-actions ng-class="{muted: !isOnline}">
                Extended info can go in here (transcluded in the context of the current row...)
              </dcm-grid-row-actions>

            </dcm-grid>

            <div class="clearfix"></div>

            <div class="pull-left pagination">

              <div class="pull-left">
                Page {{datasource.currentPage}} of {{datasource.pages}},
                Rows: {{datasource.viewData.length}}
                <span ng-if="serverGrid.selectedServers.length > 0">, Selected: {{serverGrid.selectedServers.length}}
              </div>

            </div>

            <ul class="pagination pull-right">
              <li ng-class="{disabled: datasource.pages == 0 || datasource.currentPage == 1}">
                  <a ng-click="datasource.setPage(1)">first</a>
              </li>

              <li ng-class="{disabled: datasource.pages == 0 || datasource.currentPage == 1}">
                  <a  ng-click="datasource.setPage(datasource.currentPage-1)">prev</a>
              </li>

              <li ng-class="{disabled: datasource.pages == 0 || datasource.currentPage == datasource.pages}">
                  <a ng-click="datasource.setPage(datasource.currentPage+1)">next</a>
              </li>

              <li ng-class="{disabled: datasource.pages == 0 || datasource.currentPage == datasource.pages}">
                  <a ng-click="datasource.setPage(datasource.pages)">last</a>
              </li>
            </ul>


          </div>

      </div>
    </file>
    <file name="app.js">
      angular.module('dcm-ui.grid')
        .controller('GridExampleCtrl', ['$scope', 'datasource', '$log', 'filters', '$q', '$timeout',
          function ($scope, datasource, $log, filters, $q, $timeout) {

            $scope.showConfig = false;


            $scope.randomReload = function() {
              var row = $scope.datasource.pageData[Math.floor(Math.random() * $scope.datasource.pageData.length)];
              $scope.serverGrid.triggerReload({'$$gridDataID': row.$$gridDataID});
            }

            $scope.toggleConfig = function() {
              $scope.showConfig = !$scope.showConfig;
            };

            // setup some dummy data...

            var servers = ['PowerEdge R320', 'PowerEdge R210 II', 'PowerEdge R420', 'PowerEdge R910', 'PowerEdge R720xd'];

            // convert servers to select2 format for filter
            var aServers = [];
            angular.forEach(servers, function(server){
              aServers.push({id: server, text: server });
            });

            var ram = [2, 4, 8, 16, 32, 64, 128];
            var genIP = function () {
              return '192.168.' +
                (Math.floor(Math.random() * 3) + 100) + '.' +
                Math.floor(Math.random() * 256);
            };
            var genServiceTag = function () {
              var i = 0, ret = '';
              for(; i < 8; i++) {
                ret += String.fromCharCode(65 + Math.floor(Math.random() * 8));
              }
              return ret;
            };

            var createRandomItem = function() {

              var isOnline = Math.random() > 0.1;

              var rowData = {
                ip: genIP(),
                isOnline: isOnline,
                icon: isOnline ? 'fa-check-circle' : 'fa-exclamation-circle',
                iconColor: isOnline ? 'success' : 'error',
                serviceTag: genServiceTag(),
                model: servers[ Math.floor(Math.random() * servers.length) ],
                memory: ram[ Math.floor(Math.random() * ram.length) ] + ' GB'
              };

              return rowData
            };

            // generates fake data
            var generateData = function() {

              var def = $q.defer();
              var pageNo = 1;

              var sendData = function() {

                var timeStart = (new Date()).getTime();

                var rawData = [];
                for (var j = 0; j < parseInt($scope.dsOpts.recordsPerIteration,10); j++) {
                  rawData.push(createRandomItem());
                }

                var genTime = (new Date()).getTime() - timeStart;
                $log.info('GRIDTEST: Generating data ' + genTime + 'ms');

                def.notify(rawData);

                if (pageNo++ < parseInt($scope.dsOpts.iterations,10)) {
                  $timeout(function(){
                    sendData();
                  }, 500 );
                } else {
                  def.resolve();
                }

              };

              $timeout(function(){
                sendData();
              }, 0 );

              return def.promise;
            };

            // end code for dummy data...





            // setup an empty filter object
            $scope.filter = filters.new($scope);

            // add filter for service tag
            $scope.filter.addTextSearchMatchFromStartFilter('serviceTag');

            // add filter for 'online status'
            $scope.filter.addDefaultValue('isOnline', false);
            $scope.filter.addFilterWhenValueIs('isOnline', true);

            // add filter for model
            $scope.filter.addDefaultValue('model', '');
            $scope.filter.addFilterExactMatch('model');
            $scope.filter.data.models = aServers;


            // configure datasource
            $scope.serverRequestOptions = {
              resource: 'fakeServers'
            };

            // grid config...
            $scope.serverGrid = {
              activeServer: undefined,
              selectedServers: [],
              loadRow: function(row) {
                var def = $q.defer();
                // wait 2 seconds then resolve promise with existing data
                $timeout(function(){
                  def.resolve(row);
                }, 2000);
                return def.promise;
              },
              triggerReload: angular.noop
            };

            // pagination options
            $scope.paginationOptions = {
              perPage: 10
            };


            // create data source
            $scope.dsOpts = {
              request: $scope.serverRequestOptions,
              filter: $scope.filter,
              recordsPerIteration: 80,
              iterations: 5,
              requestDataFunction: generateData,
              pagination: $scope.paginationOptions
            };


            $scope.datasource = datasource.create($scope, $scope.dsOpts);



        }]);
    </file>


    <file name="dcm-grid-from-scss.css">

      .dcm-grid {
        position: relative;
        margin: 0 0 20px 0;
      }

      .dcm-grid:before, .dcm-grid:after {
        content: " ";
        display: table;
      }

      .dcm-grid:after {
        clear: both;
      }

      .dcm-grid table.dcm-grid-table {
        table-layout: fixed;
        border-collapse: collapse;
        border-top: solid 1px #e4e4e4;
        clear: both;
      }

      .dcm-grid .dcm-grid-datastats {
        float: left;
        margin: 12px 0 18px 18px;
        padding: 5px 0 0 0;
      }

      .dcm-grid .pagination {
        float: right;
        margin-top: 10px;
      }

      .dcm-grid table.dcm-grid-table > thead > tr > th,
      .dcm-grid table.dcm-grid-table > tbody > tr > td {
        overflow: hidden;
        padding: 8px 12px;
        border-top: solid 1px white;
        border-bottom: solid 1px #e4e4e4;
        color: #8d8d8d;
        text-overflow: ellipsis;
        white-space: nowrap;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        text-shadow: white 0px 1px 0px;
      }

      .dcm-grid table.dcm-grid-table > tbody .tooltip {
        text-shadow: none;
      }

      .dcm-grid table.dcm-grid-table > thead > tr > th.resizable-column {
        border-right: solid 1px #fff;
        text-overflow: none;
        white-space: enabled;
      }

      .dcm-grid table.dcm-grid-table > thead > tr > th.resizable-column a:first-child {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .dcm-grid table.dcm-grid-table > thead > tr > th.resizable-column a.drag-handle:hover {
        background-color: #009ae2;
      }

      .dcm-grid table.dcm-grid-table > thead > tr > th.resizable-column.resizing {
        border-right-color: #e6e6e6;
      }

      .dcm-grid table.dcm-grid-table > thead > tr > th.resizable-column.resizing a.drag-handle {
        visibility: hidden;
      }

      .dcm-grid table.dcm-grid-table > tbody > tr {
        background-image: -webkit-linear-gradient(top, #f0f0f0 0%, #f8f8f8 100%);
        background-image: linear-gradient(to bottom, #f0f0f0 0%, #f8f8f8 100%);
        background-repeat: repeat-x;
        filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#FFF0F0F0', endColorstr='#FFF8F8F8', GradientType=0);
      }

      .dcm-grid table.dcm-grid-table > tbody > tr.muted {
        background: #fcfcfc;
      }

      .dcm-grid table.dcm-grid-table > tbody > tr.muted > td {
        opacity: 0.4;
        filter: alpha(opacity=40);
      }

      .dcm-grid table.dcm-grid-table > thead > tr {
        background: #e6e6e6;
      }

      .dcm-grid table.dcm-grid-table > thead > tr > th {
        color: #8d8d8d;
        font-weight: normal;
        white-space: nowrap;
      }

      .dcm-grid table.dcm-grid-table > thead > tr > th > a:first-child {
        display: inline;
        color: #737373;
      }

      .dcm-grid table.dcm-grid-table > thead > tr > th > a:first-child:hover {
        text-decoration: underline;
      }

      .dcm-grid table.dcm-grid-table > thead > tr > th > a.disabled i {
        display: none;
      }

      .dcm-grid table.dcm-grid-table > thead > tr > th > a.disabled {
        color: #999999;
        cursor: default;
      }

      .dcm-grid table.dcm-grid-table > thead > tr > th > a.disabled:hover {
        text-decoration: none;
      }

      .dcm-grid table.dcm-grid-table > thead > tr > th > a > i {
        margin: 0 0 0 2px;
      }

      .dcm-grid table.dcm-grid-table > tbody > tr > td.dcm-grid-selectable,
      .dcm-grid table.dcm-grid-table > thead > tr > th.dcm-grid-selectable {
        text-align: center;
        width: 36px;
      }

      .dcm-grid table.dcm-grid-table > tbody > tr > td.dcm-grid-selectable input[type="radio"],
      .dcm-grid table.dcm-grid-table > tbody > tr > td.dcm-grid-selectable input[type="checkbox"],
      .dcm-grid table.dcm-grid-table > thead > tr > th.dcm-grid-selectable input[type="radio"],
      .dcm-grid table.dcm-grid-table > thead > tr > th.dcm-grid-selectable input[type="checkbox"] {
        margin-top: 0;
      }

      .dcm-grid table.dcm-grid-table > tbody > tr {
        cursor: pointer;
      }

      .dcm-grid table.dcm-grid-table > tbody > tr.dcm-grid-details {
        cursor: auto;
      }

      .dcm-grid table.dcm-grid-table > tbody > tr.dcm-grid-details > td {
        -webkit-user-select: text;
        -moz-user-select: text;
        -ms-user-select: text;
        user-select: text;
      }

      .dcm-grid table.dcm-grid-table > tbody > tr.dcm-grid-details,
      .dcm-grid table.dcm-grid-table > tbody > tr.dcm-grid-details:hover,
      .dcm-grid table.dcm-grid-table > tbody > tr.active,
      .dcm-grid table.dcm-grid-table > tbody > tr.active:hover {
        background: #fff;
      }

      .dcm-grid table.dcm-grid-table > tbody > tr.active > td,
      .dcm-grid table.dcm-grid-table > tbody > tr.active:hover > td {
        color: #737373;
        border-collapse: collapse;
        border-bottom-color: #fff;
      }

      .dcm-grid table.dcm-grid-table > tbody > tr.dcm-grid-details > td {
        overflow: visible;
        padding-left: 12px;
        border-top: none;
        white-space: normal;
        color: #333333;
        text-shadow: none;
      }

      .dcm-grid table.dcm-grid-table > tbody .dcm-grid-rowactions {
        margin: 0;
      }

      .dcm-grid table.dcm-grid-table > tbody .dcm-grid-rowactions > div.btn-group > .btn:first-child:not(:last-child):not(.dropdown-toggle) {
        -webkit-border-radius: 3px;
        -moz-border-radius: 3px;
        -ms-border-radius: 3px;
        -o-border-radius: 3px;
        border-radius: 3px;
      }

      .dcm-grid table.dcm-grid-table > tbody .dcm-grid-rowinfo {
        padding-top: 8px;
        overflow-x: auto;
      }

      .dcm-grid table.dcm-grid-table > thead > tr > th.dcm-grid-activemarker,
      .dcm-grid table.dcm-grid-table > tbody > tr > td.dcm-grid-activemarker {
        padding: 0;
        width: 20px;
        text-align: right;
      }

      .dcm-grid table.dcm-grid-table > tbody > tr > td.dcm-grid-row-loader {
        text-align: center;
        vertical-align: middle;
        font-weight: heavy;
      }

      .dcm-grid table.dcm-grid-table > tbody > tr.dcm-grid-details > td.dcm-grid-activemarker,
      .dcm-grid table.dcm-grid-table > tbody > tr.active > td.dcm-grid-activemarker {
        border-left: solid 5px #009ae2;
      }

      .dcm-grid table.dcm-grid-table > tbody > tr:hover {
        background: #e9e9e9;
      }

      .dcm-grid table.dcm-grid-table > tbody > tr:hover > td {
        color: #737373;
      }

      .dcm-grid table.dcm-grid-table > tbody > tr.selected > td,
      .dcm-grid table.dcm-grid-table > tbody > tr.selected.active:hover > td {
        background: #ffffcc;
        color: #737373;
      }

      .dcm-grid table.dcm-grid-table > tbody > tr.selected.active > td {
        border-bottom-color: #ffffcc;
      }

      .dcm-grid table.dcm-grid-table > tbody > tr.dcm-grid-details.selected > td,
      .dcm-grid table.dcm-grid-table > tbody > tr.dcm-grid-details.selected:hover > td {
        border-bottom-color: #e4e4e4;
        color: #333333;
      }

      .dcm-grid table.dcm-grid-table > tbody > tr.dcm-grid-details:hover > td {
        border-bottom-color: #e4e4e4;
        color: #333333;
      }

      .dcm-grid div.resizable-columns-drag-box {
        border-right: 1px #009ae2 solid;
      }

    </file>

    <file name="dcm-grid.scss">

       // Default variables.

      $dcm-grid-baseColor:                 #F3F3F3 !default;
      $dcm-grid-fontColorDark:             darken($dcm-grid-baseColor, 50%) !default;
      $dcm-grid-fontColorLight:            darken($dcm-grid-baseColor, 40%) !default;
      $dcm-grid-selectedBackgroundColor:   #FFFFCC !default;
      $dcm-grid-activeColor:               lighten($esBaseBlue, 6%) !default;
      $dcm-grid-rowHoverColor:             darken($dcm-grid-baseColor, 4%) !default;
      $dcm-grid-rowHightlightColor:        #FFF !default;
      $dcm-grid-rowShadowColor:            darken($dcm-grid-baseColor, 6%) !default;
      $dcm-grid-rowGradientTop:            darken(#FFF, 6%) !default;
      $dcm-grid-rowGradientBottom:         lighten($dcm-grid-baseColor, 2%) !default;


       // Base grid styles.

      .dcm-grid {
        // Main setup.
        @include clearfix;
        position: relative;
        margin: 0 0 20px 0;

        // Make sure the core table works.
        table.dcm-grid-table {
          table-layout: fixed;
          border-collapse: collapse;
          border-top: solid 1px $dcm-grid-rowShadowColor;
          clear: both;  //for firefox
        }

        // Place our core grid components.


        // Pagination at the bottom
        .pagination { float: right; margin-top: 10px; }

        // Setup the main table styles.
        table.dcm-grid-table {
          > thead > tr > th,
          > tbody > tr > td {
            overflow: hidden;
            padding: 8px 12px;
            border-top: solid 1px $dcm-grid-rowHightlightColor;
            border-bottom: solid 1px $dcm-grid-rowShadowColor;
            color: $dcm-grid-fontColorLight;
            text-overflow: ellipsis;
            white-space: nowrap;
            @include user-select(none); // Stop accidental text highlight / select
            @include text-shadow(#ffffff 0px 1px 0px);
          }

          // Make sure tooltips don't pick up this shadow.
          > tbody .tooltip { @include text-shadow(none); }

          // For resizable headers, modify.
          > thead > tr > th.resizable-column {

            // Tweak the border to a like-able colour.
            border-right: solid 1px #fff;

            // Resizable headers should have their child a tags with an ellipses, not the th.
            text-overflow: none;
            white-space: enabled;

            a:first-child {
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            // We want our drag handle a dell blue.
            a.drag-handle:hover { background-color: $dcm-grid-activeColor; }
          }

          // While a header is resizing...
          > thead > tr > th.resizable-column.resizing {

            // don't show the border
            border-right-color: darken($dcm-grid-baseColor, 5%);

            // hide the drag handle
            a.drag-handle { visibility: hidden; }
          }


          // Default row styles.
          > tbody > tr {
            @include gradient-vertical($dcm-grid-rowGradientTop, $dcm-grid-rowGradientBottom);
          }

          // Muted row styles.
          > tbody > tr.muted {
            //@include opacity(0.8);
            background: darken(#FFF, 1%);
            > td {
              @include opacity(0.4);
            }
          }

          // The table header has some specific style requirements.
          > thead > tr { background: darken($dcm-grid-baseColor, 5%); }
          > thead > tr > th {
            color: $dcm-grid-fontColorLight;
            font-weight: normal;
            white-space: nowrap;
          }
          > thead > tr > th > a:first-child {
            display: inline;
            color: $dcm-grid-fontColorDark;
            //line-height: $base-line-height;
          }
          > thead > tr > th > a:first-child:hover { text-decoration: underline; }

          // Enable disabled support for the table header.
          > thead > tr > th > a.disabled i { display: none; }
          > thead > tr > th > a.disabled { color: $gray-light; cursor: default; }
          > thead > tr > th > a.disabled:hover { text-decoration: none; }

          // Align sort icons correctly.
          > thead > tr > th > a > i { margin: 0 0 0 2px; }

          // Selectable cells need specific changes.
          > tbody > tr > td.dcm-grid-selectable,
          > thead > tr > th.dcm-grid-selectable { text-align: center; width: 36px; }

          > tbody > tr > td.dcm-grid-selectable input[type="radio"],
          > tbody > tr > td.dcm-grid-selectable input[type="checkbox"],
          > thead > tr > th.dcm-grid-selectable input[type="radio"],
          > thead > tr > th.dcm-grid-selectable input[type="checkbox"] { margin-top: 0; }

          // Ensure we have pointers on all rows in the body with exceptions.
          > tbody > tr { cursor: pointer; }
          > tbody > tr.dcm-grid-details { cursor: auto; }

          // re-enable content selection for our grid details.
          > tbody > tr.dcm-grid-details > td { @include user-select(text); }

          // Our actions / info row needs some specific changes.
          > tbody .dcm-grid-rowinfo { padding-top: 8px; overflow-x: auto; }

          // Ensure the active row and its rowdetail are highlighted effectively.
          > thead > tr > th.dcm-grid-activemarker,
          > tbody > tr > td.dcm-grid-activemarker { padding: 0 0 0 12px; width: 30px; text-aign: right; }
          > tbody > tr.dcm-grid-details > td.dcm-grid-activemarker,
          > tbody > tr.active > td.dcm-grid-activemarker { border-left: solid 5px $dcm-grid-activeColor; }

          // Define our hover and active states.
          > tbody > tr:hover { background: $dcm-grid-rowHoverColor; }
          > tbody > tr:hover > td { color: $dcm-grid-fontColorDark; }
          > tbody > tr.selected > td,
          > tbody > tr.selected.active:hover > td { background: $dcm-grid-selectedBackgroundColor; color: $dcm-grid-fontColorDark; }
          > tbody > td.selected.active > td { border-bottom-color: $dcm-grid-activeColor; }

          > tbody > tr.dcm-grid-details.selected > td,
          > tbody > tr.dcm-grid-details.selected:hover > td { border-bottom-color: $dcm-grid-rowShadowColor; color: $text-color; }
          > tbody > tr.dcm-grid-details:hover > td { border-bottom-color: $dcm-grid-rowShadowColor; color: $text-color; }
        }

        // drag box
        div.resizable-columns-drag-box {
          border-right: 1px lighten($esBaseBlue, 6%) solid;
        }
      }

    </file>


  </example>
 */

angular.module('dcm-ui.grid', []);

'use strict';

angular.module('dcm-ui.grid')

  .controller('DCMGridCtrl', ['$scope', '$compile', '$log', '$interpolate', '$timeout', '$q',
    function($scope, $compile, $log, $interpolate, $timeout, $q) {

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
      var dataCellCount = 0;

      // add row attributes to row template
      ctrl.mergeAttributes(rowTemplate, ctrl.oRowAttributes);

      for (var colIndex = 0, colLength = ctrl.columns.length; colIndex < colLength; colIndex++) {
        // loop over cols, only add enabled ones
        tempCol = ctrl.columns[colIndex];
        if (tempCol.enabled) {

          dataCellCount++;

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
        var activeRow = angular.element('<td class="dcm-grid-activemarker"></td>');
        if (ctrl.bRowStatus) {
          activeRow.html(ctrl.rowStatusContent);
        }
        rowTemplate.prepend(activeRow);

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

        var newCell = angular.element('<td ng-click="" colspan="' + dataCellCount + '">').html(ctrl.rowActionContent);

        // add active marker if active is enabled
        if (ctrl.bEnableActive) {
          activeRowTemplate.append(angular.element('<td class="dcm-grid-activemarker"></td>'));
        }

        activeRowTemplate.append(newCell);

        // row selector
        if (ctrl.bEnableSelect) {
          activeRowTemplate.append(angular.element('<td></td>'));
        }


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
          if (ctrl.bRowActions) {
            record.scope.$row.open = false;
            record.scope.$row.closed = true;
          }
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

        // if the active row has row actions, render the template after it
        if (ctrl.bRowActions) {
          // compile the active row template with the rows scope then append to table
          var newRow = ctrl.activeRowTemplate(activeRecord.scope, angular.noop);
          // add selected class if this row is selected
          if (ctrl.bEnableSelect && ctrl.selectedPosition(activeRecord) !== -1) {
            newRow.addClass('selected');
          }
          ctrl.oRowActions = newRow;

          if (ctrl.rowOpener && !(ctrl.bRowLoaderRememberOpened && activeRecord.scope.$row.openCached)) {
            var dataPromise = ctrl.rowOpener(activeRecord.data);
            loadingDelay(activeRecord, dataPromise);
            $q.when(dataPromise).then(function(data){
              ctrl.updateRowData(activeRecord, data);
              if (ctrl.bRowLoaderRememberOpened) {
                activeRecord.scope.$row.openCached = true;
              }
              // check this still the active row befor making it "active"
              // active row may have changed while data was loading
              if ($scope.activeRow === activeRecord.data ) {
                activeRecord.row.addClass('active');
                activeRecord.scope.$row.open = true;
                activeRecord.scope.$row.closed = false;
                activeRecord.row.after(ctrl.oRowActions);
              }
            });

          } else {
            // append after the active row
            activeRecord.row.addClass('active');
            activeRecord.row.after(ctrl.oRowActions);
            activeRecord.scope.$row.open = true;
            activeRecord.scope.$row.closed = false;
          }

        } else {
          // add active class to this row (it doesn't have row actions)
          activeRecord.row.addClass('active');
        }

      } else {

        ctrl.removeActiveRow();

      }

    };


    ctrl.updateRowData = function(record, data) {

      // update in datasource
      angular.extend(record.data, data);
      // update in row scope
      angular.extend(record.scope, data);
    };

    var loadingDelay = function(rowRecord, promise) {

      rowRecord.row.addClass('data-loading');

      rowRecord.scope.$row.dataLoading = true;

      var loadingShow = $timeout(function(){
        rowRecord.scope.$row.showLoading = true;
        rowRecord.row.addClass('show-loading');
      }, ctrl.rowLoadingDelay);

      $q.when(promise).finally(function(){
        $timeout.cancel(loadingShow);
        rowRecord.row.removeClass('data-loading');
        rowRecord.row.removeClass('show-loading');
        rowRecord.scope.$row.dataLoading = false;
        rowRecord.scope.$row.showLoading = false;
      });

    };


    // newData is optional, if not provided ctrl.reloadRow will be used
    ctrl.reloadTrigger = function(findRow, newData) {

      var thisRow = _.findWhere(ctrl.aRows, findRow);


      // if it's not visible anymore then it won't have been found
      if (thisRow) {
        var rowRecord = ctrl.getGridData(thisRow);

        var dataPromise = newData || ctrl.reloadRow(rowRecord.data);

        loadingDelay(rowRecord, dataPromise);

        $q.when(dataPromise).then(function(data){
          ctrl.updateRowData(rowRecord, data);
          rowRecord.scope.$row.openCached = false;
          // if this row is currently open then we need to reload the extra data
          // this will close it while extra data loads
          if (rowRecord.scope.$row.open) {
            ctrl.setActiveRow(rowRecord.data);
          }

        });



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

    });

  }]);

'use strict';

/**

 * @ngdoc directive
 * @name dcmGridColumn
 * @module dcm-ui.grid
 * @restrict E
 *
 * @description
 * Creates a grid column. The contents of this tag will be compiled. Any attributes
 * that aren't params will be duplicated onto this cell in each row.
 *
 * @usage
 * ```html
 * <dcm-grid-column foo="bar">{{someField}}</dcm-grid-column>
 * ```
 *
 * @param {string} title - title for the col header
 * @param {string=} field - a field from the row data to either use as the sort value.
 If no content is provided to this element this field will be interpolated into this col in the grid.
 * @param {string=} width - if specified will be put into a style="width: ;" on the col
 * @param {string=} sort-type - if sorting on the grid is enabled this allows you to
 override the default sorting type for this col
 * @param {string=} [sort-default=ASC] - makes this col the default sort for the grid, may be ASC
 or DESC
 *
 */

angular.module('dcm-ui.grid')
  .directive('dcmGridColumn', [function () {
    return {
      require: '^dcmGrid',
      restrict: 'E',
      scope: {
        field:'@',
        title:'@',
        width:'@',
        enabled: '@',
        sortType: '@',
        sortDefault: '@',
        resizable: '@'
      },
      compile: function(tElement, tAttrs) {

        var content = $.trim(tElement.html());

        return function(scope, element, attrs, dcmGridCtrl) {

          // copy over any attributes that aren't in our scope
          var attributes = {};
          angular.forEach(attrs, function(obj, key){
            if (key[0] !== '$' && scope[key] === undefined && obj !== '') {
              attributes[key.replace(/([A-Z])/g,'-$1').toLowerCase()] = obj;
            }
          });

          var col = {
            content: content,
            attributes: attributes,
            enabled: attrs.enabled !== undefined ? (attrs.enabled.toLowerCase() !== 'false') : true,
            title: scope.title,
            width: scope.width,
            resizable: attrs.resizable !== undefined ? (attrs.resizable.toLowerCase() !== 'false') : true,
            field: attrs.field,
            sortType: scope.sortType || '',
            sortDefault: attrs.sortDefault !== undefined ? attrs.sortDefault || 'ASC' : false
          };

          // if no field is specified try and infer it from the content
          if (!attrs.field || attrs.field === '') {
            var aField = content.match(/^\s*{{\s*(\S+)\s*}}\s*$/);
            if (aField) {
              col.field = aField[1];
            }
          }

          // if no title was specified try and infer it from the field being used
          if (tAttrs.title === undefined && (col.field && col.field !== '')) {
            col.title = col.field[0].toUpperCase() + col.field.slice(1);
          }

          dcmGridCtrl.addColumn(col);

        };
      }
    };
  }]);

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

              // if this row does not have a record setup
              // create a new record for it
              if (!record) {

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

'use strict';

/**
 * @ngdoc directive
 * @name dcmGridRowActions
 * @module dcm-ui.grid
 * @restrict E
 *
 * @description
 * The contents of this element is transcluded into the row under the active grid
 row (spanning all the cols). The parent dcm-grid thus must have the active-row attribute
 specified. Also the data from the row is transcluded into the scope of this row.
 * Because this is transcluded/compiled it may contain additional angular elements.
 *
 * @usage
 * ```html
 *  <dcm-grid-row-actions>{{really_long_description_field_in_row_data}}</dcm-grid-row-actions>
 * ```
 *
 */

angular.module('dcm-ui.grid')
  .directive('dcmGridRowActions', [function () {
    return {
      require: '^dcmGrid',
      restrict: 'E',
      scope: false,
      compile: function(tElement) {

        return function(scope, element, attrs, dcmGridCtrl) {

          dcmGridCtrl.rowActionContent = $.trim(tElement.html());
          dcmGridCtrl.bRowActions = true;

          // copy over any attributes that aren't in our scope
          var attributes = {};
          angular.forEach(attrs, function(obj, key){
            if (key[0] !== '$' && scope[key] === undefined && obj !== '') {
              attributes[key.replace(/([A-Z])/g,'-$1').toLowerCase()] = obj;
            }
          });

          dcmGridCtrl.addRowActionsAttributes(attributes);

        };

      }
    };
  }]);

'use strict';

/**
 * @ngdoc directive
 * @name dcmGridRow
 * @module dcm-ui.grid
 * @restrict E
 *
 * @description
 * Allows attributes for each grid row (in tbody) to be passed to the grid
 *
 * @usage
 * ```html
 *  <dcm-grid-row foo="bar">...</dcm-grid-row>
 * ```
 *
 */

angular.module('dcm-ui.grid')
  .directive('dcmGridRow', [function () {
    return {
      require: '^dcmGrid',
      restrict: 'E',
      scope: false,
      compile: function() {

        return function(scope, element, attrs, dcmGridCtrl) {

          // copy over any attributes that aren't in our scope
          var attributes = {};
          angular.forEach(attrs, function(obj, key){
            if (key[0] !== '$' && scope[key] === undefined && obj !== '') {
              attributes[key.replace(/([A-Z])/g,'-$1').toLowerCase()] = obj;
            }
          });

          dcmGridCtrl.addRowAttributes(attributes);

        };
      }
    };
  }]);

'use strict';

/**
 * @ngdoc directive
 * @name dcmGridRowStatus
 * @module dcm-ui.grid
 * @restrict E
 *
 * @description
 * The contents of this element are placed into the grid status cell (first cell)
 * in the row's scope you can use $row.active, $row.dataLoading and $row.showLoading
 *
 * @usage
 * ```html
 *  <dcm-grid-row-status> [state indicator here] </dcm-grid-row-status>
 * ```
 *
 */

angular.module('dcm-ui.grid')
  .directive('dcmGridRowStatus', [function () {
    return {
      require: '^dcmGrid',
      restrict: 'E',
      scope: false,
      compile: function(tElement) {

        return function(scope, element, attrs, ctrl) {

          ctrl.bRowStatus = true;
          ctrl.rowStatusContent = $.trim(tElement.html());

        };

      }
    };
  }]);

'use strict';

/**
 * @ngdoc service
 * @name datasource
 * @module dcm-ui.grid
 *
 * @description
 * Factory that creates datasources
 *
 */


angular.module('dcm-ui.grid')
  .factory('datasource', ['$timeout', '$q', '$log', '$http',
    function($timeout, $q, $log, $http) {
    // Service logic
    // ...


    var _public = {



        /**
         * @ngdoc method
         * @name datasource#create
         *
         * @description
         * creates a new datasource and returns it
         *
         * @param {object} dsScope - scope that the datasource will bind to
         * @param {object} options - options for configuring the datasource
         * @returns {object} Datasource object
         */

      create: function(dsScope, options) {

        var filterFunction, unwatchFilter,
          unwatchValidFilter, unwatchRequestParams, unwatchPaginationParams,
          requestOptions, cancelRequest, paginationOptions,
          pageBegin, pageEnd, sortFunction, processingNewData;

        var applyFilterPromise = null;

        var requestDefaults = {
          type: 'get'
        };

        var paginationDefaults = {
          perPage: 5
        };

        // add defaults into options if not provided

        if (!options.hasOwnProperty('autoLoad')) {
          options.autoLoad = true;
        }


        // default request data function to use $http
        // for default async it expects a return with a
        // complete node to tell if request is complete
        // it also expects a token node to append to request params
        // finally it expects the actual data to be in a data node

        // i.e returned data {data: [1,2,3], complete: false, token: 'xyz'}

        // will continue poling until complete is true


        var requestRow = options.requestRowFunction || _.identity;

        if (!options.hasOwnProperty('requestDataFunction')) {
          options.requestDataFunction = function(options){


            var dataprovider = $q.defer();

            var load = function() {
              $http(options).then(function(result){
                var data = result.data;
                if (data.hasOwnProperty('data')) {
                  dataprovider.notify(data.data);
                } else {
                  dataprovider.notify(data);
                }
                if (data.complete || !data.hasOwnProperty('complete')) {
                  dataprovider.resolve();
                } else if (data.hasOwnProperty('complete') && data.token) {

                  // incomplete async request
                  // make sure token is appended
                  if (!options.hasOwnProperty('params')) {
                    options.params = {};
                  }
                  options.params.token = data.token;

                  // wait 250ms before attempting to load more data
                  $timeout(function(){
                    load();
                  },250);
                }

              }, dataprovider.reject);

            };

            load();

            return dataprovider.promise;

          };
        }

        // setup sorting (also applied as deltas arrive)

        var sortData = function() {

          if (sortFunction && datasource.data.length) {

            datasource.bFiltering = true;

            var start = new Date();

            // if we are reversing the order, switch back for the sort
            if (datasource.sortOrder !== 'ASC') {
              datasource.data.reverse();
            }

            datasource.data = _.sortBy(datasource.data, sortFunction);

             // if we are reversing the order, reapply the reverse
            if (datasource.sortOrder !== 'ASC') {
              datasource.data.reverse();
            }

            var time = new Date() - start;
            $log.info('DATASOURCE: Sort ' + time + 'ms');

            if (!datasource.bPaused) {

              applyFilter();

            } else {

              // if data loading is paused we need to sort the already loaded data
              // then update pagination

              // if we are reversing the order, switch back for the sort
              if (datasource.sortOrder !== 'ASC') {
                datasource.viewData.reverse();
              }

              datasource.viewData = _.sortBy(datasource.viewData, sortFunction);

              // if we are reversing the order, reapply the reverse
              if (datasource.sortOrder !== 'ASC') {
                datasource.viewData.reverse();
              }

              applyPagination();
              datasource.bFiltering = false;
            }
          }

        };


        dsScope.$watch(function(){ return datasource.sortFunction; }, function(newSort) {
          sortFunction = newSort;
          sortData();
        });




        // watch the sort order
        var lastSortFn;

        dsScope.$watch(function(){ return datasource.sortOrder; }, function(newOrder){

          if (newOrder === 'DESC' || (lastSortFn && lastSortFn === sortFunction)) {

            datasource.data.reverse();
            datasource.viewData.reverse();
            applyPagination();
            datasource.bFiltering = false;

          }

          lastSortFn = sortFunction;

        });


        if (options.hasOwnProperty('pagination')) {
          // remove from request options
          paginationOptions = angular.extend({}, paginationDefaults,options.pagination );

          unwatchPaginationParams = dsScope.$watchCollection(function(){return options.pagination;}, function(newVal){
            // using replace instead of extend so we can delete props if required
            paginationOptions = angular.extend(paginationOptions, newVal);
            applyPagination();
          });

        }

        // watch option/params fields
        dsScope.$watchCollection(function(){ return options.request; }, function(newVal){

          // unbind param watcher if it exists
          if (unwatchRequestParams) { unwatchRequestParams(); }

          // setup new options
          requestOptions = angular.extend({}, requestDefaults, newVal);

          // watch the params if they exist
          if (requestOptions.hasOwnProperty('params')) {
            unwatchRequestParams = dsScope.$watchCollection(function(){ return  options.request.params; }, function(newVal){

              // using replace instead of extend so we can delete props if required
              requestOptions.params = newVal;
              if (datasource.bOptionsValid) {
                if (options.autoLoad) {
                  requestData();
                }
              }
            });
          }

          // only want to
          if (datasource.bOptionsValid && options.autoLoad) {
            requestData();
          }


        });


        // if our scope is destroyed cancel any outstanding requests
        dsScope.$on('$destroy', function(){
          if (cancelRequest) {
            cancelRequest.resolve();
          }
        });




        // debounce, in case something trigger multiple changes
        // this could happen if filter data changes and validation becomes valid
        // at the same time


        var requestData =  _.debounce( function(){

          $log.info('DATASOURCE: Starting new data load');

          $timeout(function(){


            if (datasource.bOptionsValid && datasource.bFilterValid) {

              if (datasource.bLoading) {
                if (angular.equals(datasource.currentRequestOptions, requestOptions)) {
                  // duplicate request, allow first to complete
                  return;
                }
                cancelRequest.resolve();
              }

              processingNewData = true;

              datasource.bLoading = true;
              datasource.data = [];
              datasource.pageData = [];
              datasource.viewData = [];
              datasource.pages = 0;

              cancelRequest = $q.defer();

              requestOptions.timeout = cancelRequest.promise;
              datasource.currentRequestOptions = angular.copy(requestOptions);

              var bSkipped = true;

              var prevProcessDataTime = 0;
              var prevProcessStartTime = 0;

              var preRequestTime = new Date();

              datasource.dataLoadingPromise =  options.requestDataFunction(requestOptions);

              datasource.dataLoadingPromise.then(function(){

                datasource.bLoading = false;

                // apply sort/filter/page in case sorting was skipped or in event data was returned
                // without any notify events

                if (bSkipped) {
                  if (sortFunction) {
                    sortData();
                  } else {
                    datasource.bFiltering = true;
                    applyFilter();
                  }
                }

                // wait for any currently processing filter to complete before continuing
                $q.when(applyFilterPromise).then(function(){

                  var time = new Date() - preRequestTime;
                  $log.info('DATASOURCE: Complete loading time: ' + time + 'ms');

                  processingNewData = false;

                  // execute onLoadComplete method on next digest cycle if it exists
                  // this will give grid time to render or in other uses make sure any
                  // other prereq code has run first
                  if (options.hasOwnProperty('onLoadComplete')) {
                    var start = new Date();
                    $timeout(function(){
                      options.onLoadComplete();
                      var time = new Date() - start;
                      $log.info('DATASOURCE: Load complete function: ' + time + 'ms');
                    },0);
                  }

                });

              }, function(){

                $log.warn('DATASOURCE: Request cancelled');
                datasource.bLoading = false;
                datasource.bFiltering = false;
                processingNewData = false;

              }, function(result){
                // notified of new data arriving...
                var start = new Date();

                // previously inserted at correct position instead of resorting
                // this appears to be slower than resorting with large data sets.

                // if (sortFunction) {

                //   // if we are reversing the order, switch back for the sort
                //   if (datasource.sortOrder !== 'ASC') {
                //     datasource.data.reverse();
                //   }

                //   // sort function is provided, use it to insert each item from the delta into the correct position
                //   for (var row, pos, rowIndex = 0, end = result.length; rowIndex < end; rowIndex++) {
                //     row = result[rowIndex];
                //     pos = _.sortedIndex(datasource.data, row, sortFunction);
                //     datasource.data.splice(pos,0,row);
                //   }

                //   // if we are reversing the order, switch back for the sort
                //   if (datasource.sortOrder !== 'ASC') {
                //     datasource.data.reverse();
                //   }

                // }


                datasource.data.push.apply(datasource.data,result);

                var time = new Date() - start;
                $log.info('DATASOURCE: Loading new data: ' + time + 'ms');

                // if previousProcess time was > 1s then skip processing
                if (prevProcessDataTime < 1000) {

                  if (sortFunction) {
                    sortData();
                  } else {
                    datasource.bFiltering = true;
                    applyFilter();
                  }

                  bSkipped = false;
                  prevProcessStartTime = start;
                  prevProcessDataTime = new Date() - start;

                } else {

                  bSkipped = true;

                  $log.info('DATASOURCE: skipping sort/filter due to previous process time');
                  // subtract load time from prev process time
                  prevProcessDataTime -= (new Date() - prevProcessStartTime);
                }

                prevProcessStartTime = start;

              });

            }
          }, 0);

        }, 100);



        // if the request valid expersion is provied, then watch it and update status as it changes
        if(options.hasOwnProperty('requestValid') && options.requestValid) {
          dsScope.$watch(options.requestValid, function(newVal){
            datasource.bOptionsValid = !!newVal;
            // if this has become valid then we should request new data
            if (datasource.bOptionsValid && options.autoLoad) {
              requestData();
            }
          });
        }


        // apply filter to create the view data
        var applyFilterTimeoutPromise = null;
        var applyFilterTimeoutDefer = null;

        var applyFilter = function() {

          if (applyFilterTimeoutDefer) {
            $timeout.cancel(applyFilterTimeoutPromise);
          } else {
            applyFilterTimeoutDefer = $q.defer();
          }

          // timeout will cause this to be "applied" during the next digest
          // needed due to _.debounce causing us to be out of digest cycle
          // we will cancel and recreate this timeout each time this is called
          // before the previous timeout expired

          applyFilterPromise = applyFilterTimeoutDefer.promise;

          applyFilterTimeoutPromise = $timeout(function(){

            var row, end, rowIndex = 0, newViewData = [];

            if (!datasource.bPaused) {

              var start = new Date();

              if (filterFunction) {

                for (end = datasource.data.length; rowIndex < end; rowIndex++) {
                  row = datasource.data[rowIndex];
                  if (filterFunction(row)) {
                    newViewData.push(row);
                  }
                }
                datasource.viewData = newViewData;

              } else {

                // we need to copy the array to prevent master data order being modified
                datasource.viewData = datasource.data.slice(0);

              }

              // apply the paged view (if configured)
              applyPagination();

              datasource.bFiltering = false;

              var time = new Date() - start;
              $log.info('DATASOURCE: Filter ' + time + 'ms');

            } else {

              if(filterFunction) {
                //  if paused we can only filter existing view data, not any new data

                for (end = datasource.viewData.length; rowIndex < end; rowIndex++) {
                  row = datasource.viewData[rowIndex];
                  if (filterFunction(row)) {
                    newViewData.push(row);
                  }
                }
                datasource.viewData = newViewData;
              }

            }

            applyFilterTimeoutDefer.resolve();
            applyFilterTimeoutDefer = null;

          }, 100); // end of timeout

          return applyFilterPromise;

        };


        var applyPagination = function() {

          // apply the pagination if requested.
          if (paginationOptions) {

            // dropdown will turn this into a string, fix it here...

            paginationOptions.perPage = parseInt(paginationOptions.perPage,10);

            if (!paginationOptions.perPage || paginationOptions.perPage <= 0) {
              paginationOptions.perPage = paginationDefaults.perPage;
            }

            datasource.pages = Math.ceil(datasource.viewData.length / paginationOptions.perPage);

            // make sure current page is in bounds
            datasource.currentPage = Math.min(datasource.currentPage, datasource.pages);


            // if page is set to 0 or less, and there is a page, fix it...
            if (datasource.currentPage <= 0) {
              datasource.currentPage = Math.min(1, datasource.pages);
            }

            pageBegin = paginationOptions.perPage * (datasource.currentPage - 1);

            pageEnd = Math.min(pageBegin + paginationOptions.perPage, datasource.viewData.length);

            datasource.pageData = datasource.viewData.slice(pageBegin, pageEnd);

          } else {

            // no pagination.
            // set page data to view data
            // and one or zero pages depending on if there are any records
            datasource.pageData = datasource.viewData;

            if (datasource.viewData.length) {
              datasource.pages = 1;
              datasource.currentPage = 1;
            } else {
              datasource.pages = 0;
              datasource.currentPage = 0;
            }

          }

        };


        var datasource = {

          bLoading: false,
          dataLoadingPromise: undefined,
          bFiltering: false,
          bFilterValid: true,
          bOptionsValid: true,
          bPaused: false,

          initialRequestOptions: options.request,
          currentRequestOptions: {},

          currentPage: 0,

          data: [],

          viewData: [],

          pageData: [],

          pages: 0,

          sortFunction: null,
          sortOrder: 'ASC',

          setPage: function(page) {
            datasource.currentPage = page;
            applyPagination();
          },

          loadData: function() {
            datasource.bPaused = false;
            requestData();
          },


          // newData is optional, if not passed match will be passed to the requestRow
          // function to get the data
          triggerRowReload: function(match, newData) {
            // resolve this promise with the new data
            var reloadPromise = $q.defer();

            // make sure the grid actually has data (in case auto load is disabled)
            if (datasource.dataLoadingPromise) {
              // make sure initial data is loaded before starting update/add
              datasource.dataLoadingPromise.then(function(){

                var newDataPromise = newData || requestRow(match);

                // load the new data
                $q.when(newDataPromise).then(function(data){

                  // if there is a record for this row update it, otherwise this is a new row!
                  var rowRecord = _.findWhere(datasource.data, match);
                  if (rowRecord) {
                    // if the data is null then remove the matching row
                    if (data) {
                      angular.extend(rowRecord, data);
                      $log.info('DATASOURCE: updating existing row', rowRecord);
                    } else {
                      $log.info('DATASOURCE: removing existing row', rowRecord);
                      datasource.data.splice(datasource.data.indexOf(rowRecord), 1);
                    }
                  } else {
                    // if we actually have data (i.e it isn't something that was
                    // deleted before it existed) add it to the data
                    if (data) {
                      $log.info('DATASOURCE: adding new row', data);
                      datasource.data.push(data);
                    }
                  }
                  // resort/paginate the data
                  sortData();
                  reloadPromise.resolve(data);

                }, reloadPromise.reject);

              });
            }

            return reloadPromise.promise;
          },

          cancelRequest: function() {
            if (cancelRequest) {
              cancelRequest.resolve();
            }
          },

          pause: function() {
            datasource.bPaused = true;
            datasource.bFiltering = false;
          },

          resume: function() {
            datasource.bPaused = false;
            datasource.bFiltering = true;
            applyFilter();
          }

        };



        // setup filtering
        if (options.hasOwnProperty('filter')) {

          // set the private vars to these values
          filterFunction = options.filter.filterFunction;

          // setup watcher on the valid expression
          // needs to happen before the watch on the filter collection
          if (options.hasOwnProperty('filterValid')) {
            unwatchValidFilter = dsScope.$watch(options.filterValid, function(newVal){
              datasource.bFilterValid = !!newVal;
              if(!datasource.bLoading && datasource.bFilterValid) {
                datasource.bFiltering = true;
                applyFilter();
              }
            });
          }

          // setup a watcher on the filter fields to invoke appyFilter on a change
          // if a valid expression is provided, check it is valid before applying filter
          unwatchFilter = dsScope.$watchCollection(function(){return options.filter.values;}, function(){
            if (datasource.bFilterValid) {
              datasource.bFiltering = true;
              applyFilter();
            }
          });

        }

        return datasource;
      }

    };

    // Public API here
    return _public;

  }]);

'use strict';

/**
 * @ngdoc service
 * @name filters
 * @module dcm-ui.grid
 *
 * @description
 * Factory that creates and configures filters for a datasource
 *
 */

angular.module('dcm-ui.grid')
  .factory('filters', ['$interpolate', function($interpolate) {
    // Service logic
    // ...

    var valueOrEmptyString = function(val) {
      if (val === undefined) {
        return '';
      } else {
        return val;
      }
    };


    // combine + dedupe fields to search
    var combineFields = function(additionalFields, idField) {

      var oFields = {};
      var aRet = [];

      // add idfeild to returned fields
      oFields[idField] = true;

      // add any additional fields
      if (additionalFields && angular.isArray(additionalFields) && additionalFields.length) {
        for (var i = 0; i < additionalFields.length; i++) {
          oFields[additionalFields[i]] = true;
        }
      }

      for (var field in oFields) {
        aRet.push(field);
      }

      return aRet;

    };




    var _public = {



      /**
       * @ngdoc method
       * @name filters#new
       *
       * @description
       * creates a new filter object and returns it
       *
       * @param {object} scope - scope that the datasource and filter will be bound to
       * @returns {object} Filter object
       */

      new: function(scope) {

        var filter = {
          data: {},
          defaultValues: {},
          defaultParams: {},
          values: {},
          requestParams: {},
          filterFunctions: []
        };

        filter.resetFilters = function(){
          angular.extend(filter.values, filter.defaultValues);
          angular.extend(filter.requestParams, filter.defaultParams);
        };

        filter.addDefaultValue = function(field, value) {
          filter.defaultValues[field] = valueOrEmptyString(value);
          filter.values[field] = filter.defaultValues[field];
        };

        filter.addDefaultParam = function(field, value) {
          filter.defaultParams[field] = valueOrEmptyString(value);
          filter.requestParams[field] = filter.defaultParams[field];
        };

        filter.onChange = function(type, field, fn) {
          scope.$watch(function(){ return filter[type][field]; }, fn);
        };

        filter.onCollectionChange = function(type, field, fn) {
          scope.$watchCollection(function(){ return filter[type][field]; }, fn);
        };

        filter.addFilterExactMatchObject = function(idField, matchObject) {

          filter.filterFunctions.push(
            function(oFilterData, oRowData) {

              if (filter.data[matchObject]) {
                if (!filter.data[matchObject][oRowData[idField]]) {
                  return false;
                }
              }

              return true;
            }

          );

        };


        filter.addFilterInteger = function(idField, compareType) {

          var comparator;

          switch(compareType) {

          case 'lt':
            comparator = function(a, b) { return a < b; };
            break;

          case 'gt':
            comparator = function(a, b) { return a > b; };
            break;

          case 'eq':
            comparator = function(a, b) { return a === b; };
            break;

          }

          filter.filterFunctions.push(
            function(oFilterData, oRowData) {
              if (oFilterData[idField] !== '') {
                if (!comparator(parseInt(oRowData[idField],10), parseInt(oFilterData[idField],10)) ) {
                  return false;
                }
              }
              return true;
            }
          );

        };

        filter.addFilterExactMatch = function(idField, interpolationStringOrAdditionalFields) {
          var comparator = function(searchString, queryString) {
            if (searchString && searchString.toString().toLowerCase() === queryString.toString().toLowerCase()) {
              return true;
            } else {
              return false;
            }
          };
          filter.addFilterWithComparator(comparator, idField, interpolationStringOrAdditionalFields);
        };

        filter.addFilterPartialMatch = function(idField, interpolationStringOrAdditionalFields) {
          var comparator = function(searchString, queryString) {
            if (searchString && searchString.toString().toLowerCase().indexOf(queryString.toString().toLowerCase()) !== -1) {
              return true;
            } else {
              return false;
            }
          };
          filter.addFilterWithComparator(comparator, idField, interpolationStringOrAdditionalFields);
        };

        filter.addFilterPartialMatchFromStart = function(idField, interpolationStringOrAdditionalFields) {
          var comparator = function(searchString, queryString) {
            if (searchString && searchString.toString().toLowerCase().indexOf(queryString.toString().toLowerCase()) === 0) {
              return true;
            } else {
              return false;
            }
          };
          filter.addFilterWithComparator(comparator, idField, interpolationStringOrAdditionalFields);
        };

        // can only have interpolation string or additional search fields
        filter.addFilterWithComparator = function(comparator, idField, interpolationStringOrAdditionalFields) {

          var interpolate, searchFields;

          // interpolation string provided
          if (interpolationStringOrAdditionalFields && !angular.isArray(interpolationStringOrAdditionalFields)) {

            interpolate = $interpolate(interpolationStringOrAdditionalFields);

          // just a regular field search (possibly with extra fields to check)
          } else {

            searchFields = combineFields(interpolationStringOrAdditionalFields, idField);

          }


          filter.filterFunctions.push(
            function(oFilterData, oRowData) {
              // check they have entered search text
              if (oFilterData[idField] !== '') {

                var queryString = oFilterData[idField];
                var searchField;

                // search interpolated string
                if (interpolate){

                  searchField = interpolate(oRowData);
                  if (comparator(searchField, queryString)) {
                    return true;
                  }

                // otherwise search the search fields
                } else {
                  for (var i=0; i < searchFields.length; i++) {
                    searchField = oRowData[searchFields[i]];
                    if (comparator(searchField, queryString)) {
                      return true;
                    }
                  }
                }
                return false;

              }
              return true;
            }
          );

        };


        // filter when value field matches the required value (for checkboxes)
        filter.addFilterWhenValueIs = function(field, requiredValue) {
          requiredValue = requiredValue.toString();
          filter.filterFunctions.push(
            function(oFilterData, oRowData) {
              if (oFilterData[field] && oFilterData[field].toString() === requiredValue) {
                if (oRowData[field].toString() !== requiredValue) {
                  return false;
                }
              }
              return true;
            }
          );

        };


        filter.setData = function(field, data) {
          filter.data[field] = data;
        };

        filter.filterFunction = function(oRowData) {
          var bDisplay = true;
          var values = angular.extend({}, filter.requestParams, filter.values);
          for (var i=0, len = filter.filterFunctions.length; i < len; i++) {
            if (bDisplay) {
              bDisplay = filter.filterFunctions[i](values, oRowData);
            } else {
              return bDisplay;
            }
          }
          return bDisplay;
        };

        filter.addStandardTextSearchFilter = function(field, interpolationStringOrAdditionalFields) {
          filter.addDefaultValue(field, '');
          filter.addFilterPartialMatch(field, interpolationStringOrAdditionalFields);
        };

        filter.addExactTextSearchFilter = function(field, interpolationStringOrAdditionalFields) {
          filter.addDefaultValue(field, '');
          filter.addFilterExactMatch(field, interpolationStringOrAdditionalFields);
        };

        filter.addTextSearchMatchFromStartFilter = function(field, interpolationStringOrAdditionalFields) {
          filter.addDefaultValue(field, '');
          filter.addFilterPartialMatchFromStart(field, interpolationStringOrAdditionalFields);
        };

        return filter;

      }


    };



    // Public API here
    return _public;

  }]);
