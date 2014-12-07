'use strict';

describe('Directive: dcmGridColumn', function () {

  // load the directive's module
  beforeEach(module('dcm-ui'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  // it('should make hidden element visible', inject(function ($compile) {
  //   element = angular.element('<dcm-grid-column></dcm-grid-column>');
  //   element = $compile(element)(scope);
  //   expect(element.text()).toBe('this is the dcmGridColumn directive');
  // }));

});
