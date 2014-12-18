'use strict';

/**
 * @ngdoc module
 * @name dcm-ui.multiple-input
 * @description
 *
 * The `dcm-ui.multiple-input` module provides a generic repeatable input field
 *
 * @example
   <example name="multi-input-demo" module="dcm-ui.multiple-input">
    <file name="index.html">

      <form class="col-xs-6" name="testForm" novalidate ng-init="formFields = {email: [ 'jethro@example.com', 'jessie@example.com' ]}">

          <div class="well">
            Array: {{formFields.email}}
          </div>

          <multiple-input items="formFields.email" type="email" add-button-icon="fa fa-plus" add-button-label="" placeholder="Enter email">

          </multiple-input>

      </form>

    </file>

  </example>
 */
angular.module('dcm-ui.multiple-input', []);