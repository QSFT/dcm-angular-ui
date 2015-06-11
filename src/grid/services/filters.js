'use strict';

/**
 * @ngdoc service
 * @name filters
 * @module dcm-ui.grid
 *
 * @description
 * Factory that creates and configures filters for a datasource
 *
 */

angular.module('dcm-ui.grid')
  .factory('filters', ['$interpolate', function($interpolate) {
    // Service logic
    // ...

    var valueOrEmptyString = function(val, val2) {
      if (val === undefined) {
        if (val2 === undefined) {
          return '';
        } else {
          return val2;
        }
      } else {
        return val;
      }
    };



    // var isValid = function(val) {
    //   if (val && val.toString() !== '') {
    //     return true;
    //   }
    //   return false;
    // };


    var _public = {



      /**
       * @ngdoc method
       * @name filters#new
       *
       * @description
       * creates a new filter object and returns it
       *
       * @param {object} scope - scope that the datasource and filter will be bound to
       * @returns {object} Filter object
       */

      new: function(scope) {

        var filter = {
          data: {},
          defaultValues: {},
          defaultParams: {},
          values: {},
          requestParams: {},
          filterFunctions: []
        };

        filter.resetFilters = function(){
          angular.extend(filter.values, filter.defaultValues);
          angular.extend(filter.requestParams, filter.defaultParams);
        };

        filter.addDefaultValue = function(field, value) {
          filter.defaultValues[field] = valueOrEmptyString(value);
          filter.values[field] = filter.defaultValues[field];
        };

        filter.addDefaultParam = function(field, value) {
          filter.defaultParams[field] = valueOrEmptyString(value);
          filter.requestParams[field] = filter.defaultParams[field];
        };

        filter.onChange = function(type, field, fn) {
          scope.$watch(function(){ return filter[type][field]; }, function(newVal, oldVal){
            fn(newVal, oldVal);
          });
        };

        filter.onCollectionChange = function(type, field, fn) {
          scope.$watchCollection(function(){ return filter[type][field]; }, function(newVal, oldVal){
            fn(newVal, oldVal);
          });
        };



        filter.addFilterExactMatch = function(idField) {

          filter.filterFunctions.push(
            function(oFilterData, oRowData) {
              if (oFilterData[idField] !== '') {
                if (oFilterData[idField].toString() !== oRowData[idField].toString()) {
                  return false;
                }
              }
              return true;
            }
          );

        };

        filter.addFilterExactMatchObject = function(idField, matchObject) {

          filter.filterFunctions.push(
            function(oFilterData, oRowData) {

              if (filter.data[matchObject]) {

                if (!filter.data[matchObject][oRowData[idField]]) {
                  return false;
                }
              }

              return true;
            }

          );

        };

        filter.addFilterExactMatchArray = function(idField, aFields) {
          filter.filterFunctions.push(
            function(oFilterData, oRowData) {
              if (oFilterData[idField] && oFilterData[idField] !== '') {
                var matched = false;
                _.each(aFields, function(fld) {
                  if ( oFilterData[idField].toString() === oRowData[fld].toString() ) {
                    matched = true;
                  }
                });
                return matched;
              }
              return true;
            }

          );
        };


        filter.addFilterInteger = function(idField, compareType) {

          var comparator;

          switch(compareType) {

          case 'lt':
            comparator = function(a, b) { return a < b; };
            break;

          case 'gt':
            comparator = function(a, b) { return a > b; };
            break;

          case 'eq':
            comparator = function(a, b) { return a === b; };
            break;

          }

          filter.filterFunctions.push(
            function(oFilterData, oRowData) {
              if (oFilterData[idField] !== '') {
                if (!comparator(parseInt(oRowData[idField],10), parseInt(oFilterData[idField],10)) ) {
                  return false;
                }
              }
              return true;
            }
          );

        };

        filter.addFilterPartialMatch = function(idField, interpolationString) {
          var interpolate, strSearch;
          if (interpolationString) {
            interpolate = $interpolate(interpolationString);
          }
          filter.filterFunctions.push(
            function(oFilterData, oRowData) {
              if (oFilterData[idField] !== '') {
                if (interpolationString){
                  strSearch = interpolate(oRowData);
                } else {
                  strSearch = oRowData[idField];
                }
                if (!strSearch || strSearch.toLowerCase().indexOf(oFilterData[idField].toLowerCase()) === -1) {
                  return false;
                }
              }
              return true;
            }
          );
        };

        filter.addFilterExactPartialMatch = function(idField, interpolationString) {
          var interpolate, strSearch;
          if (interpolationString) {
            interpolate = $interpolate(interpolationString);
          }
          filter.filterFunctions.push(
            function(oFilterData, oRowData) {
              if (oFilterData[idField] !== '') {
                if (interpolationString){
                  strSearch = interpolate(oRowData);
                } else {
                  strSearch = oRowData[idField];
                }
                if (strSearch.toLowerCase().indexOf(oFilterData[idField].toLowerCase()) !== 0) {
                  return false;
                }
              }
              return true;
            }
          );
        };

        // filter when value field matches the required value (for checkboxes)
        filter.addFilterWhenValueIs = function(field, requiredValue) {
          requiredValue = requiredValue.toString();
          filter.filterFunctions.push(
            function(oFilterData, oRowData) {
              if (oFilterData[field] && oFilterData[field].toString() === requiredValue) {
                if (oRowData[field].toString() !== requiredValue) {
                  return false;
                }
              }
              return true;
            }
          );

        };


        filter.setData = function(field, data) {
          filter.data[field] = data;
        };

        filter.filterFunction = function(oRowData) {
          var bDisplay = true;
          var values = angular.extend({}, filter.requestParams, filter.values);
          for (var i=0, len = filter.filterFunctions.length; i < len; i++) {
            if (bDisplay) {
              bDisplay = filter.filterFunctions[i](values, oRowData);
            } else {
              return bDisplay;
            }
          }
          return bDisplay;
        };

        filter.addStandardTextSearchFilter = function(field, interpolationString) {
          filter.addDefaultValue(field, '');
          filter.addFilterPartialMatch(field, interpolationString);
        };

        filter.addExactPartialTextSearchFilter = function(field, interpolationString) {
          filter.addDefaultValue(field, '');
          filter.addFilterExactPartialMatch(field, interpolationString);
        };

        return filter;

      }


    };



    // Public API here
    return _public;

  }]);
