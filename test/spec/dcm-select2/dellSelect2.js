'use strict';

describe('Directive: dcmSelect2', function () {

  // load the directive's module
  beforeEach(module('dcm-ui.select2'));

  var scope, compile, host, SELECT2;

  // This is the equivalent of the old waitsFor syntax
  // which was removed from Jasmine 2
  var waitsFor = function(escapeFunction, escapeTime) {
    // check the escapeFunction every millisecond so as soon as it is met we can escape the function
    var interval = setInterval(function() {
      if (escapeFunction()) {
        clearMe();
      }
    }, 1);

    // in case we never reach the escapeFunction, we will time out
    // at the escapeTime
    var timeOut = setTimeout(function() {
      clearMe();
    }, escapeTime);

    // clear the interval and the timeout
    function clearMe(){
      clearInterval(interval);
      clearTimeout(timeOut);
    }
  };

  var waitForOpen = function(element) {

    // open the results dropdown (and wait until it has opened)
    var bComplete = false;
    element.one('select2-open', function(){
      bComplete = true;
    });
    element.select2('open');
    scope.$digest();
    waitsFor(function(){ return bComplete; }, 1500);

  };


  beforeEach(inject(function ($rootScope, $compile, _SELECT2_) {
    scope = $rootScope.$new();
    compile = $compile;

    SELECT2 = _SELECT2_;

    scope.minimalData = [
      { id: 'user0', text: 'Disabled User', locked: true, icon:'test-icon'},
      { id: 'user1', text: 'Jane Doe', locked: false},
      { id: 'user2', text: 'John Doe', locked: true}
    ];

    scope.oddKeyData = [
      { xid: 'user0', xtext: 'Disabled User', xicon:'test-icon', locked: true},
      { xid: 'user1', xtext: 'Jane Doe', xicon:'test-icon2', locked: false},
      { xid: 'user2', xtext: 'John Doe', xicon:'test-icon3', locked: true }
    ];

    // create a host div in the actual dom
    host = $('<div id="host"></div>');
    $('body').append(host);

  }));


  afterEach(function() {
    // remove host div
    host.remove();
    $('.select2-drop, .select2-drop-mask').remove();
  });


  var getContainer = function(el) {
    return el.siblings().eq(0);
  };


  var selectAsUser = function(element, index) {

    // open the results dropdown (and wait until it has opened)
    waitForOpen(element);

    var aResults = $('ul.select2-results li');

    // select the first element
    var bComplete = false;
    element.on('change', function(){
      bComplete = true;
    });
    aResults.eq(index).trigger('mouseup');
    waitsFor(function(){ return bComplete; }, 1500);
  };


  it('should throw an error if we have no model defined', function () {
    expect(function() {
      compile('<input dcm-select2 type="hidden"/>')(scope);
    }).toThrow();
  });

  it('should throw an error if not on an input element (hidden)', function () {
    expect(function() {
      compile('<select dcm-select2 ng-model="selectVal"/>')(scope);
    }).toThrow('only <input type="hidden"> tags can have this attribute');
  });

  it('should create proper DOM structure', function () {
    var element = compile('<input type="hidden" dcm-select2 ng-model="selectedVal" data="minimalData"/>')(scope);
    scope.$digest();
    expect(getContainer(element).is('div.select2-container')).toBe(true);
  });

  it('should set the model to empty if there is no initial value', function(){
    compile('<input type="hidden" dcm-select2="options" ng-model="selectedVal" data="minimalData"/>')(scope);
    scope.$digest();
    expect(scope.selectedVal).toBe('');
  });

  it('should preselect the value from the model', function(){

    scope.selectedVal = 'user1';
    var element = compile('<input type="hidden" dcm-select2 ng-model="selectedVal" data="minimalData"/>')(scope);
    scope.$digest();
    expect(scope.selectedVal).toBe('user1');
    expect(getContainer(element).find('span.select2-chosen').text()).toBe('Jane Doe');

  });


  it('should allow us to specify an icon in the data', function(){

    var element = compile('<input type="hidden" dcm-select2 ng-model="selectedVal" data="minimalData"/>')(scope);
    host.append(element);
    compile(host)(scope);
    scope.$digest();

   // open the results dropdown (and wait until it has opened)
    var bComplete = false;
    element.one('select2-open', function(){
      bComplete = true;
    });
    element.select2('open');
    scope.$digest();
    waitsFor(function(){ return bComplete; }, 1500);

    // first entry should have the icon specified in the data
    expect($('ul.select2-results .select2-result-label:first i').attr('class')).toBe('select2-inline-icon test-icon');

    // select first result and make sure icon shows in selection still
    selectAsUser(element,0);
    expect(getContainer(element).find('span.select2-chosen i').attr('class')).toBe('select2-inline-icon test-icon');

  });



  it('should be completely removed if the parent scope is destroyed', function () {

    var element = compile('<input type="hidden" dcm-select2 ng-model="selectedVal" data="minimalData"/>')(scope);

    scope.$digest();

    expect(getContainer(element).is('div.select2-container')).toBe(true);

    waitForOpen(element);

    scope.$destroy();

    expect($('.select2-drop').length).toBe(0);

  });


  it('should be closed if the SELECT2.close event is observed', function () {

    var element = compile('<input type="hidden" dcm-select2 ng-model="selectedVal" data="minimalData"/>')(scope);
    scope.$digest();
    expect(getContainer(element).is('div.select2-container')).toBe(true);

    waitForOpen(element);


    var bComplete = false;
    element.one('select2-close', function(){
      bComplete = true;
    });

    scope.$broadcast(SELECT2.events.close);

    waitsFor(function(){ return bComplete; }, 1500);

    expect(bComplete).toBe(true);

  });


  describe('with opt groups', function(){

    beforeEach(function(){

      scope.minimalData = [
        { id: 'user0', text: 'Disabled User'},
        { id: 'user1', text: 'Jane Doe', og: 11, children: [
          { id: 'user4', text: 'c3', og: 11},
          { id: 'user5', text: 'j4', og: 11},
        ]},
        { id: 'user2', text: 'John Doe', og: 22, children: [
          { id: 'user6', text: 'f5', og: 22},
          { id: 'user7', text: 'ns', og: 22},
        ]}
      ];

    });

    it('should work with opt groups (child data under a node)', function(){

      scope.selectedVal = 'user5';
      var element = compile('<input type="hidden" dcm-select2 ng-model="selectedVal" data="minimalData"/>')(scope);
      scope.$digest();
      expect(scope.selectedVal).toBe('user5');
      expect(getContainer(element).find('span.select2-chosen').text()).toBe('j4');

    });

    it('should expose the selected op group\'s label', function(){
      scope.selectedVal = 'user5';
      scope.selectedGroup = '';

      compile('<input type="hidden" dcm-select2 ng-model="selectedVal" opt-group-id-field="og" selected-opt-group="selectedGroup" data="minimalData"/>')(scope);
      scope.$digest();
      expect(scope.selectedGroup).toBe(11);

    });


    it('should place the opt group with the selected opt-group-text at the top of the list when opening select ', function(){

      scope.selectedGroup = 22;

      var element = compile('<input type="hidden" dcm-select2 ng-model="selectedVal" opt-group-id-field="og" selected-opt-group="selectedGroup" data="minimalData"/>')(scope);
      host.append(element);
      compile(host)(scope);
      scope.$digest();

     // open the results dropdown (and wait until it has opened)
      var bComplete = false;
      element.one('select2-open', function(){
        bComplete = true;
      });
      element.select2('open');

      scope.$digest();

      waitsFor(function(){ return bComplete; }, 1500);

      var aResults = $('ul.select2-results .select2-result-label');

      // first result should now be the parent of the opt group
      expect(aResults.eq(0).text()).toBe('John Doe');

      // selected group should not have changed
      expect(scope.selectedGroup).toBe(22);

    });


  });



  it('should allow the text/id/icon fields to be specified', function(){
    scope.selectedVal = 'user2';
    var element = compile('<input type="hidden" dcm-select2 ng-model="selectedVal" data="oddKeyData" id-field="xid" text-field="xtext" icon-field="xicon" />')(scope);
    scope.$digest();
    expect(scope.selectedVal).toBe('user2');
    expect(getContainer(element).find('span.select2-chosen').text()).toBe(' John Doe');
    expect(getContainer(element).find('span.select2-chosen i').attr('class')).toBe('select2-inline-icon test-icon3');
  });


  it('should allow the data to be a function', function(){

    scope.selectedVal = 'user1';
    scope.testfn = function() { return scope.minimalData; };
    var element = compile('<input type="hidden" dcm-select2 ng-model="selectedVal" data="testfn"/>')(scope);
    scope.$digest();
    expect(scope.selectedVal).toBe('user1');
    expect(getContainer(element).find('span.select2-chosen').text()).toBe('Jane Doe');

  });


  it('should observe the disabled attribute', function () {

    var element = compile('<input type="hidden" dcm-select2 ng-model="selectedVal" ng-disabled="disabled" data="minimalData"/>')(scope);
    scope.$digest();
    var oContainer = getContainer(element);

    expect(oContainer.hasClass('select2-container-disabled')).toBe(false);

    scope.disabled = true;
    scope.$digest();
    expect(oContainer.hasClass('select2-container-disabled')).toBe(true);

    scope.disabled = false;
    scope.$digest();
    expect(oContainer.hasClass('select2-container-disabled')).toBe(false);
  });

  it('should observe the readonly attribute', function () {

    var element = compile('<input type="hidden" dcm-select2 ng-model="selectedVal" ng-readonly="readonly" data="minimalData"/>')(scope);
    scope.$digest();
    var oContainer = getContainer(element);
    expect(oContainer.hasClass('select2-container-disabled')).toBe(false);

    scope.readonly = true;
    scope.$digest();

    expect(oContainer.hasClass('select2-container-disabled')).toBe(true);

  });


  describe('multiple enabled', function(){


    it('should update the model if the user changes the selection when multiple is enabled', function(){

      scope.selectedVal = [];
      scope.selectedObjects = [];

      var element = angular.element('<input type="hidden" dcm-select2="{multiple:true}" model-selected="selectedObjects" ng-model="selectedVal" data="minimalData" />');
      host.append(element);
      compile(host)(scope);
      scope.$digest();

      // validate first option was selected
      selectAsUser(element,0);
      expect(scope.selectedVal).toEqual(['user0']);
      expect(scope.selectedObjects).toEqual([scope.minimalData[0]]);

      // validate first and third options were selected
      selectAsUser(element,2);
      expect(scope.selectedVal).toEqual(['user0','user2']);
      expect(scope.selectedObjects).toEqual([scope.minimalData[0],scope.minimalData[2]]);

    });

    it('should update the selected objects if the data changes', function(){

      scope.selectedVal = [];
      scope.selectedObjects = [];

      var element = angular.element('<input type="hidden" dcm-select2="{multiple:true}" model-selected="selectedObjects" ng-model="selectedVal" data="minimalData" />');
      host.append(element);
      compile(host)(scope);
      scope.$digest();

      // validate first option was selected
      selectAsUser(element,0);
      selectAsUser(element,2);

      scope.$digest();

      // validate first and third options were selected
      expect(scope.selectedVal).toEqual(['user0','user2']);
      expect(scope.selectedObjects).toEqual([scope.minimalData[0],scope.minimalData[2]]);

      // delete the first value from the data
      scope.minimalData.splice(0,1);
      scope.$digest();

      // check the selected data is updated...
      expect(scope.selectedVal).toEqual(['user2']);
      expect(scope.selectedObjects).toEqual([scope.minimalData[1]]);

    });


    it('should reflect the object changing in the model', function(){

      scope.selectedVal = [];
      scope.selectedObjects = [];

      var element = angular.element('<input type="hidden" dcm-select2="{multiple:true}" model-selected="selectedObjects" ng-model="selectedVal" data="minimalData" />');
      host.append(element);
      compile(host)(scope);
      scope.$digest();

      scope.selectedObjects = [scope.minimalData[0],scope.minimalData[2]];
      scope.$digest();

      // validate first and third options were selected
      expect(scope.selectedVal).toEqual(['user0','user2']);

    });

    it('should reflect the id changing in the model', function(){

      scope.selectedVal = [];
      scope.selectedObjects = [];

      var element = angular.element('<input type="hidden" dcm-select2="{multiple:true}" model-selected="selectedObjects" ng-model="selectedVal" data="minimalData" />');
      host.append(element);
      compile(host)(scope);
      scope.$digest();

      scope.selectedVal = ['user0','user2'];
      scope.$digest();

      // validate first and third options were selected
      expect(scope.selectedObjects).toEqual([scope.minimalData[0],scope.minimalData[2]]);

    });

    it('should be an empty array when nothing is selected', function(){

      scope.selectedVal = null;

      var element = angular.element('<input type="hidden" dcm-select2="{multiple:true}" ng-model="selectedVal" data="minimalData" />');
      host.append(element);
      compile(host)(scope);
      scope.$digest();


      // validate first and third options were selected
      expect(scope.selectedVal).toEqual([]);

    });




  });


  it('should change the selection if the model is changed', function(){

    scope.selectedVal = 'user1';
    var element = compile('<input type="hidden" dcm-select2 ng-model="selectedVal" data="minimalData"/>')(scope);
    scope.$digest();

    expect(scope.selectedVal).toBe('user1');
    expect(getContainer(element).find('span.select2-chosen').text()).toBe('Jane Doe');

    scope.selectedVal = 'user2';
    scope.$digest();

    expect(getContainer(element).find('span.select2-chosen').text()).toBe('John Doe');

  });


  it('should clear the selection if the model is set to an invalid id', function(){


    scope.selectedVal = 'user1';
    var element = compile('<input type="hidden" dcm-select2 ng-model="selectedVal" data="minimalData"/>')(scope);
    scope.$digest();

    expect(getContainer(element).find('span.select2-chosen').text()).toBe('Jane Doe');

    scope.selectedVal = 'user99';
    scope.$digest();

    expect(scope.selectedVal).toBe('');
    expect(getContainer(element).find('span.select2-chosen').text()).toBe('');

  });


  it('should update the model if the user changes the selection', function(){

    scope.selectedVal = 'user2';

    var element = angular.element('<input type="hidden" dcm-select2 ng-model="selectedVal" data="oddKeyData" id-field="xid" text-field="xtext" />');
    host.append(element);

    // select2 requires the element to be in an actual page
    compile(host)(scope);
    scope.$digest();

    // make sure preselection has stuck
    expect(scope.selectedVal).toBe('user2');
    expect(host.find('span.select2-chosen').text()).toBe('John Doe');

    selectAsUser(element,0);

    // validate first option was selected
    expect(scope.selectedVal).toBe('user0');
    expect(host.find('span.select2-chosen').text()).toBe('Disabled User');

  });




  it('should leave the form pristine while preselecting data', function(){

    scope.selectedVal = 'user2';
    var element = angular.element('<input name="testSelector" type="hidden" dcm-select2 ng-model="selectedVal" data="oddKeyData" id-field="xid" text-field="xtext" />');

    $('<form name="testForm"></form>').append(element).appendTo(host);

    // select2 requires the element to be in an actual page
    compile(host)(scope);
    scope.$digest();

    // make sure preselection has stuck
    expect(scope.testForm.testSelector.$viewValue).toBe('user2');
    expect(host.find('span.select2-chosen').text()).toBe('John Doe');
    expect(scope.testForm.testSelector.$pristine).toBeTruthy();
    expect(scope.testForm.$pristine).toBeTruthy();

  });



  it('should clear the selection (back to the placeholder) if the model is set to an empty string', function(){

    scope.selectedVal = 'user2';
    var element = angular.element('<input name="testSelector" type="hidden" dcm-select2="{placeholder:\'nothing selected\'}" ng-model="selectedVal" data="oddKeyData" id-field="xid" text-field="xtext" />');

    $('<form name="testForm"></form>').append(element).appendTo(host);

    // select2 requires the element to be in an actual page
    compile(host)(scope);
    scope.$digest();

    scope.selectedVal = '';
    scope.$digest();

    // make sure preselection has stuck
    expect(scope.testForm.testSelector.$viewValue).toBe('');
    expect(host.find('span.select2-chosen').text()).toBe('nothing selected');

  });








  it('should leave the form pristine when selection is changed by model', function(){

    scope.selectedVal = 'user2';
    var element = angular.element('<input name="testSelector" type="hidden" dcm-select2 ng-model="selectedVal" data="oddKeyData" id-field="xid" text-field="xtext" />');

    $('<form name="testForm"></form>').append(element).appendTo(host);

    // select2 requires the element to be in an actual page
    compile(host)(scope);
    scope.$digest();

    scope.selectedVal = 'user0';
    scope.$digest();

    // make sure preselection has stuck
    expect(scope.testForm.testSelector.$viewValue).toBe('user0');
    expect(host.find('span.select2-chosen').text()).toBe('Disabled User');
    expect(scope.testForm.testSelector.$pristine).toBeTruthy();
    expect(scope.testForm.$pristine).toBeTruthy();

  });




  it('should make the form dirty when selection is changed by user', function(){

    scope.selectedVal = 'user2';
    var element = angular.element('<input name="testSelector" type="hidden" dcm-select2 ng-model="selectedVal" data="oddKeyData" id-field="xid" text-field="xtext" />');

    $('<form name="testForm"></form>').append(element).appendTo(host);

    // select2 requires the element to be in an actual page
    compile(host)(scope);
    scope.$digest();

    selectAsUser(element,0);


    // make sure preselection has stuck
    expect(scope.testForm.testSelector.$viewValue).toBe('user0');
    expect(host.find('span.select2-chosen').text()).toBe('Disabled User');
    expect(scope.testForm.testSelector.$pristine).toBeFalsy();
    expect(scope.testForm.$pristine).toBeFalsy();

  });



  it('should allow the selected object to be reflected in the model', function(){

    scope.selectedVal = 'user1';
    var element = angular.element('<input type="hidden" dcm-select2 ng-model="selectedVal" model-selected="selectedObject" data="minimalData"/>');

    host.append(element);

    // select2 requires the element to be in an actual page
    compile(host)(scope);
    scope.$digest();

    // check inital selection
    expect(scope.selectedVal).toBe('user1');
    expect(scope.selectedObject).toBe(scope.minimalData[1]);

    // check programatic change of selection
    scope.selectedVal = 'user2';
    scope.$digest();
    expect(scope.selectedObject).toBe(scope.minimalData[2]);

    // check user changing selection
    selectAsUser(element,0);

    expect(scope.selectedObject).toBe(scope.minimalData[0]);

  });



  it('should allow the changes to the selected object in the model to change selected if + selection in ui/', function(){

    scope.selectedVal = 'user1';
    var element = angular.element('<input type="hidden" dcm-select2 ng-model="selectedVal" model-selected="selectedObject" data="minimalData"/>');
    host.append(element);

    // select2 requires the element to be in an actual page
    compile(host)(scope);
    scope.$digest();

    // check inital selection
    expect(scope.selectedVal).toBe('user1');
    expect(scope.selectedObject).toBe(scope.minimalData[1]);

    // check programatic change of selected object
    scope.selectedObject = scope.minimalData[2];
    scope.$digest();

    expect(scope.selectedVal).toBe('user2');
    expect(host.find('span.select2-chosen').text()).toBe('John Doe');


  });


  // nasty hackery to spy on the select 2 jquery function
  describe('jquery fn config', function(){

    var select2options;
    var origSelect2 = $.fn.select2;


    beforeEach(function(){

      spyOn($.fn, 'select2').and.callThrough();

      // replace overloaded things
      $.fn.select2.defaults = origSelect2.defaults;
      $.fn.select2.ajaxDefaults = origSelect2.ajaxDefaults;

      var element = angular.element('<input type="hidden" dcm-select2="options" ng-model="selectedVal" data="minimalData"/>');

      compile(element)(scope);

      scope.$digest();

      select2options = element.eq(0).select2.calls.first().args[0];

    });


    afterEach(function(){
      $.fn.select2 = origSelect2;
    });


    it('should have a query function that can filter data' , function(){

      var result;

      var opts = {
        term: 'Doe',
        callback: function(data) {
          result = data;
        }
      };

      select2options.query(opts);
      scope.$digest();

      expect(result).toEqual({
        more: false,
        results: [
          { id : 'user1', text : 'Jane Doe', locked : false, children : [  ] },
          { id : 'user2', text : 'John Doe', locked : true, children : [  ] }
        ]
      });

    });


    it('should handle matches in opt groups' , function(){

      scope.minimalData = [
        { id: 'user0', text: 'Disabled User'},
        { id: 'user1', text: 'Jane Doe', og: 11, children: [
          { id: 'user4', text: 'c3', og: 11},
          { id: 'user5', text: 'j4-matchme', og: 11},
        ]},
        { id: 'user2', text: 'John Doe', og: 22, children: [
          { id: 'user6', text: 'f5', og: 22},
          { id: 'user7', text: 'ns-matchme', og: 22},
        ]}
      ];

      var result;
      var opts = {
        term: 'matchme',
        callback: function(data) {
          result = data;
        }
      };

      select2options.query(opts);
      scope.$digest();

      expect(result).toEqual({
        more : false,
        results : [
          {
            id : 'user1',
            text : 'Jane Doe',
            og : 11,
            children : [ { id : 'user5', text : 'j4-matchme', og : 11 } ]
          },
          {
            id : 'user2',
            text : 'John Doe',
            og : 22,
            children : [ { id : 'user7', text : 'ns-matchme', og : 22 } ]
          }
        ]
      });

    });


    it('should have a query function that can handle no data' , function(){
      delete scope.minimalData;

      var result;

      var opts = {
        term: '',
        callback: function(data) {
          result = data;
        }
      };

      select2options.query(opts);
      scope.$digest();

      expect(result).toEqual({more: false, results: []});

    });


  });



});
