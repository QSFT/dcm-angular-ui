'use strict';

// file read into needs to be tested using protractor
fdescribe('Directive: readFile', function () {
  // load the directive's module
  beforeEach(module('dcm-ui.read-file'));

  var formElement, inputElement,  scope, $compile, form, $window, singleFileList, multipleFileList, readers;


  // process all file readers
  var readFiles = function() {

    _.forEach(readers, function(fileReader){
      fileReader.result = fileReader.fakeFile.fakeReadResult;
      console.log('reading', fileReader.fakeFile.name)
      fileReader.onloadend();
    });

    scope.$digest();

  };

  var compileInput = function(input) {

    formElement = angular.element(
      '<form name="testForm"></form>'
    );

    inputElement = angular.element(input);

    formElement.append(inputElement);

    scope.data = '';
    $compile(formElement)(scope);
    scope.$digest();
    form = scope.testForm;

  };


  beforeEach(function() {

    readers = [];

    var fakeReader = {
      fakeFile: {},
      readAsDataURL: function(file){
        this.fakeFile = file;
      },
      readAsText: function(file){
        this.fakeFile = file;
      }
    };

    $window = {
      FileReader: function() {
        var thisReader = angular.copy(fakeReader);
        readers.push(thisReader);
        return thisReader;
      }
    };

    module('dcm-ui.read-file', function ($provide) {
      $provide.value('$window', $window);
    });


    inject(function ($rootScope, _$compile_) {

      scope = $rootScope.$new();
      $compile = _$compile_;

      // reset vars
      inputElement = formElement = form = null;



      singleFileList = {
        length: 1,
        0: {
          lastModified: 1428083600000,
          lastModifiedDate: new Date(1428083600000),
          name: 'sample.txt',
          size: 988,
          type: 'text/plain',
          webkitRelativePath: '',
          fakeReadResult: 'the fake response'
        }
      };

      multipleFileList = {
        length: 2,
        0: {
          lastModified: 1428083600000,
          lastModifiedDate: new Date(1428083600000),
          name: 'sample.yaml',
          size: 988,
          type: '',
          webkitRelativePath: '',
          fakeReadResult: 'the fake yaml'
        },
        1: {
          lastModified: 1428083600000,
          lastModifiedDate: new Date(1428083600000),
          name: 'sample.jpg',
          size: 988,
          type: 'image/jpeg',
          webkitRelativePath: '',
          fakeReadResult: 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAACfwAAAXDCAY...'
        }
      };





    });

  });





  it('should attach to a file input', function(){

    compileInput('<input ng-model="placeholder" type="file" dcm-read-file="data">');

    expect(formElement.html()).toBe('<input ng-model="placeholder" type="file" dcm-read-file="data" class="ng-pristine ng-untouched ng-valid ng-isolate-scope">');

  });



  it('should not attach to a non file input', function(){

    var errorOccured = false;

    try {
      compileInput('<input type="text" ng-model="placeholder" dcm-read-file="data">');
    } catch (e) {
      errorOccured = true;
    }

    expect(errorOccured).toBe(true);

  });




  it('should replace input if browser doesn\'t support fileReader', function(){

    $window.FileReader = null;
    compileInput('<input type="file" ng-model="placeholder" dcm-read-file="data">');
    expect(formElement.html()).toBe('<input class="form-control" disabled="" value="File reading is not supported in this browser.">');

  });



  it('should allow a file upload', function(){

    compileInput('<input ng-model="placeholder" multiple type="file" dcm-read-file="data">');

    inputElement.triggerHandler({
      type: 'change',
      target: {
        files: multipleFileList
      }
    });

    readFiles();

  });


/*

  results: empty file = "data:"

  results png = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAACfwAAAXDCAY..."

  result (text read) = "the text of the file"


*/

});
