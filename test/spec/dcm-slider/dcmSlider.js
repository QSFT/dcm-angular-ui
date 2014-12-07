'use strict';

describe('Directive: dcmSlider', function () {

  // load the directive's module
  beforeEach(module('dcm-ui'));

  var scope, host, $timeout, $rootScope, dragHandle, slider, container, $compile;

  beforeEach(inject(function (_$rootScope_, _$compile_, _$timeout_) {

    $timeout = _$timeout_;
    $rootScope = _$rootScope_;
    $compile = _$compile_;

    // create a scope for this element
    scope = $rootScope.$new();
    scope.aThings = [{name: 'one'},{name: 'two'},{name: 'three'},{name: 'four'},{name: 'five'}];
    scope.selectedThing = null;


    // create a host div in the actual dom
    host = $('<div id="host"></div>');
    $('body').append(host);

    // add some styles for positioning / sizing
    host.append(angular.element('<style>.dcm-slider{height:40px;position:relative}.dcm-slider-bar-container{outline:#CBCBCB solid 1px;height:20px;position:absolute;left:0;right:0;bottom:0;background:#EFEFEF}.dcm-slider-bar{background:#529BDA;height:20px;width:0}.dcm-slider-drag-handle{cursor:col-resize;display:block;background:#428BCA;width:20px;height:20px;border-radius:8px;z-index:100}.dcm-slider-select-areas{position:absolute;z-index:90;left:0;right:0;top:0;bottom:0}.dcm-slider-mark{height:15px;width:1px;margin:0 auto;display:block;background:#CBCBCB}.dcm-slider-mark.first{height:40px;margin:0 auto 0 -1px}.dcm-slider-mark.last{height:40px;margin:0 -1px 0 auto}</style>'));
    container = angular.element('<div style="width:1000px">');
    container.append(angular.element('<dcm-slider datasource="aThings" selected="selectedThing"></dcm-slider>'));
    host.append(container);
    $compile(host)(scope);

    scope.$digest();

    // there is a timeout before positions of things are calculated
    $timeout.flush();

    // these are in reverse order from the cols, as each is appended after the table
    dragHandle = host.find('.dcm-slider-drag-handle').eq(0);
    slider = host.find('.dcm-slider').eq(0);

  }));



  afterEach(function() {
    // remove host div
    host.remove();
  });


  var getPos = function() {
    var os = dragHandle.offset();
    return {left: os.left, top: os.top, width: dragHandle.width()};
  };

  var fakeMouseEvent = function(element, eventType, button, pageX, pageY) {
    var ev = document.createEvent('MouseEvent');
    ev.initMouseEvent(
        eventType,
        true /* bubble */, true /* cancelable */,
        window, null,
        0, 0, pageX ? pageX : 0, pageY ? pageY : 0, /* coordinates */
        false, false, false, false, /* modifier keys */
        button ? button : 0, null
    );
    element[0].dispatchEvent(ev);
  };


  var dragSlider = function(dx) {

    var nextPos = getPos();

    fakeMouseEvent(dragHandle, 'mousedown', 0, nextPos.left, nextPos.top + 1);
    scope.$digest();
    fakeMouseEvent(dragHandle, 'mousemove', 0, nextPos.left + dx, nextPos.top + 1);
    scope.$digest();
    fakeMouseEvent(dragHandle, 'mouseup', 0, nextPos.left + dx, nextPos.top + 1);
    scope.$digest();

  };


  it('should create a slider that fills the parent container', inject(function () {

    expect(slider.width()).toBe(1000);

  }));



  it('should create a drag handle within the slider ', inject(function () {

    var handlePos = dragHandle.offset();
    var sliderPos = slider.offset();

    expect(handlePos.left >= sliderPos.left && handlePos.left <= sliderPos.left + slider.width()).toBe(true);

  }));


  it('should have one click area per item in the datasource', inject(function () {

    expect(host.find('.dcm-slider-select-area').length).toBe(scope.aThings.length);

  }));


  it('should select something from the middle of the range if nothing is pre selected', inject(function () {

    expect(scope.selectedThing).toBe(scope.aThings[2]);

  }));



  it('should be able to select by clicking the slider', inject(function () {

    host.find('.dcm-slider-select-area').eq(4).trigger('click');

    scope.$digest();
    expect(scope.selectedThing).toBe(scope.aThings[4]);


  }));



  it('should be able to select by dragging the slider drag handle', inject(function () {

    dragSlider(-800);
    scope.$digest();

    expect(scope.selectedThing).toBe(scope.aThings[0]);

    dragSlider(1000);
    scope.$digest();

    expect(scope.selectedThing).toBe(scope.aThings[4]);


    dragSlider(-300);
    scope.$digest();

    expect(scope.selectedThing).toBe(scope.aThings[3]);

  }));



  it('should select the only item if the datasource only has one item', inject(function () {

    scope.aThings = [{name:'only'}];
    scope.$digest();

    expect(scope.selectedThing.name).toBe('only');


  }));

  it('should keep the previously selected item selected if it still exists and new items are added to the datasource', inject(function () {

    scope.aThings = [{name:'only'}];
    scope.$digest();

    expect(scope.selectedThing.name).toBe('only');

    scope.aThings.push({name: 'second'});
    scope.$digest();

    expect(scope.selectedThing.name).toBe('only');


  }));



  it('should not error if no items exist in the datasource', inject(function () {

    scope.aThings = [];
    scope.$digest();

    expect(scope.selectedThing).toBe(undefined);


  }));




  describe('with dcm-slider-handle child', function(){

    beforeEach(function(){

      host.remove();

      // create a host div in the actual dom
      host = $('<div id="host"></div>');
      $('body').append(host);

      // add some styles for positioning / sizing
      host.append(angular.element('<style>.dcm-slider{height:40px;position:relative}.dcm-slider-bar-container{outline:#CBCBCB solid 1px;height:20px;position:absolute;left:0;right:0;bottom:0;background:#EFEFEF}.dcm-slider-bar{background:#529BDA;height:20px;width:0}.dcm-slider-drag-handle{cursor:col-resize;display:block;background:#428BCA;width:20px;height:20px;border-radius:8px;z-index:100}.dcm-slider-select-areas{position:absolute;z-index:90;left:0;right:0;top:0;bottom:0}.dcm-slider-mark{height:15px;width:1px;margin:0 auto;display:block;background:#CBCBCB}.dcm-slider-mark.first{height:40px;margin:0 auto 0 -1px}.dcm-slider-mark.last{height:40px;margin:0 -1px 0 auto}</style>'));
      container = angular.element('<div style="width:1000px">');
      container.append(angular.element('<dcm-slider datasource="aThings" selected="selectedThing"><dcm-slider-handle>[{{selectedThing.name}}]</dcm-slider></dcm-slider>'));
      host.append(container);
      $compile(host)(scope);

      scope.$digest();

      // these are in reverse order from the cols, as each is appended after the table
      dragHandle = host.find('.dcm-slider-drag-handle').eq(0);
      slider = host.find('.dcm-slider').eq(0);


    });

    it('should create a drag handle within the slider and ', inject(function () {
      expect(scope.selectedThing.name).toBe('three');
      expect(dragHandle.text()).toBe('[three]');
    }));

  });


});
