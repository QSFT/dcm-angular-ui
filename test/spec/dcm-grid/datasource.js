
'use strict';
describe('Service: datasource', function () {

  // load the service's module

  var datasource,  $http, $rootScope, scope, sampleData, $timeout, $httpBackend, filters, data2;

  beforeEach(module('dcm-ui'));


  beforeEach(function(){

    module(function($provide) {
      $provide.decorator('$http', function($delegate){
        var o = jasmine.createSpy().and.callFake($delegate);
        return o;
      });
    });

  });


  // instantiate service
  beforeEach(inject(function($q, _datasource_, _$rootScope_, _$timeout_, _$httpBackend_, _$http_, _filters_) {

    $rootScope = _$rootScope_;
    $timeout = _$timeout_;
    $httpBackend = _$httpBackend_;
    $http = _$http_;
    filters = _filters_;

    scope = $rootScope.$new();

    datasource = _datasource_;


    scope.filter = filters.new();
    scope.filter.addStandardTextSearchFilter('name');


    sampleData = [
      { name: 'bob smith', someId: 7, otherField: 'x'},
      { name: 'dave ham', someId: 8, otherField: 'y'},
      { name: 'bob jones', someId: 9, otherField: 'a'},
      { name: 'elsbith maryface', someId: 5, otherField: 'b'}
    ];

    data2 = [
        { name: 'roboberto bannanaman', someId: 22, otherField: 'g'},
        { name: 'jones davidson', someId: 18, otherField: 's'}
      ];

    $httpBackend.when('GET', '/simple').respond(200, sampleData);
    $httpBackend.when('GET', /\/simple\/\d.*/).respond(200, data2);


    // test request that returns no data
    $httpBackend.when('GET', '/noData').respond(200, {
      complete: true,
      data: []
    });

    // ASYNC LOADING TEST
    $httpBackend.when('GET', '/sampleAsyncData').respond(200, {
      complete: false,
      token: 'blar',
      data: []
    });

    var count = 0;
    $httpBackend
      .when('GET', '/sampleAsyncData?token=blar')
      .respond(function(){
        var resp = [
          200,
          {
            complete: (count === sampleData.length - 1) ? true : false,
            token: 'blar',
            data: [sampleData[count++]]
          }
        ];
        return resp;
      })
    ;

    scope.loadOptions = {
      request: { url: '/simple' }
    };

    spyOn(_, 'debounce').and.callFake(function(x) {
      return x;
    });

  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingRequest();
    $httpBackend.verifyNoOutstandingExpectation();
  });

  it('should be able to create a new datasource', function () {

    var ds = datasource.create(scope, scope.loadOptions);

    expect(ds.loadData).toEqual(jasmine.any(Function));
    expect(ds.data).toEqual([]);
    expect(ds.bLoading).toBe(false);

  });



  it('should be able to retrieve data', function () {

    var ds = datasource.create(scope, scope.loadOptions);

    // load data
    $rootScope.$digest();
    $timeout.flush();
    $httpBackend.flush();
    $rootScope.$digest();

    expect(ds.data).toEqual(sampleData);


  });


  it('should cancel data request if scope is destroyed', function () {


    scope.loadOptions.autoLoad = false;

    var ds = datasource.create(scope, scope.loadOptions);

    // should not do anything until there is a request to cancel
    scope.$broadcast('$destroy');
    $rootScope.$digest();

    expect($httpBackend.flush).toThrow();

    ds.loadData();

    // load data
    $rootScope.$digest();
    $timeout.flush();

    scope.$broadcast('$destroy');
    $rootScope.$digest();

    expect($httpBackend.flush).toThrow();
    expect(ds.data).toEqual([]);

    scope.$broadcast('$destroy');
    $rootScope.$digest();


  });







  it('should be able to retrieve data asyncronously', function () {

    scope.loadOptions = {
      request: { url: '/sampleAsyncData' }
    };

    var ds = datasource.create(scope, scope.loadOptions);

    // load data
    $rootScope.$digest();
    $timeout.flush();
    $httpBackend.flush();

    $rootScope.$digest();
    $timeout.flush();
    $httpBackend.flush();

    ds.pause();

    $rootScope.$digest();
    $timeout.flush();
    $httpBackend.flush();

    // first two records should be in the data at this point
    expect(ds.data).toEqual([sampleData[0], sampleData[1]]);
    // puase will have occured before the first records data is moved to the view
    expect(ds.viewData).toEqual([]);

    ds.resume();

    $rootScope.$digest();
    $timeout.flush();
    $httpBackend.flush();

    // data should be moved to view at this point
    expect(ds.viewData).toEqual([sampleData[0], sampleData[1]]);

    // data should be one step ahead of view this cycle (won't be moved to view till next timeout)
    expect(ds.data).toEqual([sampleData[0], sampleData[1], sampleData[2]]);

    $rootScope.$digest();
    $timeout.flush();

    expect(ds.viewData).toEqual([sampleData[0], sampleData[1], sampleData[2]]);

    $httpBackend.flush();
    $timeout.flush();

    expect(ds.data).toEqual(sampleData);
    expect(ds.viewData).toEqual(sampleData);

  });

  it('should be able to pause and resume async data loading', function () {

    scope.loadOptions = {
      request: { url: '/sampleAsyncData' }
    };

    var ds = datasource.create(scope, scope.loadOptions);

    // load data
    $rootScope.$digest();
    $timeout.flush();
    $httpBackend.flush();

    $rootScope.$digest();
    $timeout.flush();
    $httpBackend.flush();

    $rootScope.$digest();
    $timeout.flush();
    $httpBackend.flush();

    // first two rows should be loaded + 3rd row pending
    $rootScope.$digest();
    $timeout.flush();

    ds.pause();
    expect(ds.viewData).toEqual( [ sampleData[0], sampleData[1] ] );

    $httpBackend.flush();

    $rootScope.$digest();
    $timeout.flush();
    $httpBackend.flush();

    expect(ds.viewData).toEqual( [ sampleData[0], sampleData[1] ] );

    ds.resume();


    $rootScope.$digest();
    $timeout.flush();

    expect(ds.viewData).toEqual(sampleData);

  });


  it('should update the data even if no records are returned (and thus no notify events)', function () {

    var ds = datasource.create(scope, scope.loadOptions);

    // load data
    $rootScope.$digest();
    $timeout.flush();
    $httpBackend.flush();

    expect(ds.data).toEqual(sampleData);

    scope.loadOptions.request.url = '/noData';

    $rootScope.$digest();
    $timeout.flush();
    $httpBackend.flush();
    expect(ds.data).toEqual([]);

  });

  it('should set loading flag correctly', function () {

    var ds = datasource.create(scope, scope.loadOptions);

    expect(ds.bLoading).toBe(false);

    $rootScope.$digest();
    $timeout.flush();

    expect(ds.bLoading).toBe(true);

    // complete loading data
    $httpBackend.flush();
    $timeout.flush();

    expect(ds.bLoading).toBe(false);
    expect(ds.data).toEqual(sampleData);

  });


  it('should be able to filter the data', function(){

    scope.loadOptions.filter = scope.filter;
    var ds = datasource.create(scope, scope.loadOptions);

    scope.filter.values.name = 'bob';

    // load data
    $rootScope.$digest();
    $timeout.flush();
    $httpBackend.flush();
    // process filter
    $timeout.flush();


    expect(ds.viewData).toEqual([
      { name: 'bob smith', someId: 7, otherField: 'x'},
      { name: 'bob jones', someId: 9, otherField: 'a'}
    ]);


  });



  it('should only filter the view data when the datasource is paused', function(){

    scope.loadOptions.filter = scope.filter;
    var ds = datasource.create(scope, scope.loadOptions);

    scope.filter.values.name = 'bob';

    // load data
    $rootScope.$digest();
    $timeout.flush();
    $httpBackend.flush();
    // process filter
    $timeout.flush();

    expect(ds.viewData).toEqual([
      { name: 'bob smith', someId: 7, otherField: 'x'},
      { name: 'bob jones', someId: 9, otherField: 'a'}
    ]);

    ds.pause();
    scope.filter.values.name = 'i';

    $rootScope.$digest();
    $timeout.flush();

    expect(ds.viewData).toEqual([
      { name: 'bob smith', someId: 7, otherField: 'x'}
    ]);


  });


  it('should filter results if the filter data changes', function(){

    scope.loadOptions.filter = scope.filter;

    var ds = datasource.create(scope, scope.loadOptions);

    scope.filter.values.name = 'bob';

    // load data
    $rootScope.$digest();
    $timeout.flush();
    $httpBackend.flush();
    // process filter
    $timeout.flush();

    expect(ds.viewData).toEqual([
      { name: 'bob smith', someId: 7, otherField: 'x'},
      { name: 'bob jones', someId: 9, otherField: 'a'}
    ]);

    scope.filter.values.name = 'mary';
    $rootScope.$digest();
    $timeout.flush();

    expect(ds.viewData).toEqual([
      { name : 'elsbith maryface', someId : 5, otherField : 'b' }
    ]);


  });

  it('should filter results only if the optional filter valid expression evaluates to true', function(){

    scope.loadOptions.filter = scope.filter;
    scope.loadOptions.filterValid = 'isFilterValid';

    var ds = datasource.create(scope, scope.loadOptions);

    scope.filter.values.name = 'bob';
    scope.isFilterValid = true;


    $rootScope.$digest();
    $timeout.flush();
    $httpBackend.flush();
    $timeout.flush();

    // expect initial data to be loaded. this is the only load request...
    expect(ds.viewData).toEqual([
      { name: 'bob smith', someId: 7, otherField: 'x'},
      { name: 'bob jones', someId: 9, otherField: 'a'}
    ]);

    scope.isFilterValid = false;
    scope.filter.values.name = 'mary';

    $rootScope.$digest();

    expect(ds.viewData).toEqual([
      { name: 'bob smith', someId: 7, otherField: 'x'},
      { name: 'bob jones', someId: 9, otherField: 'a'}
    ]);

    scope.isFilterValid = true;
    $rootScope.$digest();
    $timeout.flush();

    expect(ds.viewData).toEqual([
      { name : 'elsbith maryface', someId : 5, otherField : 'b' }
    ]);


  });




  it('should request new data if filter options/params change', function(){

    scope.loadOptions.filter = scope.filter;
    scope.loadOptions.request.url =  '/simple/2';
    scope.loadOptions.request.params = { foo: 'bar' };

    var ds = datasource.create(scope, scope.loadOptions);


    expect(ds.data).toEqual([]);


    // load data
    $rootScope.$digest();
    $timeout.flush();
    $httpBackend.flush();

    expect(ds.data).toEqual(data2);

    scope.loadOptions.request.url = '/simple';
    delete scope.loadOptions.request.params;


    $rootScope.$digest();
    $timeout.flush();
    $httpBackend.flush();

    expect(ds.data).toEqual(sampleData);

  });

  it('should not request new data if filter options/params change and update is set to manual request only', function(){


    scope.loadOptions.autoLoad = false;

    // this will trigger param change refresh
    scope.loadOptions.request.params = {id: 37};

    // this will trigger request option change request + filter okay request
    var ds = datasource.create(scope, scope.loadOptions);


    // load data
    $rootScope.$digest();

    // should not be any data loads triggered
    expect($timeout.flush).toThrow();
    expect($httpBackend.flush).toThrow();

    // should not have loaded any data yet...
    expect(ds.data).toEqual([]);

    // remove param as it isn't configured to return data
    delete scope.loadOptions.request.params;

    scope.$digest();

    // param change shouldn't of trigger a load
    expect($timeout.flush).toThrow();
    expect($httpBackend.flush).toThrow();

    // manually load data...
    ds.loadData();

    $rootScope.$digest();
    $timeout.flush();
    $httpBackend.flush();

    // should now have the data
    expect(ds.data).toEqual(sampleData);

  });






  it('should not request data until the optional requestValidExpr is truthy', function(){

    scope.bValid = false;
    scope.loadOptions.request.url =  '/simple/2';
    scope.loadOptions.request.params = { foo: 'bar'};
    scope.loadOptions.requestValid = 'bValid';

    var ds = datasource.create(scope, scope.loadOptions);

    // load data
    $rootScope.$digest();
    expect($httpBackend.flush).toThrow();

    scope.loadOptions.request.params.foo = 'bar2';
    $rootScope.$digest();


    scope.loadOptions.request.url =  '/simple';
    delete scope.loadOptions.request.params;
    $rootScope.$digest();
    $timeout.flush();
    expect($httpBackend.flush).toThrow();


    ds.loadData();
    $timeout.flush();
    $rootScope.$digest();
    expect($httpBackend.flush).toThrow();

    scope.bValid = true;

    $rootScope.$digest();
    $timeout.flush();
    $httpBackend.flush();

    expect(ds.data).toEqual(sampleData);


  });


  it('should cancel the first request if another request is made before it completes', function(){


    scope.loadOptions.request.url =  '/simple/2';
    scope.loadOptions.request.params = {
      foo: 'bar'
    };


    scope.ds = datasource.create(scope, scope.loadOptions);

    var updateCount = 0;
    var data = [];
    scope.$watchCollection('ds.data', function(newData){
      if (!angular.equals(newData,data)) {
        updateCount++;
      }
    });

    // load data
    $rootScope.$digest();
    $timeout.flush();

    scope.loadOptions.request.url =  '/simple';
    delete scope.loadOptions.request.params;

    $rootScope.$digest();
    $timeout.flush();
    $httpBackend.flush();

    // check data is correct
    expect(scope.ds.data).toEqual(sampleData);

    // check two requests madce
    expect($http.calls.count()).toBe(2);

    // check data was only updated once
    expect(updateCount).toBe(1);

    // check nothing outstanding happens in afterEach()

  });

  it('should not start the second request if another identical request is made before it completes', function(){

    var updateCount = 0;
    var data = [];
    scope.$watchCollection('ds.data', function(newData){
      if (!angular.equals(newData,data)) {
        updateCount++;
      }
    });


    scope.ds = datasource.create(scope, scope.loadOptions);

    // load data
    $rootScope.$digest();
    $timeout.flush();

    scope.ds.loadData();

    $rootScope.$digest();
    $timeout.flush();
    $httpBackend.flush();

    // check data is correct
    expect(scope.ds.data).toEqual(sampleData);

    // check only one request was made
    expect($http.calls.count()).toBe(1);

    // check data was only updated once
    expect(updateCount).toBe(1);

    // check nothing outstanding happens in afterEach()

  });


  it('should be able to paginate the data', function(){

    scope.loadOptions.pagination = {
      perPage: 2
    };

    var ds = datasource.create(scope, scope.loadOptions);

    // load data
    $rootScope.$digest();
    $timeout.flush();
    $httpBackend.flush();
    $timeout.flush();

    expect(ds.data).toEqual(sampleData);

    // digest here to make sure filter/watcher is setup before data loaded
    ds.setPage(2);
    $rootScope.$digest();


    expect(ds.pageData).toEqual([
      { name: 'bob jones', someId: 9, otherField: 'a'},
      { name: 'elsbith maryface', someId: 5, otherField: 'b'}
    ]);

    expect(ds.pages).toBe(2);
    expect(ds.currentPage).toBe(2);

    // change the page
    ds.setPage(1);
    $rootScope.$digest();

    expect(ds.pageData).toEqual([
      { name: 'bob smith', someId: 7, otherField: 'x'},
      { name: 'dave ham', someId: 8, otherField: 'y'}
    ]);

  });

  it('should keep the current page within the bounds', function(){

    scope.loadOptions.pagination = {
      perPage: 2
    };


    var ds = datasource.create(scope, scope.loadOptions);


    // load data
    $rootScope.$digest();

    // should set current page to 0 initially as no data will be loaded
    expect(ds.currentPage).toBe(0);

    $timeout.flush(); // get data timeout
    $httpBackend.flush();
    $timeout.flush(); // apply filter timeout

    expect(ds.viewData).toEqual(sampleData);

    // set current page too high
    ds.setPage(4);
    $rootScope.$digest();
    expect(ds.currentPage).toBe(2);

    // set current page too low
    ds.setPage(-3);
    $rootScope.$digest();
    expect(ds.currentPage).toBe(1);


  });




  it('should sort the data if a sort function is provided', function(){


    var ds = datasource.create(scope, scope.loadOptions);

    ds.sortFunction = function(a) {
      return (a.name.toLowerCase());
    };

    // load data
    $rootScope.$digest();
    $timeout.flush();
    $httpBackend.flush();

    expect(ds.data).toEqual([
      { name: 'bob jones', someId: 9, otherField: 'a'},
      { name: 'bob smith', someId: 7, otherField: 'x'},
      { name: 'dave ham', someId: 8, otherField: 'y'},
      { name: 'elsbith maryface', someId: 5, otherField: 'b'}
    ]);


  });


  it('should reverse the order of the data if datasource.sortOrder is DESC', function(){

    var ds = datasource.create(scope, scope.loadOptions);

    ds.sortFunction = function(a) {
      return (a.name.toLowerCase());
    };

    // load data
    $rootScope.$digest();
    $timeout.flush();
    $httpBackend.flush();

    expect(ds.data).toEqual([
      { name: 'bob jones', someId: 9, otherField: 'a'},
      { name: 'bob smith', someId: 7, otherField: 'x'},
      { name: 'dave ham', someId: 8, otherField: 'y'},
      { name: 'elsbith maryface', someId: 5, otherField: 'b'}
    ]);

    ds.sortOrder = 'DESC';

    // load data
    $rootScope.$digest();

    expect(ds.data).toEqual([
      { name: 'elsbith maryface', someId: 5, otherField: 'b'},
      { name: 'dave ham', someId: 8, otherField: 'y'},
      { name: 'bob smith', someId: 7, otherField: 'x'},
      { name: 'bob jones', someId: 9, otherField: 'a'}
    ]);


  });



  it('should resort the data if the sort function changes', function(){

    var ds = datasource.create(scope, scope.loadOptions);

    ds.sortFunction = function(a) {
      return (a.name.toLowerCase());
    };

    ds.loadData();

    // load data
    $rootScope.$digest();
    $timeout.flush();
    $httpBackend.flush();

    expect(ds.data).toEqual([
      { name: 'bob jones', someId: 9, otherField: 'a'},
      { name: 'bob smith', someId: 7, otherField: 'x'},
      { name: 'dave ham', someId: 8, otherField: 'y'},
      { name: 'elsbith maryface', someId: 5, otherField: 'b'}
    ]);


    ds.sortFunction = function(a) {
      return (a.someId);
    };

    $rootScope.$digest();
    $timeout.flush();

    // this should not have caused a new request to the backend
    expect($httpBackend.flush).toThrow();

    expect(ds.data).toEqual([
      { name: 'elsbith maryface', someId: 5, otherField: 'b'},
      { name: 'bob smith', someId: 7, otherField: 'x'},
      { name: 'dave ham', someId: 8, otherField: 'y'},
      { name: 'bob jones', someId: 9, otherField: 'a'}
    ]);


  });



    // sampleData = [
    //   { name: 'bob smith', someId: 7, otherField: 'x'},
    //   { name: 'dave ham', someId: 8, otherField: 'y'},
    //   { name: 'bob jones', someId: 9, otherField: 'a'},
    //   { name: 'elsbith maryface', someId: 5, otherField: 'b'}
    // ];

  it('should be able to sort the data during async data loading', function () {

    scope.loadOptions = {
      request: { url: '/sampleAsyncData' }
    };

    var ds = datasource.create(scope, scope.loadOptions);

    ds.sortFunction = function(a) {
      return (a.name.toLowerCase());
    };

    // load data
    $rootScope.$digest();
    $timeout.flush();
    $httpBackend.flush();

    $rootScope.$digest();
    $timeout.flush();
    $httpBackend.flush();

    ds.sortOrder = 'DESC';

    $rootScope.$digest();
    $timeout.flush();
    $httpBackend.flush();

    // first two rows should be loaded + 3rd row pending
    $rootScope.$digest();
    $timeout.flush();

    ds.pause();
    expect(ds.viewData).toEqual( [ sampleData[1], sampleData[0] ] );

    ds.sortFunction = function(a) {
      return (a.someId);
    };

    $rootScope.$digest();



    expect(ds.viewData).toEqual( [ sampleData[1], sampleData[0] ] );

    ds.sortOrder = 'ASC';
    ds.sortFunction = function(a) {
      return (a.name.toLowerCase());
    };


    expect(ds.viewData).toEqual( [ sampleData[1], sampleData[0] ] );


    $httpBackend.flush();
    $rootScope.$digest();

    ds.resume();



    $timeout.flush();
    $httpBackend.flush();

    expect(ds.viewData).toEqual( [ sampleData[2], sampleData[0],  sampleData[1] ] );



    $rootScope.$digest();
    $timeout.flush();
    expect(ds.viewData).toEqual( [ sampleData[2], sampleData[0],  sampleData[1], sampleData[3] ] );


  });



  it('should be able to execute a function after data is loaded', function () {

    var complete = false;
    scope.loadOptions.onLoadComplete = function(){
      complete = true;
    };

    var ds = datasource.create(scope, scope.loadOptions);

    // load data
    $rootScope.$digest();
    $timeout.flush();
    $httpBackend.flush();

    // data isn't filtered/paged until next digest cycle, then function should be executed
    $timeout.flush();

    expect(ds.data).toEqual(sampleData);
    expect(complete).toEqual(true);


  });


  describe('trigger row reload function', function(){

    var ds;

    beforeEach(function(){

      scope.loadOptions.requestRowFunction = jasmine.createSpy('request row function');

      ds = datasource.create(scope, scope.loadOptions);

      // make the names sorted by alpha
      ds.sortFunction = function(a) {
        return (a.name.toLowerCase());
      };

      // load data
      $rootScope.$digest();
      $timeout.flush();
      $httpBackend.flush();
      $timeout.flush();

    });


    it('should be able to reload a single row and reapply sort/pagination', function () {

      scope.loadOptions.requestRowFunction.and.callFake(function(row){
        row.name = 'a ' + row.name + ' the first of his name';
        return row;
      });

      var match = angular.copy(sampleData[1]);
      ds.triggerRowReload(match);

      // digest + flush timeout to allow new sorting
      $rootScope.$digest();
      $timeout.flush();

      expect(scope.loadOptions.requestRowFunction).toHaveBeenCalledWith(match);
      expect(ds.viewData[0].name).toBe('a ' + sampleData[1].name + ' the first of his name');
      expect(ds.viewData[2].name).toBe('bob smith');

    });


    it('should be able to add a new row to the dataset if reload is triggered on an unknown row', function () {

      scope.loadOptions.requestRowFunction.and.callFake(_.identity);

      var match = { name: 'aardvarky albertson', someId: 11, otherField: 'f'};
      ds.triggerRowReload(match);

      // digest + flush timeout to allow new sorting
      $rootScope.$digest();
      $timeout.flush();

      expect(ds.viewData[0]).toBe(match);

    });

    it('should not add a new row to the dataset if reload is triggered on an unknown row but returns no data', function () {

      expect(ds.data.length).toBe(4);

      scope.loadOptions.requestRowFunction.and.callFake(angular.noop);
      var match = { name: 'aardvarky albertson', someId: 11, otherField: 'f'};
      ds.triggerRowReload(match);

      // digest + flush timeout to allow new sorting
      $rootScope.$digest();
      $timeout.flush();

      // should not be any new rowsz
      expect(ds.data.length).toBe(4);

    });


    it('should be able to reload a single row and reapply sort/pagination with new data provided to triggerReload', function () {

      var match = angular.copy(sampleData[1]);
      ds.triggerRowReload(match, {name: 'a ' + sampleData[1].name + ' the first of his name'});

      // digest + flush timeout to allow new sorting
      $rootScope.$digest();
      $timeout.flush();

      expect(ds.viewData[0].name).toBe('a ' + sampleData[1].name + ' the first of his name');
      expect(ds.viewData[2].name).toBe('bob smith');

    });

    it('should delete row if the reloaded data is null/undefined', function () {

      scope.loadOptions.requestRowFunction.and.callFake(function(){
        return null;
      });

      var match = angular.copy(sampleData[1]);

      expect(ds.data.length).toBe(4);
      expect(_.findWhere(ds.data, match)).toEqual(sampleData[1]);

      ds.triggerRowReload(match);

      // digest + flush timeout to allow new sorting
      $rootScope.$digest();
      $timeout.flush();

      expect(ds.data.length).toBe(3);
      expect(_.findWhere(ds.data, match)).toBe(undefined);

    });

    it('should delete row if the reloaded data is null/undefined with data provided to triggerReload', function () {

      var match = angular.copy(sampleData[1]);

      expect(ds.data.length).toBe(4);
      expect(_.findWhere(ds.data, match)).toEqual(sampleData[1]);

      ds.triggerRowReload(match, undefined);

      // digest + flush timeout to allow new sorting
      $rootScope.$digest();
      $timeout.flush();

      expect(ds.data.length).toBe(3);
      expect(_.findWhere(ds.data, match)).toBe(undefined);

    });


});

});
