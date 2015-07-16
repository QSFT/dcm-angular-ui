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

    var valueOrEmptyString = function(val) {
      if (val === undefined) {
        return '';
      } else {
        return val;
      }
    };


    // combine + dedupe fields to search
    var combineFields = function(additionalFields, idField) {

      var oFields = {};
      var aRet = [];

      // add idfeild to returned fields
      oFields[idField] = true;

      // add any additional fields
      if (additionalFields && angular.isArray(additionalFields) && additionalFields.length) {
        for (var i = 0; i < additionalFields.length; i++) {
          oFields[additionalFields[i]] = true;
        }
      }

      for (var field in oFields) {
        aRet.push(field);
      }

      return aRet;

    };




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
          scope.$watch(function(){ return filter[type][field]; }, fn);
        };

        filter.onCollectionChange = function(type, field, fn) {
          scope.$watchCollection(function(){ return filter[type][field]; }, fn);
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

        filter.addFilterExactMatch = function(idField, interpolationStringOrAdditionalFields) {
          var comparator = function(searchString, queryString) {
            if (searchString && searchString.toLowerCase() === queryString.toLowerCase()) {
              return true;
            } else {
              return false;
            }
          };
          filter.addFilterWithComparator(comparator, idField, interpolationStringOrAdditionalFields);
        };

        filter.addFilterPartialMatch = function(idField, interpolationStringOrAdditionalFields) {
          var comparator = function(searchString, queryString) {
            if (searchString && searchString.toLowerCase().indexOf(queryString.toLowerCase()) !== -1) {
              return true;
            } else {
              return false;
            }
          };
          filter.addFilterWithComparator(comparator, idField, interpolationStringOrAdditionalFields);
        };

        // can only have interpolation string or additional search fields
        filter.addFilterWithComparator = function(comparator, idField, interpolationStringOrAdditionalFields) {

          var interpolate, searchFields;

          // interpolation string provided
          if (interpolationStringOrAdditionalFields && !angular.isArray(interpolationStringOrAdditionalFields)) {

            interpolate = $interpolate(interpolationStringOrAdditionalFields);

          // just a regular field search (possibly with extra fields to check)
          } else {

            searchFields = combineFields(interpolationStringOrAdditionalFields, idField);

          }


          filter.filterFunctions.push(
            function(oFilterData, oRowData) {
              // check they have entered search text
              if (oFilterData[idField] !== '') {

                var queryString = oFilterData[idField];
                var searchField;

                // search interpolated string
                if (interpolate){

                  searchField = interpolate(oRowData);
                  if (comparator(searchField, queryString)) {
                    return true;
                  }

                // otherwise search the search fields
                } else {
                  for (var i=0; i < searchFields.length; i++) {
                    searchField = oRowData[searchFields[i]];
                    if (comparator(searchField, queryString)) {
                      return true;
                    }
                  }
                }
                return false;

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

        filter.addStandardTextSearchFilter = function(field, interpolationStringOrAdditionalFields) {
          filter.addDefaultValue(field, '');
          filter.addFilterPartialMatch(field, interpolationStringOrAdditionalFields);
        };

        filter.addExactTextSearchFilter = function(field, interpolationStringOrAdditionalFields) {
          filter.addDefaultValue(field, '');
          filter.addFilterExactMatch(field, interpolationStringOrAdditionalFields);
        };

        return filter;

      }


    };



    // Public API here
    return _public;

  }]);
