'use strict';

describe('Controller: ResizableColumnsCtrl', function () {

  // load the controller's module
  beforeEach(module('dcm-ui'));

  var ctrl, scope, aCols, dragHandleTemplate, $timeout;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, _$timeout_) {

    // setup a scope
    scope = $rootScope.$new();

    $timeout = _$timeout_;

    //initialize the controller
    ctrl = $controller('ResizableColumnsCtrl', {
      $scope: scope
    });

    ctrl.table = angular.element('<table>');

    aCols = [
      angular.element('<th class="resizable-column">first col</th>'),
      angular.element('<th class="resizable-column">second col</th>'),
      angular.element('<th>third col</th>')
    ];

    dragHandleTemplate  = '<a class="resizable-columns-drag-handle"></a>';


  }));


  it('should init with some shared resources', function () {

    // expect dragbox and drag cursor DOM elements to be created
    expect(ctrl.dragBox).toEqual(jasmine.any(angular.element));

    expect(true).toBe(true);

  });


  it('should allow us to add a new col', function () {

    angular.forEach(aCols, function(col){
      ctrl.addCol(col, angular.element(dragHandleTemplate));
    });

    expect(ctrl.cols.length).toBe(3);

  });

  it('should allow us to remove cols', function () {


    ctrl.addCol(aCols[0], angular.element(dragHandleTemplate));
    ctrl.addCol(aCols[1], angular.element(dragHandleTemplate));
    ctrl.addAutoCol(aCols[2]);


    ctrl.removeCol(aCols[0]);
    ctrl.removeCol(aCols[2]);

    expect(ctrl.cols.length).toBe(1);

  });

  it('should trigger the resizeAll function once each time a set of cols are added', function() {

    spyOn(ctrl,'resizeAll').and.callThrough();

    angular.forEach(aCols, function(col){
      ctrl.addCol(col, angular.element(dragHandleTemplate));
    });

    $timeout.flush();

    expect(ctrl.resizeAll.calls.count()).toBe(1);

  });


  it('should make sure all cols are at least the min size', function() {

    aCols[0].width(1);

    ctrl.minimumWidth = 20;

    ctrl.addCol(aCols[0], angular.element(dragHandleTemplate));
    ctrl.addCol(aCols[1], angular.element(dragHandleTemplate));
    ctrl.addAutoCol(aCols[2]);

    $timeout.flush();

    expect(aCols[0].width()).toBe(20);

  });




});
