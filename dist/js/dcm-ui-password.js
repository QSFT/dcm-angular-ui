'use strict';

/**
 * @ngdoc module
 * @name dcm-ui.password
 * @description
 *
 * The `dcm-ui.password` module provides a directive implementing modified Stanford password validation rules.
 * <ul>
 *  <li>Password length < 12 requires number, upper/lower letters, special chararacters</li>
 *  <li>Password length 12-15 requires number, upper/lower letters</li>
 *  <li>Password length 16-19 requires upper/lower letters</li>
 *  <li>Password length > 19 has no requirements</li>
 * </ul>
 * Note: The directive does not implement the following Stanford validation rules:
 * <ul>
 *  <li>The password cannot match a previous password used by the user.</li>
 *  <li>The password cannot be a single dictionary word.</li>
 * </ul>
 *
 * @example
   <example name="password-demo" module="dcm-ui.password">
    <file name="index.html">
      <div ng-form="registerForm" class="form-group">
        <label>Password:</label>
        <input type="password" dcm-password required minlength="8" maxlength="128" name="password" ng-model="pwd" class="form-control" />
        <span class="help-block">
          <div ng-show="registerForm.password.$error.minlength || registerForm.password.$error.maxlength || registerForm.password.$error.required">8 - 128 characters. Longer passwords have fewer restrictions.</div>
          <div ng-show="registerForm.password.$error.dcmPasswordLowercase">One lower case letter.</div>
          <div ng-show="registerForm.password.$error.dcmPasswordUppercase">One upper case letter.</div>
          <div ng-show="registerForm.password.$error.dcmPasswordNumber">One number.</div>
          <div ng-show="registerForm.password.$error.dcmPasswordSpecial">One special character (!, @, #, $, %, etc).</div>
          <div ng-show="registerForm.password.$valid">Password valid!</div>
        </span>
      </div>
    </file>

  </example>
 */
angular.module('dcm-ui.password', []);
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
            if (value.length >= validation.rules[test].minlength && value.length <= validation.rules[test].maxlength) {
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
