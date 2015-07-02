'use strict';


/**
 * @ngdoc directive
 * @name multipleInput
 * @module dcm-ui.multiple-input
 * @restrict E
 *
 * @description
 * Creates a multiple input control
 *
 * @usage
 ```html
  <multiple-input items="form.emails" type="email" add-button-icon="fa fa-plus" add-button-label="" placeholder="Enter email">

  </multiple-input>
 ```
  *
  * @example
   <example name="multi-input-demo" module="dcm-ui.multiple-input">
    <file name="index.html">
      <form class="col-xs-6" name="testForm" novalidate ng-init="formFields = {email: [ 'jethro@example.com', 'jessie@example.com' ]}">
          <div class="well">Array: {{formFields.email}}</div>
          <multiple-input
            items="formFields.email"
            type="email"
            add-button-icon="fa fa-plus"
            add-button-label=""
            placeholder="Enter email"
          ></multiple-input>
      </form>
    </file>

  </example>
 *
 */

angular.module('dcm-ui.multiple-input')
.directive('multipleInput', [function () {

  return {

    restrict: 'E',
    template:
    '<div class="list-group" ng-show="!!items">' +
      '<div class="list-group-item" ng-repeat="item in items">' +
          '{{item}}' +
          '<button class="btn btn-xs btn-danger pull-right" ng-click="removeEntry($index)">' +
            '<i class="fa fa-times"></i>' +
          '</button>' +
      '</div>' +
      // '<div class="list-group-item">' +
      // '</div>' +
    '</div>' +
    '<div class="input-group" ng-form="testForm" ng-class="{\'has-error\': testForm.newItem.$invalid}">' +
      '<input ng-keypress="catchEnter($event)" class="form-control" name="newItem" type="{{type}}" placeholder="{{placeholder}}"' +
        ' ng-minlength="{{ngMinlength}}" ng-maxlength="{{ngMaxlength}}" ng-pattern="ngPattern" ng-model="ngModel">' +
      '<span class="input-group-btn">' +
        '<button class="btn btn-primary" type="button"' +
          'ng-disabled="!ngModel" ng-click="addEntry()">' +
            '<i ng-if="addButtonIcon" class="{{addButtonIcon}}"></i> {{addButtonLabel}}' +
        '</button>' +
      '</span>' +
    '</div>',
    replace: false,
    scope: {
      items: '=',
      type: '@',
      placeholder: '@',
      ngPattern: '=?',
      ngModel: '=?',
      ngMinlength: '@',
      ngMaxlength: '@',
      addButtonLabel: '@',
      addButtonIcon: '@'
    },
    compile: function(tElement, tAttrs) {

      var inputEl = tElement.find('input.form-control');

      // if no input type is specified default it to text
      if (!tAttrs.type) {
        tAttrs.$set('type', 'text');
      }

      // if no input type is specified default it to text
      if (tAttrs.addButtonLabel === undefined || !tAttrs.hasOwnProperty('addButtonLabel')) {
        tAttrs.$set('addButtonLabel', 'Add Item');
      }


      // remove optional attributes of not specified
      angular.forEach(['ngPattern', 'ngMinlength', 'ngMaxlength', 'placeholder'], function(attr){
        if (!tAttrs.hasOwnProperty(attr) || tAttrs[attr] === undefined) {
          inputEl.removeAttr(attr.replace(/([A-Z])/g,'-$1').toLowerCase());
        }
      });

      return function(scope) { // , el, attrs, ctrl



        scope.data = {};


        if (!angular.isArray(scope.items)) {
          scope.items = [];
        }

        scope.addEntry = function() {
          if (scope.ngModel && scope.items.indexOf(scope.ngModel) === -1) {
            scope.items.push(scope.ngModel);
            scope.ngModel = '';
          }
        };

        scope.removeEntry = function(idx) {
          scope.items.splice(idx,1);
        };

        // catch enter key on text input to prevent default submission
        scope.catchEnter = function(keyEvent) {
          if (keyEvent.which === 13) {
            scope.addEntry();
            keyEvent.preventDefault();
            }
        };

      };



    }

  };


}]);
