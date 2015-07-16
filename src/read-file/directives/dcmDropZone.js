'use strict';
/**
 * @ngdoc directive
 * @name dcmDropZone
 * @module dcm-ui.read-file
 * @restrict A
 *
 * @description
 * Makes an element a drop zone for files
 *
 * @usage
 * <div dcm-drop-zone="drop handler function">...</div>
 */

angular.module('dcm-ui.read-file')
.directive( 'dcmDropZone', [ '$timeout',
  function( $timeout ) {
    return {
      restrict: 'A',
      scope: {
        dcmDropZone: '='
      },
      link: function( scope, element) {

        var dropHovered = false;
        var dropZoneTimer;

        element.on('dragstart dragenter dragover', function(event) {

          // Only file drag-n-drops allowed
          if (_.findWhere(event.originalEvent.dataTransfer.types, 'Files')) {

            event.stopPropagation();
            event.preventDefault();

            $timeout.cancel(dropZoneTimer);

            if (!dropHovered) {
              dropHovered = true;
              element.addClass('drop-zone-hover');
            }

            // set cursor icons
            event.originalEvent.dataTransfer.effectAllowed = 'copyMove';
            event.originalEvent.dataTransfer.dropEffect = 'move';

          }

        })
        .on('drop dragleave dragend', function () {

          $timeout.cancel(dropZoneTimer);

          dropZoneTimer = $timeout( function(){
            dropHovered = false;
            element.removeClass('drop-zone-hover');
          }, 70); // dropZoneHideDelay = 70, but anything above 50 is better

        });


        element.on('drop', function(evt){
          evt.stopPropagation();
          evt.preventDefault();
          scope.dcmDropZone(evt.originalEvent);
        });

      }
    };
  }
]);
