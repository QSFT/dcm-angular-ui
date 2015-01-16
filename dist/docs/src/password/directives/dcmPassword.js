'use strict';

angular.module('dcm-ui.password')

/**
 * @ngdoc directive
 * @name dcmPassword
 * @module dcm-ui.password
 * @restrict A
 *
 * @description
 * Provides a password validator implementing modified Stanford password rules
 *
 * @param {string=} dcm-password - pass in an object to override default validation settings
 */

  .directive('dcmPassword', [function () {
    return {
      restrict: 'A',
      require: 'ngModel',
      scope: {
        options: '=dcmPassword'
      },
      link: function(scope, elem, attrs, ctrl) {

        // define default validation rules
        var defaults = {
          rules: {
            'dcmPasswordSpecial': { rule: /[^a-zA-Z0-9]/, minlength: 0, maxlength: 11},
            'dcmPasswordNumber': { rule: /\d/, minlength: 0, maxlength: 15 },
            'dcmPasswordLowercase': { rule: /[a-z]/, minlength: 0, maxlength: 19 },
            'dcmPasswordUppercase': { rule: /[A-Z]/, minlength: 0, maxlength: 19 }
          }
        };

        // allow override of validation rules
        var validation = angular.extend(defaults, scope.options || {});

        ctrl.$validators.passwordCharacters = function(value) {

          value = value || '';
          var valid = true;

          // iterate through validation rules and fail validation if any rule fails
          var testresult;

          for (var test in validation.rules) {

            if (!ctrl.$isEmpty(value) && value.length >= validation.rules[test].minlength &&
              value.length <= validation.rules[test].maxlength) {
              testresult = validation.rules[test].rule.test(value);
            } else {
              testresult = true;
            }

            ctrl.$setValidity(test, testresult);

            valid = valid && testresult;

          }

          return valid;
        };

      }
    };
  }]);
