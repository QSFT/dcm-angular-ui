'use strict';

describe('Directive: multipleInput', function () {

  // load the directive's module
  beforeEach(module('dcm-ui'));

  var scope, $rootScope, element;

  beforeEach(inject(function (_$rootScope_) {

    $rootScope = _$rootScope_;
    scope = $rootScope.$new();


  }));




  it('should make sure the items is an array', inject(function ($compile) {

    element = angular.element('<div><multiple-input items="items" add-button-label="add" ></multiple-input></div>');
    $compile(element)(scope);
    scope.$digest();

    expect(scope.items).toEqual([]);

  }));



  it('should transfer certain attributes to the input field', inject(function ($compile) {

    element = angular.element('<div><multiple-input items="items" type="email" placeholder="Enter email" ng-required="true" ></multiple-input></div>');
    $compile(element)(scope);
    scope.$digest();

    var inputEl = element.find('input').eq(0);

    expect(inputEl.attr('type')).toBe('email');
    expect(inputEl.attr('placeholder')).toBe('Enter email');

  }));



  it('should be able to prepopulate items', inject(function ($compile) {

    scope.items = ['x@y.com', 'foo@bar.com'];

    element = angular.element('<div><multiple-input items="items"></multiple-input></div>');
    $compile(element)(scope);
    scope.$digest();

    var itemEls = element.find('.list-group-item');

    expect(itemEls.length).toBe(2);

    expect(angular.element(itemEls[0]).text()).toBe('x@y.com');

  }));


  it('should be able to remove an item', inject(function ($compile) {

    scope.items = ['x@y.com', 'foo@bar.com'];

    element = angular.element('<div><multiple-input items="items"></multiple-input></div>');
    $compile(element)(scope);
    scope.$digest();

    var itemEls = element.find('.list-group-item');

    expect(itemEls.length).toBe(2);

    // click remove on the first item, should leave the second item
    itemEls.eq(0).find('button').triggerHandler('click');
    scope.$digest();

    expect(scope.items.length).toBe(1);

    expect(scope.items[0]).toBe('foo@bar.com');

    // check, view is updated
    itemEls = element.find('.list-group-item');

    expect(itemEls.length).toBe(1);

    expect(angular.element(itemEls[0]).text()).toBe('foo@bar.com');

  }));



  it('should be able to add an item', inject(function ($compile) {

    scope.items = [];

    element = angular.element('<div><multiple-input items="items"></multiple-input></div>');
    $compile(element)(scope);
    scope.$digest();

    var inputGroup = element.find('.input-group');

    // set input field and trigger any change watchers
    inputGroup
      .find('input')
      .val('test@example.com')
      .triggerHandler('change')
    ;

    scope.$digest();

    // click add button
    inputGroup.find('button').triggerHandler('click');

    scope.$digest();

    expect(scope.items.length).toBe(1);

    expect(scope.items[0]).toBe('test@example.com');

  }));



  it('should not add an item already in the list', inject(function ($compile) {

    scope.items = [];

    element = angular.element('<div><multiple-input items="items"></multiple-input></div>');
    $compile(element)(scope);
    scope.$digest();

    var inputGroup = element.find('.input-group');

    // set input field and trigger any change watchers
    inputGroup
      .find('input')
      .val('test@example.com')
      .triggerHandler('change')
    ;

    scope.$digest();

    // click add button
    inputGroup.find('button').triggerHandler('click');

    scope.$digest();

    expect(scope.items.length).toBe(1);
    expect(scope.items[0]).toBe('test@example.com');


    // click add button
    inputGroup.find('button').triggerHandler('click');
    scope.$digest();

    // should still have the one item
    expect(scope.items.length).toBe(1);
    expect(scope.items[0]).toBe('test@example.com');


  }));

  it('should add an item when enter key is input', inject(function ($compile) {

    scope.items = [];

    element = angular.element('<multiple-input items="items"></multiple-input>');
    $compile(element)(scope);
    scope.$digest();

    var theInput = element.find('.input-group').find('input');

    // set input field and trigger any change watchers
    theInput
      .val('test@example.com')
      .triggerHandler('change')
    ;

    // fake enter keypress in the input field
    var e = {which:13, preventDefault: angular.noop};
    element.isolateScope().catchEnter(e);

    // should have the one item
    expect(scope.items.length).toBe(1);
    expect(scope.items[0]).toBe('test@example.com');

    // set input field and trigger any change watchers
    theInput
      .val('test@example.com')
      .triggerHandler('change')
    ;

    // fake tab keypress in the input field
    e = {which:9, preventDefault: angular.noop};
    element.isolateScope().catchEnter(e);

    // should still have only one item
    expect(scope.items.length).toBe(1);
    expect(scope.items[0]).toBe('test@example.com');

  }));



});
