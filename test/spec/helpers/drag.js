'use strict';

describe('Service: dragHelper', function () {

  // load the directive's module
  beforeEach(module('dcm-ui'));

  var scope, host, $timeout, $rootScope, dragHandle, mouseMove, mouseUp, mouseDown, dragHelper;

  beforeEach(inject(function (_$rootScope_, $compile, _$timeout_, _dragHelper_) {

    $timeout = _$timeout_;
    $rootScope = _$rootScope_;
    dragHelper = _dragHelper_;

    scope = $rootScope.$new();

    // create a host div in the actual dom
    host = $('<div id="host" style="width:1000px; height: 1000px;"></div>');
    $('body').append(host);

    dragHandle = $('<div id="dragHandle" style="width:10px; height:10px;"></div>');

    host.append(dragHandle);

    mouseMove = jasmine.createSpy('mouse move');
    mouseUp = jasmine.createSpy('mouse up');
    mouseDown = jasmine.createSpy('mouse down');

    dragHelper.draggable(dragHandle,{
      mouseMove: mouseMove,
      mouseUp: mouseUp,
      mouseDown: mouseDown
    });

    $compile(host)(scope);
    scope.$digest();

  }));



  afterEach(function() {
    // remove host div
    host.remove();
  });



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




  it('should allow us to drag the drag handle', function(){

    var nextPos =  dragHandle.offset();

    fakeMouseEvent(dragHandle, 'mousedown', 0, nextPos.left, nextPos.top + 1);
    scope.$digest();
    expect(mouseDown).toHaveBeenCalled();

    fakeMouseEvent(dragHandle, 'mousemove', 0, nextPos.left + 20, nextPos.top + 13);
    scope.$digest();
    expect(mouseMove).toHaveBeenCalledWith({dX: 20, dY: 12});


    fakeMouseEvent(dragHandle, 'mouseup', 0, nextPos.left + 25, nextPos.top + 16);
    scope.$digest();
    expect(mouseUp).toHaveBeenCalledWith({dX: 25, dY: 15});

  });






  it('should not do anything when other mouse buttons are used', function(){

    var nextPos =  dragHandle.offset();

    fakeMouseEvent(dragHandle, 'mousedown', 2, nextPos.left, nextPos.top + 1);
    scope.$digest();
    expect(mouseDown).not.toHaveBeenCalled();

    fakeMouseEvent(dragHandle, 'mousemove', 2, nextPos.left + 20, nextPos.top + 1);
    scope.$digest();
    expect(mouseMove).not.toHaveBeenCalled();

    fakeMouseEvent(dragHandle, 'mouseup', 2, nextPos.left + 20, nextPos.top + 1);
    scope.$digest();
    expect(mouseUp).not.toHaveBeenCalled();

  });





  it('should prevent clicks propogating through drag handle', function(){

    var bClicked = false;
    var clicked = function(){
      bClicked = true;
    };

    host.on('click', clicked);

    dragHandle.trigger('click');

    expect(bClicked).toBe(false);

  });



});
