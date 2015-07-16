(function(angular) {
  'use strict';
angular.module('dcm-ui.grid')
  .controller('GridExampleCtrl', ['$scope', 'datasource', '$log', 'filters', '$q', '$timeout',
    function ($scope, datasource, $log, filters, $q, $timeout) {

      $scope.showConfig = false;

      $scope.toggleConfig = function() {
        $scope.showConfig = !$scope.showConfig;
      }

      // setup some dummy data...

      var servers = ['PowerEdge R320', 'PowerEdge R210 II', 'PowerEdge R420', 'PowerEdge R910', 'PowerEdge R720xd'];

      // convert servers to select2 format for filter
      var aServers = [];
      angular.forEach(servers, function(server){
        aServers.push({id: server, text: server });
      });

      var ram = [2, 4, 8, 16, 32, 64, 128];
      var genIP = function () {
        return '192.168.' +
          (Math.floor(Math.random() * 3) + 100) + '.' +
          Math.floor(Math.random() * 256);
      };
      var genServiceTag = function () {
        var i = 0, ret = '';
        for(; i < 8; i++) {
          ret += String.fromCharCode(65 + Math.floor(Math.random() * 8));
        }
        return ret;
      };

      var createRandomItem = function() {

        var isOnline = Math.random() > 0.1;

        return{
          ip: genIP(),
          isOnline: isOnline,
          icon: isOnline ? 'fa-check-circle' : 'fa-exclamation-circle',
          iconColor: isOnline ? 'success' : 'error',
          serviceTag: genServiceTag(),
          model: servers[ Math.floor(Math.random() * servers.length) ],
          memory: ram[ Math.floor(Math.random() * ram.length) ] + ' GB'
        };
      };

      var generateData = function() {

        var def = $q.defer();
        var pageNo = 1;

        var sendData = function() {

          var timeStart = (new Date()).getTime();

          var rawData = [];
          for (var j = 0; j < parseInt($scope.dsOpts.recordsPerIteration,10); j++) {
            rawData.push(createRandomItem());
          }

          var genTime = (new Date()).getTime() - timeStart;
          $log.info('GRIDTEST: Generating data ' + genTime + 'ms');

          def.notify(rawData);

          if (pageNo++ < parseInt($scope.dsOpts.iterations,10)) {

            $timeout(function(){
              sendData();
            }, 500 );

          } else {
            def.resolve();
          }

        };

        $timeout(function(){
          sendData();
        }, 0 );

        return def.promise;
      };

      // end code for dummy data...





      // setup an empty filter object
      $scope.filter = filters.new($scope);

      // add filter for service tag
      $scope.filter.addStandardTextSearchFilter('serviceTag');

      // add filter for 'online status'
      $scope.filter.addDefaultValue('isOnline', false);
      $scope.filter.addFilterWhenValueIs('isOnline', true);

      // add filter for model
      $scope.filter.addDefaultValue('model', '');
      $scope.filter.addFilterExactMatch('model');
      $scope.filter.data.models = aServers;


      // configure datasource
      $scope.serverRequestOptions = {
        resource: 'fakeServers'
      };

      // grid config...
      $scope.serverGrid = {
        activeServer: undefined,
        selectedServers: []
      };

      // pagination options
      $scope.paginationOptions = {
        perPage: 10
      };


      // create data source
      $scope.dsOpts = {
        request: $scope.serverRequestOptions,
        filter: $scope.filter,
        recordsPerIteration: 80,
        iterations: 5,
        requestDataFunction: generateData,
        pagination: $scope.paginationOptions
      };


      $scope.datasource = datasource.create($scope, $scope.dsOpts);



  }]);
})(window.angular);