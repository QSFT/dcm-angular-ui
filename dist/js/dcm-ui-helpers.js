'use strict';

/**
 * @ngdoc module
 * @name dcm-ui.helpers
 * @description
 *
 * Helpers used by other components
 *

 */
angular.module('dcm-ui.helpers', ['dcm-ui.helpers.drag']);
'use strict';

/**
 * @ngdoc service
 * @name dragHelper
 * @module dcm-ui.helpers
 *
 * @description
 * Can be used to implement drag actions for UI components
 *
 */

angular.module('dcm-ui.helpers.drag', [])
  .factory('dragHelper', ['$document', function($document) {



  var _public = {

    draggable: function($element, opts) {

      var options = angular.extend({
        dragCursor: 'col-resize',
        mouseMove: angular.noop,
        mouseDown: angular.noop,
        mouseUp: angular.noop,
        mouseDoubleClick: angular.noop,
        mouseClick: angular.noop
      }, opts);


      var dragCursorCSS = angular.element('<style type="text/css">*{cursor: ' + opts.dragCursor + ' !important}</style>');

      var initialX = 0;
      var initialY = 0;

      var mouseMoved = function(e){

        // apply changes to scope (as this is trigged by jquery mouse evt)
        $element.scope().$apply(function(){
          options.mouseMove(getPosition(e));
        });

      };

      var getPosition = function(e) {
        return {dX: e.pageX - initialX, dY: e.pageY - initialY};
      };


      var cancelDrag = function() {
        dragCursorCSS.remove();

        // undo jqLite bindings
        $document.off('mouseup', mouseUp);
        $document.off('mousemove', mouseMoved);

        $element.on('mousedown', mouseDown);
      };

      var mouseUp = function(e) {

        cancelDrag();

        // apply changes to scope (as this is trigged by jquery mouse evt)
        $element.scope().$apply(function(){
          options.mouseUp(getPosition(e));
        });


      };


      var mouseDown = function(e) {

        // only respond to left click
        if (e.which === 1) {

          e.preventDefault();
          e.stopPropagation();

          $element.off('mousedown', mouseDown);

          angular.element($document.prop('head')).append(dragCursorCSS);

          $element.addClass('resizing');

          // store initial cursor position (pre drag)
          initialX = e.pageX;
          initialY = e.pageY;

          // jQuery bindings

          // trigger a mouse up in case the browser somehow failed to trigger this previously
          $document.trigger('mouseup');

          $document.on('mousemove', mouseMoved);
          $document.on('mouseup', mouseUp);

          // apply changes to scope (as this is trigged by jquery mouse evt)
          $element.scope().$apply(function(){
            var result = options.mouseDown(getPosition(e));
            if (result === false) {
              cancelDrag();
            }
          });

          //prevent text selection
          return false;

        }

      };


      // bind drag handle
      $element.on('mousedown', mouseDown);

      $element.on('dblclick', function(e) {
        e.preventDefault();
        e.stopPropagation();
        // apply changes to scope (as this is trigged by jquery mouse evt)
        $element.scope().$apply(function(){
          options.mouseDoubleClick();
        });
      });

      $element.on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        // apply changes to scope (as this is trigged by jquery mouse evt)
        $element.scope().$apply(function(){
          options.mouseClick();
        });
      });



      $element.on('$destroy', function(){

        // undo jqLite bindings (in case we navigate away mid move somehow!)
        $document.off('mousemove', mouseMoved);
        $document.off('mouseup', mouseUp);

      });


    }

  };


  return _public;


}]);