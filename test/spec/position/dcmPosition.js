'use strict';

describe('Directive: dcmPosition', function () {

  // load the directive's module
  beforeEach(module('dcm-ui'));

  var element, scope, compile, host;

  beforeEach(inject(function ($rootScope, $compile) {
    scope = $rootScope.$new();
    compile = $compile;

    // create a host div in the actual dom
    host = angular.element('<div style="width: 1000px; position: relative;"></div>');
    $('body').append(host);

    element = angular.element('<span dcm-position="positionInfo" style="position: absolute;">Test Element!</span>');

    host.append(element);

    compile(element)(scope);

    scope.$digest();


  }));

  afterEach(function() {
    // remove host div
    host.remove();
  });



  it('should have set some position info width and height to match the element', inject(function () {

    expect(scope.positionInfo.height).toBe(element.outerHeight(true));
    expect(scope.positionInfo.width).toBe(element.outerWidth(true));

    var offset = element.offset();

    expect(scope.positionInfo.top).toBe(offset.top);
    expect(scope.positionInfo.left).toBe(offset.left);

  }));


  it('should update width and height to match the element if it changes', inject(function () {

    // add element to change width/height
    element.prepend('<h3 style="width:500px">Exciting Header</h3>');

    // should not change until after a digest cycle...
    expect(scope.positionInfo.height).not.toBe(element.outerHeight(true));
    expect(scope.positionInfo.width).not.toBe(element.outerWidth(true));

    scope.$digest();

    // should match the new width and height of the element
    expect(scope.positionInfo.height).toBe(element.outerHeight(true));
    expect(scope.positionInfo.width).toBe(element.outerWidth(true));

  }));


  it('should update top and left to match the element if it changes', inject(function () {

    // add element to change width/height
    element.css('top', '50px');
    element.css('left', '50px');

    var offset = element.offset();

    // should not change until after a digest cycle...
    expect(scope.positionInfo.top).not.toBe(offset.top);
    expect(scope.positionInfo.left).not.toBe(offset.left);

    scope.$digest();

    // should match the new width and height of the element
    expect(scope.positionInfo.top).toBe(offset.top);
    expect(scope.positionInfo.left).toBe(offset.left);

  }));





});
