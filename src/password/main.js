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
 *
 * </ul>
 *
 * @example
   <example name="password-demo" module="dcm-ui.password">
    <file name="index.html">

    <form class="col-xs-6" name="registerForm" ng-model="register" action="processRegistration" method="POST" class="form-horizontal" novalidate>
    <div class="form-group" ng-class="{'has-error': form.password.$invalid}" >
      <label for="password">Password: </label>

      <input type="password" id="password" name="password" ng-focus="showPasswordReqs = true" ng-model="user.password" class="form-control" dcm-password required minlength="8" maxlength="128" />
      <span class="help-block" ng-show="showPasswordReqs">
        <div ng-show="registerForm.password.$error.minlength || registerForm.password.$error.maxlength || registerForm.password.$error.required">8 - 128 characters. Longer passwords have fewer restrictions.</div>
        <div ng-show="registerForm.password.$error.dcmPasswordLowercase">One lower case letter.</div>
        <div ng-show="registerForm.password.$error.dcmPasswordUppercase">One upper case letter.</div>
        <div ng-show="registerForm.password.$error.dcmPasswordNumber">One number.</div>
        <div ng-show="registerForm.password.$error.dcmPasswordSpecial">One special character (!, @, #, $, %, etc).</div>
        <div ng-show="registerForm.password.$valid">Password valid!</div>
      </span>
    </div>
    </form>

    </file>

  </example>
 */
angular.module('dcm-ui.password', []);