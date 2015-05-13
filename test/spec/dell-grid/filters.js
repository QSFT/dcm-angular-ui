'use strict';

describe('Service: filters', function () {

  // load the service's module
  beforeEach(module('dcm-ui'));

  // instantiate service
  var filters, filter, scope, accounts, regions;


  beforeEach(function(){

    accounts = ['Amazon1'];
    regions = ['SE', 'NW'];

  });

  beforeEach(inject(function(_filters_, $rootScope) {

    filters = _filters_;

    scope = $rootScope.$new();

    filter = filters.new(scope);

    scope.filter = filter;


  }));

  it('should be able to create an empty filter object', function () {

    expect(filter).toEqual(jasmine.any(Object));

  });


  it('should be able to reset filter values to the defaults', function () {

    filter.defaultValues = {
      foo: 'bar'
    };

    filter.resetFilters();

    expect(filter.values.foo).toBe('bar');

  });


  it('should stop filtering once the first filter fails, ', function () {

    filter.filterFunctions.push(function() {return true;});
    filter.filterFunctions.push(function() {return false;});
    filter.filterFunctions.push(function() {return true;});

    spyOn(filter.filterFunctions,'0').and.callThrough();
    spyOn(filter.filterFunctions,'1').and.callThrough();
    spyOn(filter.filterFunctions,'2').and.callThrough();

    // this will fail
    expect( filter.filterFunction({name: 'macgyver'}) ).toBe(false);

    expect(filter.filterFunctions[0]).toHaveBeenCalled();
    expect(filter.filterFunctions[1]).toHaveBeenCalled();
    expect(filter.filterFunctions[2]).not.toHaveBeenCalled();


  });


  it('should be able to add a name filter', function () {

    scope.filter.addStandardTextSearchFilter('name');

    // no name set initially = no filtering by name
    expect(filter.values.name).toBe('');
    expect( filter.filterFunction({name: 'macgyver'}) ).toBe(true);

    filter.values.name = 'guy';
    expect( filter.filterFunction({name: 'macgyver'}) ).toBe(false);

    filter.values.name = 'mac';
    expect( filter.filterFunction({name: 'macgyver'}) ).toBe(true);

  });

  it('should be able to add an integer filter - gt', function () {

    scope.filter.addFilterInteger('someId', 'gt');
    filter.values.someId = 5;
    expect( filter.filterFunction({someId: 10}) ).toBe(true);

  });

  it('should be able to add an integer filter - lt', function () {

    scope.filter.addFilterInteger('someId', 'lt');
    filter.values.someId = 5;
    expect( filter.filterFunction({someId: 3}) ).toBe(true);
    expect( filter.filterFunction({someId: 10}) ).toBe(false);

  });

  it('should be able to add an integer filter - eq', function () {

    scope.filter.addFilterInteger('someId', 'eq');
    filter.values.someId = 5;
    expect( filter.filterFunction({someId: 5}) ).toBe(true);
    expect( filter.filterFunction({someId: 10}) ).toBe(false);

  });

  it('should filter when value is', function() {
    scope.filter.addFilterWhenValueIs('checkField', 1);
    filter.values.checkField = '1';
    expect( filter.filterFunction({checkField: 1})).toBe(true);
    expect( filter.filterFunction({checkField: 0})).toBe(false);

  });


  xit('should be able to add a standard select2 request param filter', function () {


    selectData.standardSelect2RequestParamFilter(scope.filter, 'platform', 'platform');

    // no name set initially = no filtering by name
    expect(filter.requestParams.platform).toBe('');

  });


  xit('should be able to add a standard select2 filter', function () {

    selectData.standardSelect2Filter(scope.filter, 'platform', 'platform');


    // no name set initially = no filtering by name
    expect(filter.values.platform).toBe('');
    expect( filter.filterFunction({platform: 'Windows'}) ).toBe(true);

    filter.values.platform = 'UBUNTU';
    expect( filter.filterFunction({platform: 'Windows'}) ).toBe(false);

    filter.values.platform = 'Windows';
    expect( filter.filterFunction({platform: 'Windows'}) ).toBe(true);

  });


  xit('should be able to add cloud, (account, region) required fields ', function () {

    filters.addCloudAccountFiltering(scope.filter);
    filters.addAccountRequestParam(scope.filter);
    filters.addRegionRequestParam(scope.filter);

    // check default data
    expect(filter.data).toEqual({
      clouds: jasmine.any(Array),
      accounts: [],
      regions: [],
      oAccount: null
    });

    expect(filter.requestParams).toEqual({
      accountId: '',
      regionId: ''
    });

    expect(filter.defaultValues).toEqual({
      cloudId: ''
    });

    scope.$digest();
    filter.requestParams.accountId = 1038;

    // should update accounts when cloud changes
    filter.values.cloudId = 'cyan';
    scope.$digest();
    // expect account to have been reset and data set
    expect(filter.requestParams.accountId).toBe('');
    expect(filter.data.accounts).toBe(accounts);

    // should update regions when account changes
    scope.filter.requestParams.regionId = 99;
    filter.data.oAccount = {
      billingId: 1001
    };
    scope.$digest();

    expect(scope.filter.requestParams.regionId).toBe('');
    expect(filter.data.regions).toBe(regions);



  });





});
