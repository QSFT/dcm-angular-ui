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
            >

              <dcm-grid-row ng-class="{muted: !isOnline}">
                <dcm-grid-column title="Status" width="10%">
                    <span class="{{iconColor}}"><i class="fa {{icon}}"></i></span>
                </dcm-grid-column>
                <dcm-grid-column width="20%" title="IP Address" enabled="false">{{ip}}</dcm-grid-column>
                <dcm-grid-column width="20%" title="Service Tag">{{serviceTag}}</dcm-grid-column>
                <dcm-grid-column width="30%" title="Model">{{model}}</dcm-grid-column>
                <dcm-grid-column width="20%" title="Memory" sort-type="integer" enabled="true">{{memory}}</dcm-grid-column>
              </dcm-grid-row>

              <dcm-grid-row-actions ng-class="{muted: !isOnline}">
                  We can include additional controls here for when a row is "active" (they are transcluded in the context of this row)
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

            $scope.toggleConfig = function() {
              $scope.showConfig = !$scope.showConfig;
            }

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

              return{
                ip: genIP(),
                isOnline: isOnline,
                icon: isOnline ? 'fa-check-circle' : 'fa-exclamation-circle',
                iconColor: isOnline ? 'success' : 'error',
                serviceTag: genServiceTag(),
                model: servers[ Math.floor(Math.random() * servers.length) ],
                memory: ram[ Math.floor(Math.random() * ram.length) ] + ' GB'
              };
            };

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
              selectedServers: []
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
        border-collapse: separate;
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
        width: 3px;
      }

      .dcm-grid table.dcm-grid-table > tbody > tr.dcm-grid-details > td.dcm-grid-activemarker,
      .dcm-grid table.dcm-grid-table > tbody > tr.active > td.dcm-grid-activemarker {
        background-color: #009ae2;
        border-bottom-color: #009ae2;
        border-top-color: #009ae2;
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
        border-bottom-color: #ffffcc;
      }

      .dcm-grid table.dcm-grid-table > tbody > tr.selected.active:hover > td.dcm-grid-activemarker {
        background-color: #009ae2;
        border-bottom-color: #009ae2;
      }

      .dcm-grid table.dcm-grid-table > tbody > tr.dcm-grid-details.selected > td.dcm-grid-activemarker {
        border-bottom-color: #009ae2;
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
          border-collapse: separate;
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
          > tbody > tr > td.dcm-grid-activemarker { padding: 0; width: 3px; }
          > tbody > tr.dcm-grid-details > td.dcm-grid-activemarker,
          > tbody > tr.active > td.dcm-grid-activemarker { background-color: $dcm-grid-activeColor; border-bottom-color: $dcm-grid-activeColor; border-top-color: $dcm-grid-activeColor; }

          // Define our hover and active states.
          > tbody > tr:hover { background: $dcm-grid-rowHoverColor; }
          > tbody > tr:hover > td { color: $dcm-grid-fontColorDark; }
          > tbody > tr.selected > td,
          > tbody > tr.selected.active:hover > td { background: $dcm-grid-selectedBackgroundColor; color: $dcm-grid-fontColorDark; border-bottom-color: $dcm-grid-selectedBackgroundColor; }
          > tbody > tr.selected.active:hover > td.dcm-grid-activemarker { background-color: $dcm-grid-activeColor; border-bottom-color: $dcm-grid-activeColor; }

          > tbody > tr.dcm-grid-details.selected > td.dcm-grid-activemarker { border-bottom-color: $dcm-grid-activeColor; }
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