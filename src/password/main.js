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
          <div ng-show="registerForm.password.$error.minlength || registerForm.password.$error.maxlength">Password must be 8 - 128 characters. Longer passwords have fewer restrictions.</div>
          <div ng-show="registerForm.password.$error.dcmPasswordLowercase">One lower case letter.</div>
          <div ng-show="registerForm.password.$error.dcmPasswordUppercase">One upper case letter.</div>
          <div ng-show="registerForm.password.$error.dcmPasswordNumber">One number.</div>
          <div ng-show="registerForm.password.$error.dcmPasswordSpecial">One special character (!, @, #, $, %, etc).</div>
          <div ng-show="registerForm.password.$error.required">Password is required.</div>
          <div ng-show="registerForm.password.$valid">Password valid!</div>
        </span>
      </div>
    </file>

  </example>
 */
angular.module('dcm-ui.password', []);