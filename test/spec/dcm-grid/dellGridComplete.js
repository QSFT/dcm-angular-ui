'use strict';

describe('Directive: dcmGridControlBar', function () {

  // load the directive's module
  beforeEach(module('dcm-ui'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {

    scope = $rootScope.$new();

    scope.datasource = {
      pages: 0,
      bLoading: false,
      bFiltering: false,
      viewData: [],
      loadData: function() {

      }
    };

    scope.paginationOptions = {};

    scope.rowInfoOptions = {};

    scope.grid = {
      selected: [],
      active: undefined
    };


  }));


// <dcm-grid-control-bar datasource="datasource" selected="grid.bulkVolumes" bulk-action-buttons="bulkActionButtons"></dcm-grid-control-bar>

  it('should compile without any error', inject(function ($compile) {

    element = angular.element('<dcm-grid-with-bulk-actions datasource="datasource" pagination-options="paginationOptions" additional-row-data="rowInfoOptions" selected="grid.selected" bulk-action-buttons="bulkActionButtons" width="100%" active="grid.active" show-adjacent="2"></dcm-grid-with-bulk-actions>');
    element = $compile(element)(scope);

    scope.$digest();




  }));






});
