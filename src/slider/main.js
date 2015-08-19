'use strict';

/**
 * @ngdoc module
 * @name dcm-ui.slider
 * @description
 *
 * The `dcm-ui.slider` module provides an angular based slider component.
 *
 * requires: jQuery
 *
 * @example
   <example name="slider-demo" module="dcm-ui" style="height:1600px;">

    <file name="index.html">
       <div ng-controller="GridExampleCtrl">

          <dcm-slider datasource="data.aThings" selected="data.thing">
            <dcm-slider-handle>-{{data.thing.id}}-</dcm-slider-handle>
          </dcm-slider>

          <p>Selected: {{data.thing.text}}</p>

      </div>
    </file>

    <file name="app.js">
      angular.module('dcm-ui.slider')
        .controller('GridExampleCtrl', ['$scope',
          function ($scope) {

            $scope.data = {

              aThings: [
                {id: 1, text: 'thing one'},
                {id: 2, text: 'thing two'},
                {id: 3, text: 'thing three'},
                {id: 4, text: 'thing four'},
                {id: 5, text: 'thing five'},
                {id: 6, text: 'thing six'},
                {id: 7, text: 'thing seven'},
                {id: 8, text: 'thing eight'},
                {id: 9, text: 'thing nine'}
              ],

              thing: null

            };

        }]);
    </file>


    <file name="dcm-slider.css">

      .dcm-slider {
        height: 40px;
        position: relative;
        margin: 0 20px;
      }

      .dcm-slider-bar-container {
        outline: 1px solid #CBCBCB;
        height: 20px;
        position: absolute;
        left: 0px;
        right: 0px;
        bottom: 0px;
        background: #EFEFEF;
      }


      .dcm-slider-bar {
        background: #529BDA;
        height: 20px;
        width: 0px;
      }

      .dcm-slider-drag-handle {
        cursor: col-resize;
        display: block;
        background: #428BCA;
        width: 20px;
        height: 20px;
        border-radius: 8px;
        z-index: 100;
        color: #CBCBCB;
        position: relative;
        margin-right: -10px;
        float: right;
      }

      .dcm-slider-select-areas {
        position: absolute;
        z-index: 90;
        left: 0px;
        right: 0px;
        top: 0px;
        bottom: 0px;
      }

      .dcm-slider-mark {
        height: 15px;
        width: 1px;
        margin: 0 auto;
        display: block;
        background: #CBCBCB;
      }

      .dcm-slider-mark.first {
        height: 40px;
        margin: 0 auto 0 -1px;
      }

      .dcm-slider-mark.last {
        height: 40px;
        margin: 0 -1px 0 auto;
      }

    </file>



  </example>
 */

angular.module('dcm-ui.slider', ['dcm-ui.helpers.drag']);