'use strict';

describe('Directive: resizableColumn', function () {

  // load the directive's module
  beforeEach(module('dcm-ui'));

  var scope, parent, host, col1, col2, col3, col4, col5, $timeout, $rootScope, dragHandles, col2Drag, col3Drag;

  beforeEach(inject(function (_$rootScope_, $compile, _$timeout_) {

    $timeout = _$timeout_;
    $rootScope = _$rootScope_;

    // create a host div in the actual dom
    host = $('<div id="host"></div>');
    $('body').append(host);

    scope = $rootScope.$new();

    var parentTable = angular.element('<table class="resizable-columns" style="width:1000px;">');

    parentTable.append(angular.element('<thead>'));

    parent = angular.element('<tr></tr>');

    col1 = angular.element('<th style="width: 20px;">Col1</th>');
    col2 = angular.element('<th class="resizable-column">Col #2</th>');
    col3 = angular.element('<th class="resizable-column" style="width:29%;">This is column  number three</th>');
    col4 = angular.element('<th class="resizable-column" style="width:29%;">c4</th>');
    col5 = angular.element('<th style="width:10%">c5</th>');

    parentTable.append(parent);
    parent.append([col1,col2,col3,col4,col5]);

    var rows = '<tbody' +
        '<tr>' +
          '<td>1</td><td>2</td><td>3</td><td>4</td><td>5</td>' +
        '</tr>' +
        '<tr>' +
          '<td>5</td><td>6</td><td>7</td><td>8</td><td>9</td>' +
        '</tr>' +
      '</tbody';

    parentTable.append(rows);
    parentTable.append(rows);

    host.append(parentTable);

    $compile(host)(scope);
    $timeout.flush();
    scope.$digest();

    // these are in reverse order from the cols, as each is appended after the table
    dragHandles = host.find('a.resizable-columns-drag-handle');
    col2Drag = angular.element(dragHandles[1]);
    col3Drag = angular.element(dragHandles[0]);

  }));



  afterEach(function() {
    // remove host div
    host.remove();
  });


  var checkDragHandleSpansCell = function(handle, cell) {
    expect(handle.offset().left).toBeLessThan(cell.offset().left);
    expect(handle.offset().left + handle.width()).toBeGreaterThan(cell.offset().left);
  };

  var getPos = function(cell) {
    var os = cell.offset();
    return {left: os.left, top: os.top, width: cell.width()};
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


  var dragCol = function(col, handle, dx) {
    var nextPos = getPos(col.next());

    fakeMouseEvent(handle, 'mousedown', 0, nextPos.left, nextPos.top + 1);
    scope.$digest();
    fakeMouseEvent(handle, 'mousemove', 0, nextPos.left + dx, nextPos.top + 1);
    scope.$digest();
    fakeMouseEvent(handle, 'mouseup', 0, nextPos.left + dx, nextPos.top + 1);
    scope.$digest();

  };


  it('should add a drag handle element between each resizable column', inject(function () {

    expect(dragHandles.length).toBe(2);

    // check drag handles are positioned correctly
    expect($(dragHandles[0]).offset().top).toBe(parent.offset().top);
    expect($(dragHandles[1]).offset().top).toBe(parent.offset().top);

    // check drag handles have the correct height
    expect($(dragHandles[0]).height()).toBe(parent.height());
    expect($(dragHandles[1]).height()).toBe(parent.height());

    // check drag handles span the correct cols
    checkDragHandleSpansCell(col2Drag, col3);
    checkDragHandleSpansCell(col3Drag, col4);

  }));

  it('should set style/width attributes on all cells widthout one', function(){
    expect(col2.attr('style').match(/(\b|;)\s*width\s*:\s*\d+px\s*;\s*/)).toBeTruthy();
  });

  it('should not change style/width attributes on cells that already have them (except final cell)', function(){
    expect(col3.attr('style').match(/(\b|;)\s*width\s*:\s*29%\s*;\s*/)).toBeTruthy();
  });

  it('should set the last cols style/width attribute to auto', function(){
    expect(col4.attr('style').match(/(\b|;)\s*width\s*:\s*auto\s*;\s*/)).toBeTruthy();
  });


  it('should allow us to resize the cell down', function(){

    var col2Initial = getPos(col2);
    var col3Initial = getPos(col3);

    dragCol(col2, col2Drag, -20);

    var newCol2 = getPos(col2);
    var newCol3 = getPos(col3);

    // expect col2 left and top to be unchanged
    expect(newCol2.left).toBe(col2Initial.left);
    expect(newCol2.top).toBe(col2Initial.top);

    // expect col2 to be 20px narrower
    expect(newCol2.width).toBe(col2Initial.width - 20);

    // expect col2 to be left 20px more, 20px wider and same top
    expect(newCol3.top).toBe(col3Initial.top);
    expect(newCol3.left).toBe(col3Initial.left - 20);
    expect(newCol3.width).toBe(col3Initial.width + 20);

  });



  it('should allow us to resize the cell up', function(){

    var col2Initial = getPos(col2);
    var col3Initial = getPos(col3);

    dragCol(col2, col2Drag, 20);

    var newCol2 = getPos(col2);
    var newCol3 = getPos(col3);

    // expect col2 left and top to be unchanged
    expect(newCol2.left).toBe(col2Initial.left);
    expect(newCol2.top).toBe(col2Initial.top);

    // expect col2 to be 20px narrower
    expect(newCol2.width).toBe(col2Initial.width + 20);

    // expect col2 to be left 20px more, 20px wider and same top
    expect(newCol3.top).toBe(col3Initial.top);
    expect(newCol3.left).toBe(col3Initial.left + 20);
    expect(newCol3.width).toBe(col3Initial.width - 20);

  });


  it('should set any non resizable resized cells to width:auto', function(){

    var col3Initial = getPos(col3);

    dragCol(col3, col3Drag, 20);

    var newCol3 = getPos(col3);

    expect(newCol3.width).toBe(col3Initial.width + 20);
    expect($.trim(col4.attr('style'))).toBe('width: auto;');

  });



  it('should not do anything when other mouse buttons are used', function(){

    var col2Initial = getPos(col2);
    var col3Initial = getPos(col3);

    var nextPos = getPos(col3);

    fakeMouseEvent(col2Drag, 'mousedown', 2, nextPos.left, nextPos.top + 1);
    scope.$digest();
    fakeMouseEvent(col2Drag, 'mousemove', 2, nextPos.left + 20, nextPos.top + 1);
    scope.$digest();
    fakeMouseEvent(col2Drag, 'mouseup', 2, nextPos.left + 20, nextPos.top + 1);
    scope.$digest();


    var newCol2 = getPos(col2);
    var newCol3 = getPos(col3);

    expect(newCol2).toEqual(col2Initial);
    expect(newCol3).toEqual(col3Initial);

  });


  it('should emit a resize event when resized', function(){

    var resizeEventTriggered = false;
    var unbind = $rootScope.$on('TABLE_COL_RESIZED', function() {
      resizeEventTriggered = true;
    });

    dragCol(col2, col2Drag, 80);

    expect(resizeEventTriggered).toBe(true);

    unbind();

  });


  it('should not emit a resize event if position doesn\'t actually change', function(){

    var resizeEventTriggered = false;
    var unbind = $rootScope.$on('TABLE_COL_RESIZED', function() {
      resizeEventTriggered = true;
    });

    dragCol(col2, col2Drag, 0);

    expect(resizeEventTriggered).toBe(false);

    unbind();

  });


  it('should not resize if there is no room to move', function(){

    dragCol(col2, col2Drag, -1000);
    dragCol(col3, col3Drag, -1000);

    var resizeEventTriggered = false;
    var unbind = $rootScope.$on('TABLE_COL_RESIZED', function() {
      resizeEventTriggered = true;
    });

    dragCol(col2, col2Drag, 20);

    expect(resizeEventTriggered).toBe(false);

    unbind();

  });


  it('should prevent clicks propogating through drag handle', function(){

    var bClicked = false;
    var clicked = function(){
      bClicked = true;
    };

    host.on('click', clicked);

    col2Drag.trigger('click');

    expect(bClicked).toBe(false);

  });


  it('should prevent clicks propogating through drag box', function(){

    var bClicked = false;
    var clicked = function(){
      bClicked = true;
    };

    host.on('click', clicked);

    // drag box is only out during resize
    var nextPos = getPos(col3);
    fakeMouseEvent(col2Drag, 'mousedown', 0, nextPos.left, nextPos.top + 1);
    scope.$digest();

    var dragBox = host.find('.resizable-columns-drag-box');

    dragBox.trigger('click');
    expect(bClicked).toBe(false);

  });

  it('should try and resize to best fit on double click', function(){

    var col2Initial = getPos(col2);
    var col3Initial = getPos(col3);

    fakeMouseEvent(col2Drag, 'dblclick', 0, col3Initial.left, col3Initial.top + 1);
    scope.$digest();

    var newCol2 = getPos(col2);
    var newCol3 = getPos(col3);

    expect(newCol2.width).not.toBe(col2Initial.width);
    expect(newCol3.width).not.toBe(col3Initial.width);

  });


  it('should not auto resize if there is no room to move', function(){


    dragCol(col2, col2Drag, -1000);
    dragCol(col3, col3Drag, -1000);

    var col3Initial = getPos(col3);

    var resizeEventTriggered = false;
    var unbind = $rootScope.$on('TABLE_COL_RESIZED', function() {
      resizeEventTriggered = true;
    });

    fakeMouseEvent(col2Drag, 'dblclick', 0, col3Initial.left, col3Initial.top + 1);
    scope.$digest();

    expect(resizeEventTriggered).toBe(false);

    var newCol3 = getPos(col3);

    expect(col3Initial).toEqual(newCol3);

    unbind();

  });




});
