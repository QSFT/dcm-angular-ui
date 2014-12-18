'use strict';

describe('Directive: dcmPassword', function () {

  // load the directive's module
  beforeEach(module('dcm-ui'));

  var element, scope, compile, form;

  beforeEach(inject(function ($rootScope, $compile) {
    scope = $rootScope.$new();
    compile = $compile;

    element = angular.element('<form name="form"><input type="text" name="pw" ng-model="pw" dcm-password></form>');

    scope.pw = '';
    compile(element)(scope);
    scope.$digest();
    form = scope.form;
  }));

  it('should check a password with length=8 and requirements met', inject(function () {
    // password length = 8 (8 < 12) and requirements met (valid)
    form.pw.$setViewValue('ab12AB@#');
    scope.$digest();
    expect(scope.pw).toBe('ab12AB@#');
    expect(form.pw.$valid).toBeTruthy();
    expect(form.pw.$error.dcmPasswordNumber).toBeFalsy();
    expect(form.pw.$error.dcmPasswordLowercase).toBeFalsy();
    expect(form.pw.$error.dcmPasswordUppercase).toBeFalsy();
    expect(form.pw.$error.dcmPasswordSpecial).toBeFalsy();
  }));

  it('should check a password with length=11 and requirements met', inject(function () {
    // password length = 11 (8 < 12) and requirements met (valid)
    form.pw.$setViewValue('abc123AB@#$');
    scope.$digest();
    expect(scope.pw).toBe('abc123AB@#$');
    expect(form.pw.$valid).toBeTruthy();
    expect(form.pw.$error.dcmPasswordNumber).toBeFalsy();
    expect(form.pw.$error.dcmPasswordLowercase).toBeFalsy();
    expect(form.pw.$error.dcmPasswordUppercase).toBeFalsy();
    expect(form.pw.$error.dcmPasswordSpecial).toBeFalsy();
  }));

  it('should check a password with length=11 and missing special char', inject(function () {
    // password length = 11 (8 < 12) and missing special character (invalid)
    form.pw.$setViewValue('abc123ABCDE');
    scope.$digest();
    expect(scope.pw).toBeUndefined();
    expect(form.pw.$valid).toBeFalsy();
    expect(form.pw.$error.dcmPasswordNumber).toBeFalsy();
    expect(form.pw.$error.dcmPasswordLowercase).toBeFalsy();
    expect(form.pw.$error.dcmPasswordUppercase).toBeFalsy();
    expect(form.pw.$error.dcmPasswordSpecial).toBeTruthy();
  }));

  it('should check a password with length=11 and missing number, lower/upper letter', inject(function () {
    // password length =11 (8 < 12) and missing number, lower/upper letter (invalid)
    form.pw.$setViewValue('!@#$%^&*()_');
    scope.$digest();
    expect(scope.pw).toBeUndefined();
    expect(form.pw.$valid).toBeFalsy();
    expect(form.pw.$error.dcmPasswordNumber).toBeTruthy();
    expect(form.pw.$error.dcmPasswordLowercase).toBeTruthy();
    expect(form.pw.$error.dcmPasswordUppercase).toBeTruthy();
    expect(form.pw.$error.dcmPasswordSpecial).toBeFalsy();
  }));

  it('should check a password with length=12 and missing special char', inject(function () {
    // password length = 12 (12 < 16) and missing special char (valid)
    form.pw.$setViewValue('123456abcfAB');
    scope.$digest();
    expect(scope.pw).toBe('123456abcfAB');
    expect(form.pw.$valid).toBeTruthy();
    expect(form.pw.$error.dcmPasswordNumber).toBeFalsy();
    expect(form.pw.$error.dcmPasswordLowercase).toBeFalsy();
    expect(form.pw.$error.dcmPasswordUppercase).toBeFalsy();
    expect(form.pw.$error.dcmPasswordSpecial).toBeFalsy();
  }));

  it('should check a password with length=15 and missing special char', inject(function () {
    // password length = 15 (12 < 16) and missing special char (valid)
    form.pw.$setViewValue('123456abcdefABC');
    scope.$digest();
    expect(scope.pw).toBe('123456abcdefABC');
    expect(form.pw.$valid).toBeTruthy();
    expect(form.pw.$error.dcmPasswordNumber).toBeFalsy();
    expect(form.pw.$error.dcmPasswordLowercase).toBeFalsy();
    expect(form.pw.$error.dcmPasswordUppercase).toBeFalsy();
    expect(form.pw.$error.dcmPasswordSpecial).toBeFalsy();
  }));

  it('should check a password with length=15 and missing num, upper/lower letter', inject(function () {
    // password length = 15 (12 < 16) and missing num, upper/lower letter (invalid)
    form.pw.$setViewValue('~!@#$%^&*()_+-=');
    scope.$digest();
    expect(scope.pw).toBeUndefined();
    expect(form.pw.$valid).toBeFalsy();
    expect(form.pw.$error.dcmPasswordNumber).toBeTruthy();
    expect(form.pw.$error.dcmPasswordLowercase).toBeTruthy();
    expect(form.pw.$error.dcmPasswordUppercase).toBeTruthy();
    expect(form.pw.$error.dcmPasswordSpecial).toBeFalsy();
  }));

  it('should check a password with length=16 and missing num, special char', inject(function () {
    // password length = 16 (16 < 20) and missing num, special char (valid)
    form.pw.$setViewValue('abcdefghABCDEFGH');
    scope.$digest();
    expect(scope.pw).toBe('abcdefghABCDEFGH');
    expect(form.pw.$valid).toBeTruthy();
    expect(form.pw.$error.dcmPasswordNumber).toBeFalsy();
    expect(form.pw.$error.dcmPasswordLowercase).toBeFalsy();
    expect(form.pw.$error.dcmPasswordUppercase).toBeFalsy();
    expect(form.pw.$error.dcmPasswordSpecial).toBeFalsy();
  }));

  it('should check a password with length=19 and missing num, special char', inject(function () {
    // password length = 19 (16 < 20) and missing num, special char (valid)
    form.pw.$setViewValue('abcdefghABCDEFGHIJK');
    scope.$digest();
    expect(scope.pw).toBe('abcdefghABCDEFGHIJK');
    expect(form.pw.$valid).toBeTruthy();
    expect(form.pw.$error.dcmPasswordNumber).toBeFalsy();
    expect(form.pw.$error.dcmPasswordLowercase).toBeFalsy();
    expect(form.pw.$error.dcmPasswordUppercase).toBeFalsy();
    expect(form.pw.$error.dcmPasswordSpecial).toBeFalsy();
  }));

  it('should check a password with length=19 and missing upper/lower letter', inject(function () {
    // password length = 19 (16 < 20) and missing upper/lower letter (invalid)
    form.pw.$setViewValue('1111111111111111111');
    scope.$digest();
    expect(scope.pw).toBeUndefined();
    expect(form.pw.$valid).toBeFalsy();
    expect(form.pw.$error.dcmPasswordNumber).toBeFalsy();
    expect(form.pw.$error.dcmPasswordLowercase).toBeTruthy();
    expect(form.pw.$error.dcmPasswordUppercase).toBeTruthy();
    expect(form.pw.$error.dcmPasswordSpecial).toBeFalsy();
  }));

  it('should check a password with length=20', inject(function () {
    // password length = 20 (20 or greater) (valid)
    form.pw.$setViewValue('aaaaaaaaaaaaaaaaaaaa');
    scope.$digest();
    expect(scope.pw).toBe('aaaaaaaaaaaaaaaaaaaa');
    expect(form.pw.$valid).toBeTruthy();
    expect(form.pw.$error.dcmPasswordNumber).toBeFalsy();
    expect(form.pw.$error.dcmPasswordLowercase).toBeFalsy();
    expect(form.pw.$error.dcmPasswordUppercase).toBeFalsy();
    expect(form.pw.$error.dcmPasswordSpecial).toBeFalsy();
  }));

  it('should check a password with length=20 and spaces', inject(function () {
    // password length 20 or greater with spaces (valid)
    form.pw.$setViewValue('I use long passwords');
    scope.$digest();
    expect(scope.pw).toBe('I use long passwords');
    expect(form.pw.$valid).toBeTruthy();
    expect(form.pw.$error.dcmPasswordNumber).toBeFalsy();
    expect(form.pw.$error.dcmPasswordLowercase).toBeFalsy();
    expect(form.pw.$error.dcmPasswordUppercase).toBeFalsy();
    expect(form.pw.$error.dcmPasswordSpecial).toBeFalsy();
  }));

  it('should support custom rules with invalid password', inject(function () {
    // password length 12 and no special char (invalid)

    scope.passwordrules = {rules: {'dcmPasswordSpecial': { rule: /[^a-zA-Z0-9]/, minlength: 0, maxlength: 20},'dcmPasswordNumber': { rule: /\d/, minlength: 0, maxlength: 20 },'dcmPasswordLowercase': { rule: /[a-z]/, minlength: 0, maxlength: 20 },'dcmPasswordUppercase': { rule: /[A-Z]/, minlength: 0, maxlength: 20 }}};
    element = angular.element('<form name="form"><input type="text" name="pw" ng-model="pw" dcm-password="passwordrules"></form>');

    scope.pw = '';
    compile(element)(scope);
    scope.$digest();
    form = scope.form;

    form.pw.$setViewValue('A1aaaaaaaaaa');
    scope.$digest();
    expect(scope.pw).toBeUndefined();
    expect(form.pw.$valid).toBeFalsy();
    expect(form.pw.$error.dcmPasswordNumber).toBeFalsy();
    expect(form.pw.$error.dcmPasswordLowercase).toBeFalsy();
    expect(form.pw.$error.dcmPasswordUppercase).toBeFalsy();
    expect(form.pw.$error.dcmPasswordSpecial).toBeTruthy();
  }));

  it('should support custom rules with valid password', inject(function () {
    // password length 12  (valid)

    scope.passwordrules = {rules: {'dcmPasswordSpecial': { rule: /[^a-zA-Z0-9]/, minlength: 0, maxlength: 20},'dcmPasswordNumber': { rule: /\d/, minlength: 0, maxlength: 20 },'dcmPasswordLowercase': { rule: /[a-z]/, minlength: 0, maxlength: 20 },'dcmPasswordUppercase': { rule: /[A-Z]/, minlength: 0, maxlength: 20 }}};
    element = angular.element('<form name="form"><input type="text" name="pw" ng-model="pw" dcm-password="passwordrules"></form>');

    scope.pw = '';
    compile(element)(scope);
    scope.$digest();
    form = scope.form;

    form.pw.$setViewValue('A1$aaaaaaaaa');
    scope.$digest();
    expect(scope.pw).toBe('A1$aaaaaaaaa');
    expect(form.pw.$valid).toBeTruthy();
    expect(form.pw.$error.dcmPasswordNumber).toBeFalsy();
    expect(form.pw.$error.dcmPasswordLowercase).toBeFalsy();
    expect(form.pw.$error.dcmPasswordUppercase).toBeFalsy();
    expect(form.pw.$error.dcmPasswordSpecial).toBeFalsy();
  }));


});
