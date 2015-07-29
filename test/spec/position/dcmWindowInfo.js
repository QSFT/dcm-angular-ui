'use strict';

describe('Service: dcmWindowInfo', function () {

  // load the service's module
  beforeEach(module('dcm-ui'));

  // instantiate service
  var scope, dcmWindowInfo, fakeWindow, win, $timeout;

  beforeEach(function(){

    fakeWindow = {innerHeight: 100, innerWidth: 100};

    module(function($provide) {
      $provide.value('$window', fakeWindow);
    });

    inject(function ($rootScope, $window, _dcmWindowInfo_, _$timeout_) {
      $timeout = _$timeout_;
      dcmWindowInfo = _dcmWindowInfo_;
      scope = $rootScope;
      win = angular.element($window);
    });

    $timeout.flush();

  });

  it('should have height and width defined and update it when a window resize occurs', function () {

    expect(dcmWindowInfo.height).not.toBeNull();
    expect(dcmWindowInfo.height).toBeGreaterThan(0);
    expect(dcmWindowInfo.width).not.toBeNull();
    expect(dcmWindowInfo.width).toBeGreaterThan(0);

    fakeWindow.innerHeight = 200;
    fakeWindow.innerWidth = 200;
    win.triggerHandler('resize');

    $timeout.flush();

    // should have the original size again
    expect(dcmWindowInfo.height).toBe(200);
    expect(dcmWindowInfo.width).toBe(200);

  });

  it('should only trigger an update if something actually changed', function () {

    win.triggerHandler('resize');

    // should not be any timeout to flush since nothing has changed
    expect($timeout.flush).toThrow();

  });


});
