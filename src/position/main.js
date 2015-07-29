'use strict';

/**
 * @ngdoc module
 * @name dcm-ui.position
 * @description
 *
 * The `dcm-ui.position` module sets positional info for an element to a variable
 *
 * requires: jquery
 *
 * @example
   <example name="position-demo" module="dcm-ui.position">
    <file name="index.html">

      <div class="container">

        <span dcm-position="thisPosition" class="positionedBox">
          {{thisPosition | json}}
        </span>

        <span dcm-position="thisPosition2" class="positionedBox2">
          {{thisPosition2 | json}}
        </span>

      </div>
    </file>

    <file name="styles.css">

      .container {
        position: relative;
        height: 400px;
      }

      .positionedBox {
        position: absolute;
        top: 25px;
        left: 25px;
        border: 1px dashed red;
        padding: 20px;
      }

      .positionedBox2 {
        position: absolute;
        top: 100px;
        left: 150px;
        border: 1px dashed red;
        padding: 20px;
      }

    </file>

  </example>
 */
angular.module('dcm-ui.position', []);