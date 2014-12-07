(function(angular) {
  'use strict';
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
})(window.angular);