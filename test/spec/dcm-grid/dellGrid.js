'use strict';

describe('Directive: dcmGrid,', function () {

  var scope, compile, $rootScope, $q, $timeout;
  //, host;

  beforeEach(module('dcm-ui'));

  beforeEach(inject(function (_$rootScope_, $compile, _$q_, _$timeout_) {

    $rootScope = _$rootScope_;
    $q = _$q_;
    $timeout = _$timeout_;

    scope = $rootScope.$new();



    compile = $compile;

    scope.testData = [
      { roleId: 2, name: 'Admin', description: 'Full access', date: '2013-10-30T16:04:18Z'},
      { roleId: 1, name: 'Cloud Resource Manager', description: 'Full access to cloud resources', date: '2013-10-30T16:04:18Z' },
      { roleId: 3, name: 'Basic User', description: 'Full access to Images, VMs, Volumes, Snapshots, and Infrastructure stacks', date: '2013-10-30T16:04:18Z' },
      { roleId: 4, name: 'Limited User', description: 'Full view access, full write access to own cloud resources', date: '2013-10-30T16:04:18Z' },
      { roleId: 5, name: 'View Only Cloud', description: 'A full view only access to cloud resources', date: '2013-10-30T16:04:18Z' }
    ];


    // create a host div in the actual dom
    // host = $('<div id="host"></div>');
    // $('body').append(host);

  }));


  // afterEach(function() {
  //   // remove host div
  //   host.remove();
  // });




  describe('basic grid', function(){

    var element;

    beforeEach(function(){
      element = angular.element(
        '<dcm-grid datasource="testData">' +
          '<dcm-grid-row some-attribute="defined">' +
            '<dcm-grid-column field="name" title="Name" width="15%">{{name}}</dcm-grid-column>' +
            '<dcm-grid-column field="roleId" width="5%">{{roleId}}</dcm-grid-column>' +
            '<dcm-grid-column field="description">{{description}}</dcm-grid-column>' +
            '<dcm-grid-column some-other-attribute="defined" field="description"  title="">{{description}}</dcm-grid-column>' +
          '</dcm-grid-row>' +
        '</dcm-grid>'
      );
      compile(element)(scope);
      scope.$digest();

    });

    it('should render a basic grid with one header row', function(){
      var headerRow = element.find('thead tr');
      expect(headerRow.length).toBe(1);
    });


    it('should render a basic grid with one header for each col', function(){
      var headerCells = element.find('thead tr th');
      // one for each col plus two bonuses ones (one for radio and one for selected flag)
      expect(headerCells.length).toBe(4);
      expect(headerCells.eq(0).text()).toBe('Name');
      expect(headerCells.eq(3).text()).toBe('');
    });


    it('should use the field name (if provide) if no title is provided', function(){
      var headerCells = element.find('thead tr th');
      // one for each col plus two bonuses ones (one for radio and one for selected flag)
      expect(headerCells.length).toBe(4);
      expect(headerCells.eq(1).text()).toBe('RoleId');

    });

    it('should not use the field name if a blank title is provided', function(){
      var headerCells = element.find('thead tr th');
      // one for each col plus two bonuses ones (one for radio and one for selected flag)
      expect(headerCells.length).toBe(4);
      expect(headerCells.eq(3).text()).toBe('');
    });

    it('should render a basic grid with one row in the tbody for each row in the data', function(){
      var bodyRows = element.find('tbody tr');
      expect(bodyRows.length).toBe(5);
    });

    it('should duplicate attributes from dcm-grid-row', function(){
      var bodyRow = element.find('tbody tr').eq(0);
      expect(bodyRow.attr('some-attribute')).toBe('defined');
    });

    it('should duplicate attributes from dcm-grid-col', function(){
      var bodyRow = element.find('tbody tr').eq(0);
      expect(bodyRow.find('td').eq(3).attr('some-other-attribute')).toBe('defined');
    });


    it('should render cell content matching the data ', function(){
      var bodyRows = element.find('tbody tr');
      expect(bodyRows.eq(1).find('td').eq(0).text()).toBe('Cloud Resource Manager');
      expect(bodyRows.eq(4).find('td').eq(2).text()).toBe('A full view only access to cloud resources');
      expect(bodyRows.length).toBe(5);
    });


    it('should update table contents if data changes', function(){

      var backupData = scope.testData;
      var bodyRows;


      var ds2 = [scope.testData[2], scope.testData[3], scope.testData[1]];
      scope.testData = ds2;
      scope.$digest();

      bodyRows = element.find('tbody tr');
      expect(bodyRows.eq(0).find('td').eq(0).text()).toBe('Basic User');
      expect(bodyRows.eq(2).find('td').eq(0).text()).toBe('Cloud Resource Manager');
      expect(bodyRows.length).toBe(3);



      var ds3 = [backupData[1], backupData[3]];
      scope.testData = ds3;
      scope.$digest();

      bodyRows = element.find('tbody tr');
      expect(bodyRows.eq(0).find('td').eq(0).text()).toBe(ds3[0].name);
      expect(bodyRows.eq(1).find('td').eq(0).text()).toBe(ds3[1].name);
      expect(bodyRows.length).toBe(ds3.length);


      var ds4 = [backupData[4], backupData[3]];
      scope.testData = ds4;
      scope.$digest();

      bodyRows = element.find('tbody tr');
      expect(bodyRows.eq(0).find('td').eq(0).text()).toBe(ds4[0].name);
      expect(bodyRows.eq(1).find('td').eq(0).text()).toBe(ds4[1].name);
      expect(bodyRows.length).toBe(ds4.length);



      scope.testData = backupData;
      scope.$digest();

      var ds5 = [backupData[2], backupData[0], backupData[1], backupData[3], backupData[4]];
      scope.testData = ds5;
      scope.$digest();

      bodyRows = element.find('tbody tr');
      expect(bodyRows.eq(0).find('td').eq(0).text()).toBe(ds5[0].name);
      expect(bodyRows.eq(1).find('td').eq(0).text()).toBe(ds5[1].name);
      expect(bodyRows.eq(2).find('td').eq(0).text()).toBe(ds5[2].name);
      expect(bodyRows.length).toBe(ds5.length);


    });




    // commenting out, don't need this behaviour yet.
    // will need watchers for each row. potentially deep watchers if we want to support nested props
    it('should update cell content if data changes ', function(){

      var bodyRows = element.find('tbody tr');

      scope.$digest();

      expect(bodyRows.eq(1).find('td').eq(0).text()).toBe('Cloud Resource Manager');

      scope.testData[1].name = 'Clown Resource Manager';

      scope.$digest();

      expect(bodyRows.eq(1).find('td').eq(0).text()).toBe('Clown Resource Manager');
      expect(bodyRows.eq(2).find('td').eq(0).text()).toBe('Basic User');

    });


  });


  describe('selectable grid', function(){

    var element;

    beforeEach(function(){

      scope.selected = [];
      scope.active = undefined;

      element = angular.element(
        '<dcm-grid datasource="testData" active-row="active" selected="selected">' +
          '<dcm-grid-column field="name" title="Name" width="15%"></dcm-grid-column>' +
          '<dcm-grid-column field="roleId"  width="5%"></dcm-grid-column>' +
          '<dcm-grid-column field="description" title="Description"></dcm-grid-column>' +
        '</dcm-grid>'
      );
      compile(element)(scope);
      scope.$digest();

    });


    it('should render a basic grid with one cell for each col plus one for select and active fields in the thead', function(){
      var headerCells = element.find('thead tr th');
      // one for each col plus two bonuses ones (one for radio and one for selected flag)
      expect(headerCells.length).toBe(5);
      expect(headerCells.eq(1).text()).toBe('Name');
      expect(headerCells.eq(5).text()).toBe('');
    });


    it('should render a basic grid with one cell in the tbody for each row in the data plus one for active and select fields', function(){
      var headerCells = element.find('tbody tr:first td');
      expect(headerCells.length).toBe(5);
    });


    it('should initially have nothing selected or active', function(){
      expect(scope.active).toBe(undefined);
      expect(scope.selected).toEqual([]);
    });

    it('should set active a row we click on', function(){

      scope.selected = scope.testData[3];

      element.find('tbody tr').eq(3).trigger('click');
      expect(scope.active).toBe(scope.testData[3]);

      element.find('tbody tr').eq(4).trigger('click');
      expect(scope.active).toBe(scope.testData[4]);

    });


    it('should set active a row we click on after the row has been re-rendered (from cache)', function(){

      scope.saveData = scope.testData;
      scope.testData = [];

      scope.$digest();

      var bodyRows = element.find('tbody tr');
      expect(bodyRows.length).toBe(0);

      // these should have html cached now
      scope.testData = scope.saveData;

      scope.$digest();

      bodyRows = element.find('tbody tr');
      expect(bodyRows.length).toBe(5);

      element.find('tbody tr').eq(3).trigger('click');
      expect(scope.active).toBe(scope.testData[3]);

    });


    it('should set active/inactive a row if we set it active/inactive in the model', function(){

      scope.active = scope.testData[3];
      scope.$digest();
      expect(element.find('tbody tr').eq(3).is('.active')).toBe(true);

      scope.active = undefined;
      scope.$digest();

      expect(element.find('tbody tr').eq(3).is('.active')).toBe(false);

    });


    it('should select/deselect any rows we check/uncheck the checkboxes for', function(){

      element.find('tbody tr').eq(3).find('td').eq(4).find('i').trigger('click');
      expect(scope.selected).toEqual([scope.testData[3]]);
      element.find('tbody tr').eq(4).find('td').eq(4).find('i').trigger('click');
      expect(scope.selected).toEqual([scope.testData[3],scope.testData[4]]);

      element.find('tbody tr').eq(3).find('td').eq(4).find('i').trigger('click');
      expect(scope.selected).toEqual([scope.testData[4]]);
      element.find('tbody tr').eq(4).find('td').eq(4).find('i').trigger('click');
      expect(scope.selected).toEqual([]);

    });


    it('should select/deselect all on clicking the checkbox in the header', function(){

      // nothing should be selected initially
      expect(scope.selected).toEqual([]);

      // find the master checkbox in the header row
      var master = element.find('thead tr i:last');

      // should select all
      master.trigger('click');
      expect(scope.selected).toEqual(scope.testData);

      // should deselect all
      master.trigger('click');
      expect(scope.selected).toEqual([]);



    });

    it('should add/remove a selected class for any rows we check/uncheck the checkboxes for', function(){

      var rowElement = element.find('tbody tr').eq(4);
      rowElement.find('td').eq(4).find('i').trigger('click');
      expect(rowElement.hasClass('selected')).toEqual(true);
      rowElement.find('td').eq(4).find('i').trigger('click');
      expect(rowElement.hasClass('selected')).not.toEqual(true);

    });


    it('should only keep selected rows selected if they are still in the data after a data change', function(){

      element.find('tbody tr').eq(3).find('td').eq(4).find('i').trigger('click');
      element.find('tbody tr').eq(4).find('td').eq(4).find('i').trigger('click');
      expect(scope.selected).toEqual([scope.testData[3],scope.testData[4]]);

      // remove recored and digest!
      scope.testData.splice(4,1);
      scope.$digest();

      expect(scope.selected).toEqual([scope.testData[3]]);

    });

    it('should deactivate any active row no longer in the data after a data change', function(){

      element.find('tbody tr').eq(4).trigger('click');
      expect(scope.active).toBe(scope.testData[4]);

      // remove recored and digest!
      scope.testData.splice(4,1);
      scope.$digest();

      expect(scope.active).toBe(undefined);

    });


    it('should keep active any row still in the data after a data change', function(){

      element.find('tbody tr').eq(3).trigger('click');
      expect(scope.active).toBe(scope.testData[3]);

      // remove recored and digest!
      scope.testData.splice(4,1);
      scope.$digest();

      expect(scope.active).toBe(scope.testData[3]);

    });



    it('should deselect everything on a scope.$destroy event', function(){

      // testing on the isolate as changes in the data binding don't seem to be
      // propogated to the parent while it is being destroyed (sensible)
      var isolate = element.isolateScope();

      element.find('tbody tr').eq(3).trigger('click');
      element.find('tbody tr').eq(3).find('td').eq(4).find('i').trigger('click');
      element.find('tbody tr').eq(4).find('td').eq(4).find('i').trigger('click');
      scope.$digest();

      expect(isolate.selected).toEqual([scope.testData[3],scope.testData[4]]);
      expect(isolate.activeRow).toBe(scope.testData[3]);

      scope.$destroy();

      expect(isolate.selected).toEqual([]);
      expect(isolate.activeRow).toBe(undefined);


    });




  });




  describe('row actions grid', function(){

    var element;

    beforeEach(function(){

      scope.selected = [];
      scope.active = undefined;

      element = angular.element(
        '<dcm-grid datasource="testData" active-row="active">' +
          '<dcm-grid-column title="Name" >{{name}}</dcm-grid-column>' +
          '<dcm-grid-column title="ID">{{roleID}}</dcm-grid-column>' +
          '<dcm-grid-column title="Description">{{description}}</dcm-grid-column>' +
          '<dcm-grid-row-actions>' +
            'Hello {{name}}!' +
          '</dcm-grid-row-actions>' +
        '</dcm-grid>'
      );
      compile(element)(scope);
      scope.$digest();

    });



    it('should transclude the row-actions into the table with the row data available', function(){

      // select an active row
      element.find('tbody tr').eq(3).trigger('click');
      expect(scope.active).toBe(scope.testData[3]);

      // the following row should now be the row actions (spanned across all rows)
      var nextRow = element.find('tbody tr').eq(4);
      expect(nextRow.find('td').length).toBe(2);
      expect(nextRow.find('td').eq(1).text()).toBe('Hello Limited User!');

    });





  });






  describe('single select grid', function(){

    var element;

    beforeEach(function(){

      scope.selected = {fake: 'data'};

      element = angular.element(
        '<dcm-grid datasource="testData" selected="selected" select-type="single">' +
          '<dcm-grid-column title="Name" >{{name}}</dcm-grid-column>' +
          '<dcm-grid-column title="ID">{{roleID}}</dcm-grid-column>' +
        '</dcm-grid>'
      );
      compile(element)(scope);
      scope.$digest();

    });



    it('should allow the user to select only a single row', function(){

      var radio = element.find('tbody tr').eq(3).find('td').eq(2).find('i');

      // seems like phantom doesn't change the checked property before
      // firing the click event
      radio.prop('checked', true);
      radio.trigger('click');

      expect(scope.selected).toEqual(scope.testData[3]);

      radio = element.find('tbody tr').eq(2).find('td').eq(2).find('i');
      radio.prop('checked', true);
      radio.trigger('click');

      expect(scope.selected).toEqual(scope.testData[2]);

      radio = element.find('tbody tr').eq(2).find('td').eq(2).find('i');
      radio.prop('checked', false);
      radio.trigger('click');

      expect(scope.selected).toEqual(null);

    });

    it('should allow the user to select by clicking the row if there isn\'t an activeRow field', function(){

      var radio = element.find('tbody tr').eq(2);
      radio.trigger('click');

      expect(scope.selected).toEqual(scope.testData[2]);

      radio = element.find('tbody tr').eq(2);
      radio.trigger('click');

      expect(scope.selected).toEqual(null);

    });


    it('should be able to change the selection via two way binding', function(){

      var radio;

      scope.selected = scope.testData[2];
      scope.$digest();

      radio = element.find('tbody tr i.fa-dot-circle-o').parent().parent().children().eq(0);
      expect(radio.text()).toBe('Basic User');

      scope.selected = scope.testData[0];
      scope.$digest();

      radio = element.find('tbody tr i.fa-dot-circle-o').parent().parent().children().eq(0);
      expect(radio.text()).toBe('Admin');

    });




  });















  describe('sortable grid', function(){

    it('should provide a sort function when a header is clicked on', function(){

      var element = angular.element(
        '<dcm-grid datasource="testData" sort-function="sorter">' +
          '<dcm-grid-column title="Name" width="15%">{{name}}</dcm-grid-column>' +
          '<dcm-grid-column width="5%">{{roleId}}</dcm-grid-column>' +
          '<dcm-grid-column field="description" title="Description"></dcm-grid-column>' +
          '<dcm-grid-column field="date" title="Description" ></dcm-grid-column>' +
        '</dcm-grid>'
      );

      compile(element)(scope);
      scope.$digest();

      // select a row header
      element.find('thead th').eq(0).trigger('click');
      scope.$digest();

      expect(angular.isFunction(scope.sorter)).toBe(true);
      expect(scope.sorter(scope.testData[0])).toBe('admin');
      expect(scope.sorter(scope.testData[1])).toBe('cloud resource manager');
      // make sure it can handle the node being undefined
      expect(scope.sorter({})).toBe('');

      // select a row header
      element.find('thead th').eq(3).trigger('click');
      scope.$digest();

      expect(scope.sorter(scope.testData[0])).toBe('2013-10-30T16:04:18Z');

    });

    it('should sort on numeric values if they are numeric in the data', function(){

      var element = angular.element(
        '<dcm-grid datasource="testData" sort-function="sorter">' +
          '<dcm-grid-column title="Name" width="15%">{{name}}</dcm-grid-column>' +
          '<dcm-grid-column width="5%">{{roleId}}</dcm-grid-column>' +
          '<dcm-grid-column field="description" title="Description"></dcm-grid-column>' +
        '</dcm-grid>'
      );

      compile(element)(scope);
      scope.$digest();


      // select a row header
      element.find('thead th').eq(1).trigger('click');
      scope.$digest();

      expect(angular.isFunction(scope.sorter)).toBe(true);
      expect(scope.sorter(scope.testData[0])).toBe(2);

    });

    it('should use the interpolated values when a simple field isn\'t available', function(){

      var element = angular.element(
        '<dcm-grid datasource="testData" sort-function="sorter">' +
          '<dcm-grid-column title="Name" width="15%">x - {{name}}</dcm-grid-column>' +
          '<dcm-grid-column width="5%">{{roleId}}</dcm-grid-column>' +
          '<dcm-grid-column field="description" title="Description"></dcm-grid-column>' +
        '</dcm-grid>'
      );

      compile(element)(scope);
      scope.$digest();

      // select a row header
      element.find('thead th').eq(0).trigger('click');
      scope.$digest();

      expect(angular.isFunction(scope.sorter)).toBe(true);
      expect(scope.sorter(scope.testData[0])).toBe('x - admin');

    });

    // reselecting for now where possible
    it('should not deselect the active row on sort if it still in record set', function(){

      scope.active = scope.testData[1];

      var element = angular.element(
        '<dcm-grid datasource="testData" sort-function="sorter" active-row="active">' +
          '<dcm-grid-column title="Name" width="15%">x - {{name}}</dcm-grid-column>' +
          '<dcm-grid-column width="5%">{{roleId}}</dcm-grid-column>' +
          '<dcm-grid-column field="description" title="Description"></dcm-grid-column>' +
        '</dcm-grid>'
      );

      compile(element)(scope);
      scope.$digest();


      scope.$digest();

      // select a row header
      element.find('thead th').eq(1).trigger('click');
      scope.$digest();

      expect(scope.active).toBe(scope.testData[1]);

    });

    it('should be able to specify a sort type', function(){

      var element = angular.element(
        '<dcm-grid datasource="testData" sort-function="sorter">' +
          '<dcm-grid-column title="Name" width="15%" sort-type="string">{{name}}</dcm-grid-column>' +
          '<dcm-grid-column width="5%" sort-type="integer">{{roleId}}</dcm-grid-column>' +
          '<dcm-grid-column field="description" title="Description" sort-type="direct"></dcm-grid-column>' +
          '<dcm-grid-column field="date" title="Description" sort-type="datetime"></dcm-grid-column>' +
        '</dcm-grid>'
      );

      compile(element)(scope);
      scope.$digest();

      // select a row header
      element.find('thead th').eq(0).trigger('click');
      scope.$digest();

      expect(angular.isFunction(scope.sorter)).toBe(true);
      expect(scope.sorter(scope.testData[0])).toBe('admin');
      // make sure it can handle the node being undefined
      expect(scope.sorter({})).toBe('');

      // select a row header
      element.find('thead th').eq(1).trigger('click');
      scope.$digest();
      expect(scope.sorter(scope.testData[1])).toBe(1);

      // select a row header
      element.find('thead th').eq(2).trigger('click');
      scope.$digest();
      expect(scope.sorter(scope.testData[1])).toBe('Full access to cloud resources');

      // select a row header
      element.find('thead th').eq(3).trigger('click');
      scope.$digest();
      expect(scope.sorter(scope.testData[1])).toBe(1383149058000);

    });


  });


  it('should toggle through the sort orders as you click on the header (and not resort)', function(){

    scope.sortOrder = '';

    var sortUpdates = 0;
    scope.$watch('sorter', function(newVal){
      if (newVal){
        sortUpdates++;
      }
    });

    var element = angular.element(
      '<dcm-grid datasource="testData" sort-function="sorter" sort-order="sortOrder">' +
        '<dcm-grid-column title="Name" width="15%">{{name}}</dcm-grid-column>' +
      '</dcm-grid>'
    );

    compile(element)(scope);
    scope.$digest();

    // select a row header
    element.find('thead th').eq(0).trigger('click');
    scope.$digest();
    expect(scope.sortOrder).toBe('ASC');


    element.find('thead th').eq(0).trigger('click');
    scope.$digest();

    expect(scope.sortOrder).toBe('DESC');

    element.find('thead th').eq(0).trigger('click');
    scope.$digest();

    expect(scope.sortOrder).toBe('ASC');

    // sort function should only change when initially set
    expect(sortUpdates).toBe(1);


  });

  it('should provide the sort function if a col is flagged to be the default sort col', function(){

    var element = angular.element(
      '<dcm-grid datasource="testData" sort-function="sorter" sort-order="sortOrder">' +
        '<dcm-grid-column title="Name" width="15%" sort-default>{{name}}</dcm-grid-column>' +
      '</dcm-grid>'
    );

    compile(element)(scope);
    scope.$digest();

    expect(scope.sorter).toEqual(jasmine.any(Function));

    expect(scope.sorter({name:'Blob'})).toBe('blob');


  });


  it('should support sorting on nested properties', function(){

    var element = angular.element(
      '<dcm-grid datasource="testData" sort-function="sorter" sort-order="sortOrder">' +
        '<dcm-grid-column title="Name" width="15%" sort-default>{{test.name}}</dcm-grid-column>' +
      '</dcm-grid>'
    );

    compile(element)(scope);
    scope.$digest();


    expect(scope.sorter({test: { name:'Blob'} })).toBe('blob');

    // should handle a missing key/value in nested data
    expect(scope.sorter({test: {} })).toBe('');

  });


  it('should be able to provide a default sort order using the sort-default attribute', function(){

    var element = angular.element(
      '<dcm-grid datasource="testData" sort-function="sorter" sort-order="sortOrder">' +
        '<dcm-grid-column title="Name" width="15%" sort-default="DESC">{{name}}</dcm-grid-column>' +
      '</dcm-grid>'
    );

    compile(element)(scope);
    scope.$digest();

    expect(scope.sorter).toEqual(jasmine.any(Function));

    expect(scope.sorter({name:'Blob'})).toBe('blob');

    expect(scope.sortOrder).toBe('DESC');

  });

  var getState = function(row) {
    var spans = row.find('td:first span');
    return {
      loading: !spans.eq(0).is('.ng-hide'),
      open: !spans.eq(1).is('.ng-hide'),
      closed: !spans.eq(2).is('.ng-hide')
    };
  };

  describe('basic grid with status cell and row actions', function(){

    var element, state;

    beforeEach(function(){

      scope.active = undefined;

      element = angular.element(
        '<dcm-grid datasource="testData" active-row="active">' +
          '<dcm-grid-row-status>' +
            '<span ng-show="$row.dataLoading">loading</span>' +
            '<span ng-show="!$row.dataLoading && $row.open">open</span>' +
            '<span ng-show="!$row.dataLoading && $row.closed">closed</span>' +
          '</dcm-grid-row-status>' +
          '<dcm-grid-row some-attribute="defined">' +
            '<dcm-grid-column field="name" title="Name" width="15%">{{name}}</dcm-grid-column>' +
            '<dcm-grid-column field="roleId" width="5%">{{roleId}}</dcm-grid-column>' +
            '<dcm-grid-column field="description">{{description}}</dcm-grid-column>' +
            '<dcm-grid-column some-other-attribute="defined" field="description"  title="">{{description}}</dcm-grid-column>' +
          '</dcm-grid-row>' +
          '<dcm-grid-row-actions>' +
            'Hello {{name}}!' +
          '</dcm-grid-row-actions>' +
        '</dcm-grid>'
      );

      compile(element)(scope);
      scope.$digest();



    });

    it('should render a basic grid wit grid-row-status content in the first col', function(){
      state = getState(element.find('tbody tr:first'));
      expect(state.loading).toBe(false);
      expect(state.open).toBe(false);
      expect(state.closed).toBe(true);
    });

    it('should change the row state to open when it is opened', function(){

      scope.active = scope.testData[0];
      scope.$digest();

      state = getState(element.find('tbody tr:first'));
      expect(state.loading).toBe(false);
      expect(state.open).toBe(true);
      expect(state.closed).toBe(false);

    });

    it('should change the row state back to closed when it is closed', function(){

      element.find('tbody tr:first').trigger('click');
      scope.$digest();

      state = getState(element.find('tbody tr:first'));
      expect(state.loading).toBe(false);
      expect(state.open).toBe(true);
      expect(state.closed).toBe(false);

      element.find('tbody tr:first').trigger('click');
      scope.$digest();

      state = getState(element.find('tbody tr:first'));
      expect(state.loading).toBe(false);
      expect(state.open).toBe(false);
      expect(state.closed).toBe(true);

    });


  });


  describe('basic grid with status cell, row actions and row reload/open/trigger functions', function(){

    var element, state, defer;

    beforeEach(function(){

      scope.active = undefined;

      defer = $q.defer();

      scope.loadDataFn = jasmine.createSpy('load data spy').and.returnValue(defer.promise);
      scope.openRowFn = jasmine.createSpy('open row spy').and.returnValue(defer.promise);

      element = angular.element(
        '<dcm-grid datasource="testData" active-row="active" open-row="openRowFn" reload-row="" cache-opened-rows="true">' +
          '<dcm-grid-row-status>' +
            '<span ng-show="$row.dataLoading">loading</span>' +
            '<span ng-show="!$row.dataLoading && $row.open">open</span>' +
            '<span ng-show="!$row.dataLoading && $row.closed">closed</span>' +
          '</dcm-grid-row-status>' +
          '<dcm-grid-row some-attribute="defined">' +
            '<dcm-grid-column field="name" title="Name" width="15%">{{name}}</dcm-grid-column>' +
            '<dcm-grid-column field="roleId" width="5%">{{roleId}}</dcm-grid-column>' +
            '<dcm-grid-column field="description">{{description}}</dcm-grid-column>' +
            '<dcm-grid-column some-other-attribute="defined" field="description"  title="">{{description}}</dcm-grid-column>' +
          '</dcm-grid-row>' +
          '<dcm-grid-row-actions>' +
            'Hello {{name}}!' +
          '</dcm-grid-row-actions>' +
        '</dcm-grid>'
      );

      compile(element)(scope);
      scope.$digest();

    });

    it('should call the open-row function with the row data when a row is opened', function(){

      element.find('tbody tr:first').trigger('click');
      scope.$digest();

      expect(scope.openRowFn).toHaveBeenCalled();
      expect(scope.openRowFn).toHaveBeenCalledWith(scope.testData[0]);

      // row should now be in loading state
      state = getState(element.find('tbody tr:first'));
      expect(state.loading).toBe(true);
      expect(state.open).toBe(false);
      expect(state.closed).toBe(false);
      expect(scope.testData[0].name).toBe('Admin');

      // resolve the open row request with aditional data
      defer.resolve({name: 'Admin Fancypants'});
      scope.$digest();

      // row should now contain the additional data and be in the open state
      state = getState(element.find('tbody tr:first'));
      expect(state.loading).toBe(false);
      expect(state.open).toBe(true);
      expect(state.closed).toBe(false);
      expect(scope.testData[0].name).toBe('Admin Fancypants');

    });

    it('should add data-loading class to the row when loading starts', function(){

      element.find('tbody tr:first').trigger('click');
      scope.$digest();

      expect(element.find('tbody tr:first').is('.data-loading')).toBe(true);
      expect(element.find('tbody tr:first').is('.show-loading')).toBe(false);

    });


    it('should only add the show-loading class to the row after the delay', function(){

      element.find('tbody tr:first').trigger('click');
      scope.$digest();

      expect(element.find('tbody tr:first').is('.show-loading')).toBe(false);

      $timeout.flush(500);

      expect(element.find('tbody tr:first').is('.show-loading')).toBe(true);

      // finish loading
      defer.resolve();
      scope.$digest();

      // check loading classes are removed
      expect(element.find('tbody tr:first').is('.show-loading')).toBe(false);
      expect(element.find('tbody tr:first').is('.data-loading')).toBe(false);

    });


    it('should only load row data once if cache-opened-rows is set', function(){

      element.find('tbody tr:first').trigger('click');
      defer.resolve();
      scope.$digest();

      expect(scope.openRowFn.calls.count()).toBe(1);
      expect(scope.openRowFn).toHaveBeenCalledWith(scope.testData[0]);

      // close row
      element.find('tbody tr:first').trigger('click');
      scope.$digest();
      // open row again
      element.find('tbody tr:first').trigger('click');
      scope.$digest();

      expect(scope.openRowFn.calls.count()).toBe(1);

    });


  });


    describe('basic grid with status cell, no caching of open rows', function(){

      var element, state, defer;

      beforeEach(function(){

        scope.active = undefined;
        defer = $q.defer();

        scope.openRowFn = jasmine.createSpy('open row spy').and.returnValue(defer.promise);

        element = angular.element(
          '<dcm-grid datasource="testData" active-row="active" open-row="openRowFn" cache-opened-rows="false">' +
            '<dcm-grid-row-status>' +
              '<span ng-show="$row.dataLoading">loading</span>' +
              '<span ng-show="!$row.dataLoading && $row.open">open</span>' +
              '<span ng-show="!$row.dataLoading && $row.closed">closed</span>' +
            '</dcm-grid-row-status>' +
            '<dcm-grid-row some-attribute="defined">' +
              '<dcm-grid-column field="name" title="Name" width="15%">{{name}}</dcm-grid-column>' +
              '<dcm-grid-column field="roleId" width="5%">{{roleId}}</dcm-grid-column>' +
              '<dcm-grid-column field="description">{{description}}</dcm-grid-column>' +
              '<dcm-grid-column some-other-attribute="defined" field="description"  title="">{{description}}</dcm-grid-column>' +
            '</dcm-grid-row>' +
            '<dcm-grid-row-actions>' +
              'Hello {{name}}!' +
            '</dcm-grid-row-actions>' +
          '</dcm-grid>'
        );

        compile(element)(scope);
        scope.$digest();

      });

      it('should call the open-row function with the row data each time a row is opened', function(){

        element.find('tbody tr:first').trigger('click');
        defer.resolve();
        scope.$digest();

        expect(scope.openRowFn.calls.count()).toBe(1);

        // close row
        element.find('tbody tr:first').trigger('click');
        scope.$digest();
        // open row again
        element.find('tbody tr:first').trigger('click');
        scope.$digest();

        expect(scope.openRowFn.calls.count()).toBe(2);

      });


  });


    describe('basic grid with ability to reload a row', function(){

      var element, state, defer;

      beforeEach(function(){

        scope.active = undefined;
        scope.selected = [];
        scope.reloadFn = undefined;

        defer = $q.defer();

        scope.loadDataFn = jasmine.createSpy('load data spy').and.returnValue(defer.promise);

        element = angular.element(
          '<dcm-grid datasource="testData" reload-row="loadDataFn" reload-trigger="reloadFn" active-row="active" selected="selected">' +
            '<dcm-grid-row-status>' +
              '<span ng-show="$row.dataLoading">loading</span>' +
              '<span ng-show="!$row.dataLoading && $row.open">open</span>' +
              '<span ng-show="!$row.dataLoading && $row.closed">closed</span>' +
            '</dcm-grid-row-status>' +
            '<dcm-grid-row some-attribute="defined">' +
              '<dcm-grid-column field="name" title="Name" width="15%">{{name}}</dcm-grid-column>' +
              '<dcm-grid-column field="roleId" width="5%">{{roleId}}</dcm-grid-column>' +
              '<dcm-grid-column field="description">{{description}}</dcm-grid-column>' +
              '<dcm-grid-column some-other-attribute="defined" field="description"  title="">{{description}}</dcm-grid-column>' +
            '</dcm-grid-row>' +
            '<dcm-grid-row-actions>' +
              'Hello {{name}}!' +
            '</dcm-grid-row-actions>' +
          '</dcm-grid>'
        );

        compile(element)(scope);
        scope.$digest();

      });

      it('should call the reload function on any visible row that matches the trigger', function(){

        // { roleId: 5, name: 'View Only Cloud', description: 'A full view only access to cloud resources', date: '2013-10-30T16:04:18Z' }

        scope.reloadFn({roleId: 2});
        scope.$digest();

        expect(scope.loadDataFn).toHaveBeenCalledWith(scope.testData[0]);

        // row should now be in loading state
        state = getState(element.find('tbody tr:first'));
        expect(state.loading).toBe(true);
        expect(state.open).toBe(false);
        expect(state.closed).toBe(false);
        expect(scope.testData[0].name).toBe('Admin');

        // resolve the open row request with aditional data
        defer.resolve({name: 'Admin Fancypants'});
        scope.$digest();

        // row should now contain the additional data and be in the open state
        state = getState(element.find('tbody tr:first'));
        expect(state.loading).toBe(false);
        expect(state.open).toBe(false);
        expect(state.closed).toBe(true);
        expect(scope.testData[0].name).toBe('Admin Fancypants');


      });



  });

});
