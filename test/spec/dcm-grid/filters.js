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


  it('should be able to add default values', function () {

    filter.addDefaultValue('blah');

    expect(filter.defaultValues.blah).toBe('');
    expect(filter.values.blah).toBe('');

  });


  it('should be able to add default params', function () {

    filter.addDefaultParam('blah');

    expect(filter.defaultParams.blah).toBe('');
    expect(filter.requestParams.blah).toBe('');

  });

  it('should be able to watch a filter value for change then execute a function', function () {

    var watchOld, watchNew;

    filter.addDefaultValue('blah');

    filter.values.blah = 'oldValue';

    filter.onChange('values', 'blah', function(newVal, oldVal){
      watchOld = oldVal;
      watchNew = newVal;
    });

    scope.$digest();

    filter.values.blah = 'newValue';
    scope.$digest();

    expect(watchOld).toBe('oldValue');
    expect(watchNew).toBe('newValue');

  });

  it('should be able to watch a filter collection for change then execute a function', function () {

    var watchOld, watchNew;

    filter.addDefaultValue('blah', []);

    filter.values.blah.push('oldValue');

    filter.onCollectionChange('values', 'blah', function(newVal, oldVal){
      watchOld = oldVal;
      watchNew = newVal;
    });

    scope.$digest();

    filter.values.blah.push('newValue');
    scope.$digest();

    expect(watchOld).toEqual(['oldValue']);
    expect(watchNew).toEqual(['oldValue', 'newValue']);

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

  it('should be able to add a filter that matches an interpolated string', function () {

    var rowData = {lname: 'macgyver', fname: 'nancy'};

    scope.filter.addStandardTextSearchFilter('name', '{{fname}} {{lname}}');


    // no name set initially = no filtering by name
    expect(filter.values.name).toBe('');
    expect( filter.filterFunction(rowData)).toBe(true);

    filter.values.name = 'anc mac';
    expect( filter.filterFunction(rowData)).toBe(false);

    filter.values.name = 'ancy macg';
    expect( filter.filterFunction(rowData)).toBe(true);

  });



  it('should be able to do an exact match', function() {
    scope.filter.addFilterExactMatch('name');

    filter.values.name = '';
    expect(filter.values.name).toBe('');
    expect( filter.filterFunction({name: 'macgyver'}) ).toBe(true);

    filter.values.name = 'mac';
    expect( filter.filterFunction({name: 'macgyver'}) ).toBe(false);

    filter.values.name = 'macgyver';
    expect( filter.filterFunction({name: 'macgyver'}) ).toBe(true);

  });


  it('should be able to setup an exact match filter', function() {

    scope.filter.addExactTextSearchFilter('name');

    expect(filter.values.name).toBe('');

    expect( filter.filterFunction({name: 'macgyver'}) ).toBe(true);

    filter.values.name = 'mac';
    expect( filter.filterFunction({name: 'macgyver'}) ).toBe(false);

    filter.values.name = 'macgyver';
    expect( filter.filterFunction({name: 'macgyver'}) ).toBe(true);

  });

  it('should be able to do an exact match against multiple attributes', function() {
    scope.filter.addFilterExactMatch('name',['name','nickname']);

    filter.values.name = '';
    expect(filter.values.name).toBe('');
    expect( filter.filterFunction({name: 'macgyver',nickname: 'mac'}) ).toBe(true);

    filter.values.name = 'guy';
    expect( filter.filterFunction({name: 'macgyver',nickname: 'mac'}) ).toBe(false);

    filter.values.name = 'mac';
    expect( filter.filterFunction({name: 'macgyver',nickname: 'mac'}) ).toBe(true);

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

    filter.values.someId = '';

    // should be valid before someId is set
    expect( filter.filterFunction({someId: 3}) ).toBe(true);

    filter.values.someId = 5;
    expect( filter.filterFunction({someId: 5}) ).toBe(true);
    expect( filter.filterFunction({someId: 10}) ).toBe(false);

  });

  it('should filter when value is', function() {
    scope.filter.addFilterWhenValueIs('checkField', 1);

    // before any value is set it should be valid
    expect( filter.filterFunction({checkField: 1})).toBe(true);

    filter.values.checkField = '1';
    expect( filter.filterFunction({checkField: 1})).toBe(true);
    expect( filter.filterFunction({checkField: 0})).toBe(false);

  });


  it('should be able a field vs multiple values in an object', function() {

    scope.filter.setData('matchRegions', null);
    scope.filter.addFilterExactMatchObject('regionId', 'matchRegions');

    expect( filter.filterFunction({regionId: 10}) ).toBe(true);

    scope.filter.setData('matchRegions', {11: true, 12: true, 13: true });


    expect( filter.filterFunction({regionId: 10}) ).toBe(false);

    expect( filter.filterFunction({regionId: 12}) ).toBe(true);

  });


});
