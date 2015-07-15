'use strict';

/**

 * @ngdoc directive
 * @name dcmGridColumn
 * @module dcm-ui.grid
 * @restrict E
 *
 * @description
 * Creates a grid column. The contents of this tag will be compiled. Any attributes
 * that aren't params will be duplicated onto this cell in each row.
 *
 * @usage
 * ```html
 * <dcm-grid-column foo="bar">{{someField}}</dcm-grid-column>
 * ```
 *
 * @param {string} title - title for the col header
 * @param {string=} field - a field from the row data to either use as the sort value.
 If no content is provided to this element this field will be interpolated into this col in the grid.
 * @param {string=} width - if specified will be put into a style="width: ;" on the col
 * @param {string=} sort-type - if sorting on the grid is enabled this allows you to
 override the default sorting type for this col
 * @param {string=} [sort-default=ASC] - makes this col the default sort for the grid, may be ASC
 or DESC
 *
 */

angular.module('dcm-ui.grid')
  .directive('dcmGridColumn', [function () {
    return {
      require: '^dcmGrid',
      restrict: 'E',
      scope: {
        field:'@',
        title:'@',
        width:'@',
        enabled: '@',
        sortType: '@',
        sortDefault: '@',
        resizable: '@'
      },
      compile: function(tElement, tAttrs) {

        var content = $.trim(tElement.html());

        return function(scope, element, attrs, dcmGridCtrl) {

          // copy over any attributes that aren't in our scope
          var attributes = {};
          angular.forEach(attrs, function(obj, key){
            if (key[0] !== '$' && scope[key] === undefined && obj !== '') {
              attributes[key.replace(/([A-Z])/g,'-$1').toLowerCase()] = obj;
            }
          });

          var col = {
            content: content,
            attributes: attributes,
            enabled: attrs.enabled !== undefined ? (attrs.enabled.toLowerCase() !== 'false') : true,
            title: scope.title,
            width: scope.width,
            resizable: attrs.resizable !== undefined ? (attrs.resizable.toLowerCase() !== 'false') : true,
            field: attrs.field,
            sortType: scope.sortType || '',
            sortDefault: attrs.sortDefault !== undefined ? attrs.sortDefault || 'ASC' : false
          };

          // if no field is specified try and infer it from the content
          if (!attrs.field || attrs.field === '') {
            var aField = content.match(/^\s*{{\s*(\S+)\s*}}\s*$/);
            if (aField) {
              col.field = aField[1];
            }
          }

          // if no title was specified try and infer it from the field being used
          if (tAttrs.title === undefined && (col.field && col.field !== '')) {
            col.title = col.field[0].toUpperCase() + col.field.slice(1);
          }

          dcmGridCtrl.addColumn(col);

        };
      }
    };
  }]);
