'use strict';

/**
 * @ngdoc service
 * @name datasource
 * @module dcm-ui.grid
 *
 * @description
 * Factory that creates datasources
 *
 */


angular.module('dcm-ui.grid')
  .factory('datasource', ['$timeout', '$q', '$log', '$http',
    function($timeout, $q, $log, $http) {
    // Service logic
    // ...


    var _public = {



        /**
         * @ngdoc method
         * @name datasource#create
         *
         * @description
         * creates a new datasource and returns it
         *
         * @param {object} dsScope - scope that the datasource will bind to
         * @param {object} options - options for configuring the datasource
         * @returns {object} Datasource object
         */

      create: function(dsScope, options) {

        var filterFunction, unwatchFilter,
          unwatchValidFilter, unwatchRequestParams, unwatchPaginationParams,
          requestOptions, cancelRequest, paginationOptions,
          pageBegin, pageEnd, sortFunction, processingNewData;

        var applyFilterPromise = null;

        var requestDefaults = {
          type: 'get'
        };

        var paginationDefaults = {
          perPage: 5
        };

        // add defaults into options if not provided

        if (!options.hasOwnProperty('autoLoad')) {
          options.autoLoad = true;
        }


        // default request data function to use $http
        // for default async it expects a return with a
        // complete node to tell if request is complete
        // it also expects a token node to append to request params
        // finally it expects the actual data to be in a data node

        // i.e returned data {data: [1,2,3], complete: false, token: 'xyz'}

        // will continue poling until complete is true


        var requestRow = options.requestRowFunction || _.identity;

        if (!options.hasOwnProperty('requestDataFunction')) {
          options.requestDataFunction = function(options){


            var dataprovider = $q.defer();

            var load = function() {
              $http(options).then(function(result){
                var data = result.data;
                if (data.hasOwnProperty('data')) {
                  dataprovider.notify(data.data);
                } else {
                  dataprovider.notify(data);
                }
                if (data.complete || !data.hasOwnProperty('complete')) {
                  dataprovider.resolve();
                } else if (data.hasOwnProperty('complete') && data.token) {

                  // incomplete async request
                  // make sure token is appended
                  if (!options.hasOwnProperty('params')) {
                    options.params = {};
                  }
                  options.params.token = data.token;

                  // wait 250ms before attempting to load more data
                  $timeout(function(){
                    load();
                  },250);
                }

              }, dataprovider.reject);

            };

            load();

            return dataprovider.promise;

          };
        }

        // setup sorting (also applied as deltas arrive)

        var sortData = function() {

          if (sortFunction && datasource.data.length) {

            datasource.bFiltering = true;

            var start = new Date();

            // if we are reversing the order, switch back for the sort
            if (datasource.sortOrder !== 'ASC') {
              datasource.data.reverse();
            }

            datasource.data = _.sortBy(datasource.data, sortFunction);

             // if we are reversing the order, reapply the reverse
            if (datasource.sortOrder !== 'ASC') {
              datasource.data.reverse();
            }

            var time = new Date() - start;
            $log.info('DATASOURCE: Sort ' + time + 'ms');

            if (!datasource.bPaused) {

              applyFilter();

            } else {

              // if data loading is paused we need to sort the already loaded data
              // then update pagination

              // if we are reversing the order, switch back for the sort
              if (datasource.sortOrder !== 'ASC') {
                datasource.viewData.reverse();
              }

              datasource.viewData = _.sortBy(datasource.viewData, sortFunction);

              // if we are reversing the order, reapply the reverse
              if (datasource.sortOrder !== 'ASC') {
                datasource.viewData.reverse();
              }

              applyPagination();
              datasource.bFiltering = false;
            }
          }

        };


        dsScope.$watch(function(){ return datasource.sortFunction; }, function(newSort) {
          sortFunction = newSort;
          sortData();
        });




        // watch the sort order
        var lastSortFn;

        dsScope.$watch(function(){ return datasource.sortOrder; }, function(newOrder){

          if (newOrder === 'DESC' || (lastSortFn && lastSortFn === sortFunction)) {

            datasource.data.reverse();
            datasource.viewData.reverse();
            applyPagination();
            datasource.bFiltering = false;

          }

          lastSortFn = sortFunction;

        });


        if (options.hasOwnProperty('pagination')) {
          // remove from request options
          paginationOptions = angular.extend({}, paginationDefaults,options.pagination );

          unwatchPaginationParams = dsScope.$watchCollection(function(){return options.pagination;}, function(newVal){
            // using replace instead of extend so we can delete props if required
            paginationOptions = angular.extend(paginationOptions, newVal);
            applyPagination();
          });

        }

        // watch option/params fields
        dsScope.$watchCollection(function(){ return options.request; }, function(newVal){

          // unbind param watcher if it exists
          if (unwatchRequestParams) { unwatchRequestParams(); }

          // setup new options
          requestOptions = angular.extend({}, requestDefaults, newVal);

          // watch the params if they exist
          if (requestOptions.hasOwnProperty('params')) {
            unwatchRequestParams = dsScope.$watchCollection(function(){ return  options.request.params; }, function(newVal){

              // using replace instead of extend so we can delete props if required
              requestOptions.params = newVal;
              if (datasource.bOptionsValid) {
                if (options.autoLoad) {
                  requestData();
                }
              }
            });
          }

          // only want to
          if (datasource.bOptionsValid && options.autoLoad) {
            requestData();
          }


        });


        // if our scope is destroyed cancel any outstanding requests
        dsScope.$on('$destroy', function(){
          if (cancelRequest) {
            cancelRequest.resolve();
          }
        });




        // debounce, in case something trigger multiple changes
        // this could happen if filter data changes and validation becomes valid
        // at the same time


        var requestData =  _.debounce( function(){

          $log.info('DATASOURCE: Starting new data load');

          $timeout(function(){


            if (datasource.bOptionsValid && datasource.bFilterValid) {

              if (datasource.bLoading) {
                if (angular.equals(datasource.currentRequestOptions, requestOptions)) {
                  // duplicate request, allow first to complete
                  return;
                }
                cancelRequest.resolve();
              }

              processingNewData = true;

              datasource.bLoading = true;
              datasource.data = [];
              datasource.pageData = [];
              datasource.viewData = [];
              datasource.pages = 0;

              cancelRequest = $q.defer();

              requestOptions.timeout = cancelRequest.promise;
              datasource.currentRequestOptions = angular.copy(requestOptions);

              var bSkipped = true;

              var prevProcessDataTime = 0;
              var prevProcessStartTime = 0;

              var preRequestTime = new Date();

              datasource.dataLoadingPromise =  options.requestDataFunction(requestOptions);

              datasource.dataLoadingPromise.then(function(){

                datasource.bLoading = false;

                // apply sort/filter/page in case sorting was skipped or in event data was returned
                // without any notify events

                if (bSkipped) {
                  if (sortFunction) {
                    sortData();
                  } else {
                    datasource.bFiltering = true;
                    applyFilter();
                  }
                }

                // wait for any currently processing filter to complete before continuing
                $q.when(applyFilterPromise).then(function(){

                  var time = new Date() - preRequestTime;
                  $log.info('DATASOURCE: Complete loading time: ' + time + 'ms');

                  processingNewData = false;

                  // execute onLoadComplete method on next digest cycle if it exists
                  // this will give grid time to render or in other uses make sure any
                  // other prereq code has run first
                  if (options.hasOwnProperty('onLoadComplete')) {
                    var start = new Date();
                    $timeout(function(){
                      options.onLoadComplete();
                      var time = new Date() - start;
                      $log.info('DATASOURCE: Load complete function: ' + time + 'ms');
                    },0);
                  }

                });

              }, function(){

                $log.warn('DATASOURCE: Request cancelled');
                datasource.bLoading = false;
                datasource.bFiltering = false;
                processingNewData = false;

              }, function(result){
                // notified of new data arriving...
                var start = new Date();

                // previously inserted at correct position instead of resorting
                // this appears to be slower than resorting with large data sets.

                // if (sortFunction) {

                //   // if we are reversing the order, switch back for the sort
                //   if (datasource.sortOrder !== 'ASC') {
                //     datasource.data.reverse();
                //   }

                //   // sort function is provided, use it to insert each item from the delta into the correct position
                //   for (var row, pos, rowIndex = 0, end = result.length; rowIndex < end; rowIndex++) {
                //     row = result[rowIndex];
                //     pos = _.sortedIndex(datasource.data, row, sortFunction);
                //     datasource.data.splice(pos,0,row);
                //   }

                //   // if we are reversing the order, switch back for the sort
                //   if (datasource.sortOrder !== 'ASC') {
                //     datasource.data.reverse();
                //   }

                // }


                datasource.data.push.apply(datasource.data,result);

                var time = new Date() - start;
                $log.info('DATASOURCE: Loading new data: ' + time + 'ms');

                // if previousProcess time was > 1s then skip processing
                if (prevProcessDataTime < 1000) {

                  if (sortFunction) {
                    sortData();
                  } else {
                    datasource.bFiltering = true;
                    applyFilter();
                  }

                  bSkipped = false;
                  prevProcessStartTime = start;
                  prevProcessDataTime = new Date() - start;

                } else {

                  bSkipped = true;

                  $log.info('DATASOURCE: skipping sort/filter due to previous process time');
                  // subtract load time from prev process time
                  prevProcessDataTime -= (new Date() - prevProcessStartTime);
                }

                prevProcessStartTime = start;

              });

            }
          }, 0);

        }, 100);



        // if the request valid expersion is provied, then watch it and update status as it changes
        if(options.hasOwnProperty('requestValid') && options.requestValid) {
          dsScope.$watch(options.requestValid, function(newVal){
            datasource.bOptionsValid = !!newVal;
            // if this has become valid then we should request new data
            if (datasource.bOptionsValid && options.autoLoad) {
              requestData();
            }
          });
        }


        // apply filter to create the view data
        var applyFilterTimeoutPromise = null;
        var applyFilterTimeoutDefer = null;

        var applyFilter = function() {

          if (applyFilterTimeoutDefer) {
            $timeout.cancel(applyFilterTimeoutPromise);
          } else {
            applyFilterTimeoutDefer = $q.defer();
          }

          // timeout will cause this to be "applied" during the next digest
          // needed due to _.debounce causing us to be out of digest cycle
          // we will cancel and recreate this timeout each time this is called
          // before the previous timeout expired

          applyFilterPromise = applyFilterTimeoutDefer.promise;

          applyFilterTimeoutPromise = $timeout(function(){

            var row, end, rowIndex = 0, newViewData = [];

            if (!datasource.bPaused) {

              var start = new Date();

              if (filterFunction) {

                for (end = datasource.data.length; rowIndex < end; rowIndex++) {
                  row = datasource.data[rowIndex];
                  if (filterFunction(row)) {
                    newViewData.push(row);
                  }
                }
                datasource.viewData = newViewData;

              } else {

                // we need to copy the array to prevent master data order being modified
                datasource.viewData = datasource.data.slice(0);

              }

              // apply the paged view (if configured)
              applyPagination();

              datasource.bFiltering = false;

              var time = new Date() - start;
              $log.info('DATASOURCE: Filter ' + time + 'ms');

            } else {

              if(filterFunction) {
                //  if paused we can only filter existing view data, not any new data

                for (end = datasource.viewData.length; rowIndex < end; rowIndex++) {
                  row = datasource.viewData[rowIndex];
                  if (filterFunction(row)) {
                    newViewData.push(row);
                  }
                }
                datasource.viewData = newViewData;
              }

            }

            applyFilterTimeoutDefer.resolve();
            applyFilterTimeoutDefer = null;

          }, 100); // end of timeout

          return applyFilterPromise;

        };


        var applyPagination = function() {

          // apply the pagination if requested.
          if (paginationOptions) {

            // dropdown will turn this into a string, fix it here...

            paginationOptions.perPage = parseInt(paginationOptions.perPage,10);

            if (!paginationOptions.perPage || paginationOptions.perPage <= 0) {
              paginationOptions.perPage = paginationDefaults.perPage;
            }

            datasource.pages = Math.ceil(datasource.viewData.length / paginationOptions.perPage);

            // make sure current page is in bounds
            datasource.currentPage = Math.min(datasource.currentPage, datasource.pages);


            // if page is set to 0 or less, and there is a page, fix it...
            if (datasource.currentPage <= 0) {
              datasource.currentPage = Math.min(1, datasource.pages);
            }

            pageBegin = paginationOptions.perPage * (datasource.currentPage - 1);

            pageEnd = Math.min(pageBegin + paginationOptions.perPage, datasource.viewData.length);

            datasource.pageData = datasource.viewData.slice(pageBegin, pageEnd);

          } else {

            // no pagination.
            // set page data to view data
            // and one or zero pages depending on if there are any records
            datasource.pageData = datasource.viewData;

            if (datasource.viewData.length) {
              datasource.pages = 1;
              datasource.currentPage = 1;
            } else {
              datasource.pages = 0;
              datasource.currentPage = 0;
            }

          }

        };


        var datasource = {

          bLoading: false,
          dataLoadingPromise: undefined,
          bFiltering: false,
          bFilterValid: true,
          bOptionsValid: true,
          bPaused: false,

          initialRequestOptions: options.request,
          currentRequestOptions: {},

          currentPage: 0,

          data: [],

          viewData: [],

          pageData: [],

          pages: 0,

          sortFunction: null,
          sortOrder: 'ASC',

          setPage: function(page) {
            datasource.currentPage = page;
            applyPagination();
          },

          loadData: function() {
            datasource.bPaused = false;
            requestData();
          },


          // newData is optional, if not passed match will be passed to the requestRow
          // function to get the data
          triggerRowReload: function(match, newData) {
            // resolve this promise with the new data
            var reloadPromise = $q.defer();

            // make sure the grid actually has data (in case auto load is disabled)
            if (datasource.dataLoadingPromise) {
              // make sure initial data is loaded before starting update/add
              datasource.dataLoadingPromise.then(function(){

                var newDataPromise = newData || requestRow(match);

                // load the new data
                $q.when(newDataPromise).then(function(data){

                  // if there is a record for this row update it, otherwise this is a new row!
                  var rowRecord = _.findWhere(datasource.data, match);
                  if (rowRecord) {
                    // if the data is null then remove the matching row
                    if (data) {
                      angular.extend(rowRecord, data);
                      $log.info('DATASOURCE: updating existing row', rowRecord);
                    } else {
                      $log.info('DATASOURCE: removing existing row', rowRecord);
                      datasource.data.splice(datasource.data.indexOf(rowRecord), 1);
                    }
                  } else {
                    // if we actually have data (i.e it isn't something that was
                    // deleted before it existed) add it to the data
                    if (data) {
                      $log.info('DATASOURCE: adding new row', data);
                      datasource.data.push(data);
                    }
                  }
                  // resort/paginate the data
                  sortData();
                  reloadPromise.resolve(data);

                }, reloadPromise.reject);

              });
            }

            return reloadPromise.promise;
          },

          cancelRequest: function() {
            if (cancelRequest) {
              cancelRequest.resolve();
            }
          },

          pause: function() {
            datasource.bPaused = true;
            datasource.bFiltering = false;
          },

          resume: function() {
            datasource.bPaused = false;
            datasource.bFiltering = true;
            applyFilter();
          }

        };



        // setup filtering
        if (options.hasOwnProperty('filter')) {

          // set the private vars to these values
          filterFunction = options.filter.filterFunction;

          // setup watcher on the valid expression
          // needs to happen before the watch on the filter collection
          if (options.hasOwnProperty('filterValid')) {
            unwatchValidFilter = dsScope.$watch(options.filterValid, function(newVal){
              datasource.bFilterValid = !!newVal;
              if(!datasource.bLoading && datasource.bFilterValid) {
                datasource.bFiltering = true;
                applyFilter();
              }
            });
          }

          // setup a watcher on the filter fields to invoke appyFilter on a change
          // if a valid expression is provided, check it is valid before applying filter
          unwatchFilter = dsScope.$watchCollection(function(){return options.filter.values;}, function(){
            if (datasource.bFilterValid) {
              datasource.bFiltering = true;
              applyFilter();
            }
          });

        }

        return datasource;
      }

    };

    // Public API here
    return _public;

  }]);
