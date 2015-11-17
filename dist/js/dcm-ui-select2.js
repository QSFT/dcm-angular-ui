'use strict';

/**
 * @ngdoc module
 * @name dcm-ui.select2
 * @description
 *
 * The `dcm-ui.select2` module provides a wrapper to the select2 jQuery library
 *
 * @example
   <example name="select2-demo" module="dcm-ui.select2">
    <file name="index.html">
      <div ng-controller="Select2ExampleCtrl">

        <input
          type="hidden"
          dcm-select2="{allowClear: true, placeholder: 'Select something...'}"
          data="tableData"
          ng-model="selectedId"
          model-selected="selected"
          class="input-large"
          id-field="uuid"
          text-field="name"
          icon-field="icon"
        >

        <div>Selected: {{selected.name}} - {{selectedId}}</div>

      </div>

    </file>
    <file name="script.js">
      angular.module('dcm-ui.select2')
        .controller('Select2ExampleCtrl', ['$scope',
          function ($scope) {

          $scope.tableData = [
            {name: 'James Andersen', age: 41, uuid: 'ad6d4f60-27dd-41a4-bc58-4b66eb8cc2f7'},
            {name: 'Albertine Roquefort', age: 19, uuid: 'a3483f04-6d88-4cab-94e8-f37d47140112'},
            {name: 'Harry Elfsport', age: 52, uuid: '752501b5-8c9c-4bf8-8dbf-549d247c54de'},
            {icon: 'fa fa-android', name: 'Mojune Starkadder', age: 27, uuid: 'ed788226-7fd5-4c64-8065-63e88b5414df'},
            {icon: 'fa fa-android', name: 'Julia Hazeldene', age: 84, uuid: 'da428eb5-3b7d-4c21-8b04-b0deaf54c4a0'}
          ];

        }]);

    </file>
  </example>
 */
angular.module('dcm-ui.select2', []);
'use strict';


/**
 * @ngdoc directive
 * @name dcmSelect2
 * @module dcm-ui.select2
 * @restrict A
 *
 * @description
 * Wraps the jquery select2 utility.
 *
 * NOTE: needs much more documentation!
 *
 * @usage
 ```html
   <input
      type="hidden"
      dcm-select2="{json object to pass into select2 as options}"
      data="array of data or promise for data"
      ng-model="binding for selected id"
      selected-opt-group="(optional) binding for the currently selected opt group text"
      opt-group-id-field="(optional, defaults to id) id field that uniquely identifies the opt group"
      class="input-large"
      icon-field="(optional, defaults to icon) field containing class to add to icon for an item"
      id-field="(optional, defaults to id) field containing id for an item"
      text-field="(optional, defaults to text) field containing text for an item"
    >
  ```
 */

angular.module('dcm-ui.select2')
  .constant('SELECT2', {
    events: {
      close: 'CLOSE_SELECT2'
    }
  })
  .directive('dcmSelect2', ['$q', '$filter', '$parse', 'SELECT2',
    function ($q, $filter, $parse, SELECT2) {

    return {
      restrict: 'A',
      replace: false,
      require: 'ngModel',
      scope: false,
      transclude: false,
      compile: function compile(tElement) { // tElement , tAttrs, transclude

        if (!tElement.is('input[type=hidden]')) {
          throw('only <input type="hidden"> tags can have this attribute');
        }

        return function postLink(scope, element, attrs, modelController) { //

          var idField = attrs.idField || 'id';
          var textField = attrs.textField || 'text';
          var iconField = attrs.iconField || 'icon';

          var modelObjectSetter = (attrs.modelSelected) ? $parse(attrs.modelSelected).assign : angular.noop;

          var optGroupSetter = (attrs.selectedOptGroup) ? $parse(attrs.selectedOptGroup).assign : angular.noop;
          var optGroupGetter = (attrs.selectedOptGroup) ? $parse(attrs.selectedOptGroup) : angular.noop;
          var optGroupIdField = attrs.optGroupIdField || 'id';

          var cachedData;
          var bUseCachedData;

          var opts = {};

          // on first data request, check to see if data is a function
          // if it is a function cache the result. otherwise return the actual data from the scope
          var getData = function() {

            if (bUseCachedData === undefined) {

              var data = $parse(attrs.data)(scope);

              // if the data is a function, we only want to evaluate it once
              if (angular.isFunction(data)) {
                cachedData = data();
                bUseCachedData = true;
              } else {
                bUseCachedData = false;
              }

            }

            if (bUseCachedData) {
              return cachedData;
            } else {
              return $parse(attrs.data)(scope);
            }

          };


          // make array of all items with an id and their children
          var getSelectableData = function(rawData) {
            var data = [];
            angular.forEach(rawData, function(obj){

              // don't push objects without the id field (not selectable)
              if (obj.hasOwnProperty(idField)) {
                data.push(obj);
              }

              // add any children to the pile of valid data
              if (obj.hasOwnProperty('children') && angular.isArray(obj.children) &&
                obj.children.length) {

                data.push.apply(data,obj.children);

              }

            });

            return data;

          };

          var validateSelection = function(rawData, selection) {

            var retData = {
              objectData: null,
              idData: ''
            };


            // loop over the rawData and add any child nodes to the list of objects to be checked
            var data = getSelectableData(rawData);

            // we need different logic if this is a multiple select
            if (!opts.multiple) {

              selection = selection ? selection : '';

              // check to make sure selected object exists in data
              angular.forEach(data, function(obj){
                if (obj[idField].toString() === selection.toString()) {

                  // set the opt group
                  optGroupSetter(scope, obj[optGroupIdField]);

                  retData.objectData = obj;
                  retData.idData = selection;
                  return;
                }
              });

              return retData;

            } else {

              selection = selection ? selection : [];

              var aMultipleId = [];
              var aMultipleObj = [];
              var oMultiple = {};

              // get keys for all currently selected objects
              angular.forEach(selection, function(selectedObj){
                oMultiple[selectedObj.toString()] = true;
              });

              // go through and check data exists for all selected objects
              angular.forEach(data, function(obj){
                if (oMultiple.hasOwnProperty(obj[idField].toString())) {
                  aMultipleId.push(obj[idField]);
                  aMultipleObj.push(obj);
                }
              });

              retData.objectData = aMultipleObj;
              retData.idData = aMultipleId;

              return retData;

            }

          };


          var isBlank = function(val) {
            if (!val) {
              return true;
            }
            if (angular.isArray(val) && val.length === 0 ) {
              return true;
            }
            return false;
          };

          var options = {

            dropdownAutoWidth: false,

            width: 'off',

            query: function(options) {
              $q.when(getData()).then(function(data){

                var returnData = [];

                if (!data) {
                  data = [];
                }

                // var filterParams = {};
                // filterParams[textField] = options.term;

                // no filter specified
                if (!options.term || options.term === '') {

                  returnData = data.slice(0);

                } else {

                  var searchVal = options.term.toLowerCase();

                  angular.forEach(data, function(dataRecord) {

                    // need to copy each record so we don't modify it...
                    var record = angular.copy(dataRecord);

                    var bAdd = false;
                    var children = record.children;

                    record.children = [];

                    if (record[textField].toString().toLowerCase().indexOf(searchVal) !== -1) {
                      bAdd = true;
                    }

                    // if there are children to consider, see if any match
                    if (children && angular.isArray(children)) {
                      angular.forEach(children, function(child) {

                        if (child[textField].toString().toLowerCase().indexOf(searchVal) !== -1) {
                          bAdd = true;
                          record.children.push(child);
                        }

                      });
                    }

                    // if something from this record matched then add it
                    if (bAdd) {
                      returnData.push(record);
                    }


                  });

                }

                // if there is a "selected opt group". try and move it to the top of the query results
                var selectedOptGroup = optGroupGetter(scope);
                if (selectedOptGroup) {
                  var whereMatcher = {};
                  whereMatcher[optGroupIdField] = selectedOptGroup;
                  var optGroup = _.findWhere(returnData,whereMatcher);
                  // if this opt group still exists in the data..
                  if (optGroup) {
                    var idx = _.indexOf(returnData, optGroup);
                    returnData.splice(idx,1);
                    returnData.splice(0,0,optGroup);
                  }
                }

                options.callback({
                  more: false,
                  results: returnData
                });

              });
            },

            formatResult: function(result, container, query, escapeMarkup) {
              var markup=[];
              window.Select2.util.markMatch(result[textField], query.term, markup, escapeMarkup);
              var text = markup.join('');
              if (result[iconField]) {
                text = '<i class="select2-inline-icon ' + result[iconField] + '"></i> ' + text;
              }
              return text;
            },

            formatSelection: function (data, container, escapeMarkup) {
              var text = escapeMarkup(data[textField]);
              if (data[iconField]) {
                text = '<i class="select2-inline-icon ' + data[iconField] + '"></i> ' + text;
              }
              return text;
            },

            id: function(obj) {
              return obj[idField];
            },

            // this is called on initial load and also whenever the val() method is called
            initSelection: function(el, callback) {

              // get the value from the model (if a model is provided)
              var initialVal = scope.$eval(attrs.ngModel);

              // if the data is a promise then wait for it to resolve
              $q.when(getData()).then(function(data){

                var oData = validateSelection(data, initialVal);

                // return the callback with the actual object
                callback(oData.objectData);
                // update the view value in the model without setting it dirty
                modelController.$viewValue = oData.idData;
                // set the selected object in the model
                modelObjectSetter(scope, oData.objectData);

                // update the model if required (intial value was invalid)
                // also sets it if it was previously undefined
                if (isBlank(oData.idData)) {
                  $parse(attrs.ngModel).assign(scope, oData.idData);
                }

              });



            },


            /* we should either use the internationalzation from select2 or override these */
            // formatNoMatches: function () { return 'No matches found'; },
            // formatInputTooShort: function (input, min) { var n = min - input.length; return 'Please enter ' + n + ' more character' + (n == 1? '' : 's'); },
            // formatInputTooLong: function (input, max) { var n = input.length - max; return 'Please delete ' + n + ' character' + (n == 1? '' : 's'); },
            // formatSelectionTooBig: function (limit) { return 'You can only select ' + limit + ' item' + (limit == 1 ? '' : 's'); },
            // formatLoadMore: function () { return 'Loading more results...'; },
            formatSearching: function () { return 'Loading...'; }

          };


          angular.extend(opts, options, scope.$eval(attrs.dcmSelect2));
          element.select2(opts);

          // watch options for updates
          scope.$watch($parse(attrs.dcmSelect2), function(newOpts, oldOpts){
            if (newOpts && newOpts !== oldOpts) {
              angular.extend(opts, newOpts);
              element.select2(opts);
            }
          });


          // the change event should only occur when the user changes the selection
          element.on('change', function(evt){
            // update model to the new value (and set form/element dirty if required)

            scope.$apply(function(){

              // update the form field controller
              modelController.$setViewValue(evt.val);
              // set the model
              $parse(attrs.ngModel).assign(scope, evt.val);
              // set the selected object in the model
              modelObjectSetter(scope, element.select2('data'));

              // set the sticky value if provided
              if (attrs.sticky) {
                $parse(attrs.sticky).assign(scope, evt.val);
              }

            });

          });


          // watch the disabled attribute
          attrs.$observe('disabled', function (value) {
            element.select2('enable', !value);
          });

          // watch the readonly attribute
          attrs.$observe('readonly', function (value) {
            element.select2('readonly', !!value);
          });

          // watch model for changes, and change selection if required
          scope.$watch($parse(attrs.ngModel), function(value) {
            // update select2 to reflect model change

            if (isBlank(value)) {
              var blankVal = opts.multiple ? [] : '';
              var blankData = opts.multiple ? [] : null;
              // make sure the model is set correctly
              if (!angular.equals(value, blankVal)) {
                $parse(attrs.ngModel).assign(scope, blankVal);
              }
              element.select2('data',blankData, false); // will not trigger initSelection
              modelObjectSetter(scope, blankData); // clear model-selection as init isn't called
            } else {
              // set the sticky in case the data isn't ready yet
              if (attrs.sticky) {
                $parse(attrs.sticky).assign(scope, value);
              }
              element.select2('val',value, false);
            }

          });

          // watch selected object in the model for changes
          if (attrs.modelSelected) {
            scope.$watch($parse(attrs.modelSelected), function(value) {
              if (!angular.equals(value,element.select2('data')) ) {
                element.select2('data',value, false);
                var selectedID = element.select2('val');
                modelController.$viewValue = selectedID;
                $parse(attrs.ngModel).assign(scope, selectedID);
              }
            });
          }


          // if the data changes make sure our value is still valid
          scope.$watchCollection(getData, function(val) {


            // if it's not defined yet set it to an empty string
            var currentVal = element.select2('val');

            // we need to check the value if there is one set, or if there isn't one set, set the sticky if defined
            if (attrs.sticky || !isBlank(currentVal) ) {

              // if it changed to a promise, then we need to wait for it to finish...
              $q.when(val).then(function(newData){

                var oData;

                var validateValue = currentVal;

                // if we need to attempt setting to the sticky...
                if (attrs.sticky && isBlank(currentVal)) {
                  validateValue = $parse(attrs.sticky)(scope);
                }

                oData = validateSelection(newData, validateValue);

                if (!angular.equals(currentVal, oData.idData)) {

                  // clear the selection
                  element.select2('data', oData.objectData, false);
                  modelObjectSetter(scope,oData.objectData);
                  modelController.$viewValue = oData.idData;
                  $parse(attrs.ngModel).assign(scope, oData.idData);

                }

              });

            }

          });


          scope.$on('$destroy',function(){
            element.select2('destroy');
          });

          scope.$on(SELECT2.events.close,function(){
            element.select2('close');
          });


        };

      }
    };
  }]);
