'use strict';

// file read into needs to be tested using protractor
describe('Directive: readFile', function () {
  // load the directive's module
  beforeEach(module('dcm-ui.read-file'));

  var formElement, inputElement,  scope, $compile, form, $window, readers, fakeImage, fakeYaml, fakeText, fakeMysteryFile, fakeNullFile;


  var uploadViaInput = function(fileList) {
    inputElement.triggerHandler({
      type: 'change',
      target: {
        files: fileList
      }
    });
  };

  var generateFakeResponse = function(file) {
    return {
      data: file.fakeReadResult,
      name: file.name,
      size: file.size,
      lastModified: file.lastModified,
      type: file.returnType,
      extension: file.extension
    };
  };


  // process all file readers
  var readFiles = function() {

    _.forEach(readers, function(fileReader){
      fileReader.result = fileReader.fakeFile.fakeReadResult;
      fileReader.onloadend();
    });

    scope.$digest();

    readers = [];

  };

  var compileInput = function(input) {

    formElement = angular.element(
      '<form name="testForm"></form>'
    );

    inputElement = angular.element(input);

    formElement.append(inputElement);

    scope.data = '';
    var compiled = $compile(formElement)(scope);
    scope.$digest();
    form = scope.testForm;

    return compiled;

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


      fakeImage = {
        lastModified: 1428083600000,
        lastModifiedDate: new Date(1428083600000),
        name: 'sample.jpg',
        size: 988,
        type: 'image/jpeg',
        returnType: 'uri',
        webkitRelativePath: '',
        fakeReadResult: 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAACfwAAAXDCAY...',
        extension: 'jpg'
      };

      fakeYaml = {
        lastModified: 1428083600000,
        lastModifiedDate: new Date(1428083600000),
        name: 'sample.yaml',
        size: 988,
        type: '',
        returnType: 'text',
        webkitRelativePath: '',
        fakeReadResult: 'some fake yaml file content',
        extension: 'yaml'
      };

      fakeText = {
        lastModified: 1428083600000,
        lastModifiedDate: new Date(1428083600000),
        name: 'sample.txt',
        size: 988,
        type: 'text/plain',
        returnType: 'text',
        webkitRelativePath: '',
        fakeReadResult: 'the fake response',
        extension: 'txt'
      };


      fakeMysteryFile = {
        lastModified: 1428083600000,
        lastModifiedDate: new Date(1428083600000),
        name: 'mystery',
        size: 10999,
        type: '',
        returnType: 'uri',
        webkitRelativePath: '',
        fakeReadResult: 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAACfwAAAXDCAY...',
        extension: ''
      };

      fakeNullFile = {
        lastModified: 1428083600000,
        lastModifiedDate: new Date(1428083600000),
        name: 'null.file',
        size: 0,
        type: '',
        returnType: 'uri',
        webkitRelativePath: '',
        fakeReadResult: 'data:',
        extension: ''
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



  it('should allow multiple file upload', function(){

    compileInput('<input ng-model="placeholder" multiple type="file" format="auto" dcm-read-file>');

    uploadViaInput([fakeYaml, fakeImage]);

    readFiles();

    expect(scope.placeholder).toEqual([fakeYaml.fakeReadResult, fakeImage.fakeReadResult]);

  });



  it('should allow multiple file upload', function(){

    compileInput('<input ng-model="placeholder" multiple type="file" format="auto" dcm-read-file>');

    uploadViaInput([fakeYaml, fakeImage]);

    readFiles();

    expect(scope.placeholder).toEqual([fakeYaml.fakeReadResult, fakeImage.fakeReadResult]);

  });



  it('should provide full data for the file through the dcm-read-file attribute', function(){

    compileInput('<input multiple type="file" format="auto" dcm-read-file="uploadedFiles">');

    uploadViaInput([fakeYaml, fakeImage, fakeText]);

    readFiles();

    expect(scope.uploadedFiles).toEqual([generateFakeResponse(fakeYaml), generateFakeResponse(fakeImage), generateFakeResponse(fakeText)]);

  });


  it('should provide full data for the file through the dcm-read-file attribute', function(){

    compileInput('<input multiple type="file" format="auto" dcm-read-file="uploadedFiles">');

    uploadViaInput([fakeYaml, fakeImage, fakeText, fakeMysteryFile]);

    readFiles();

    expect(scope.uploadedFiles).toEqual([generateFakeResponse(fakeYaml), generateFakeResponse(fakeImage), generateFakeResponse(fakeText), generateFakeResponse(fakeMysteryFile)]);

  });


  it('should be able to read a file as text', function(){

    compileInput('<input ng-model="placeholder" type="file" format="text" dcm-read-file>');

    uploadViaInput([fakeText]);

    readFiles();

    expect(scope.placeholder).toEqual(fakeText.fakeReadResult);

  });

  it('should be able to read a file as file (not uri)', function(){

    compileInput('<input ng-model="placeholder" type="file" format="file" dcm-read-file>');

    uploadViaInput([fakeImage]);

    readFiles();

    // get the file part of the data ui
    var filePart = fakeImage.fakeReadResult.replace(/^[^,]+,/, '');
    expect(scope.placeholder).toEqual(filePart);

  });

  it('should be able to read a file as uri', function(){

    compileInput('<input ng-model="placeholder" type="file" format="uri" dcm-read-file>');

    uploadViaInput([fakeImage]);

    readFiles();

    expect(scope.placeholder).toEqual(fakeImage.fakeReadResult);

  });

  it('should be able to read an empty file', function(){

    compileInput('<input ng-model="placeholder" type="file" format="file" dcm-read-file>');

    uploadViaInput([fakeNullFile]);

    readFiles();

    expect(scope.placeholder).toEqual('');

  });

  it('should be able to limit size of file accepted', function(){

    compileInput('<input ng-model="placeholder" type="file" format="auto" dcm-read-file="uploadFile" filesize="5000">');

    uploadViaInput([fakeMysteryFile]);

    readFiles();

    expect(scope.uploadFile).toBeUndefined();


    uploadViaInput([fakeText]);

    readFiles();

    expect(scope.uploadFile).toEqual(generateFakeResponse(fakeText));


  });




  it('should rejcet all files if one file in multiple is rejected', function(){

    compileInput('<input ng-model="placeholder" multiple type="file" format="auto" dcm-read-file="uploadFiles" filesize="5000">');

    uploadViaInput([fakeMysteryFile, fakeText]);

    readFiles();

    expect(scope.uploadFiles).toEqual([]);
    expect(scope.placeholder).toEqual([]);

  });


  it('should invoke the input elements click function if open-file-select attributes function is called', function(){

    compileInput('<input ng-model="placeholder" multiple type="file" format="auto" dcm-read-file open-file-select="openFile">');

    var clicked = false;

    inputElement.on('click', function(){ clicked = true; });

    scope.openFile();

    expect(clicked).toBe(true);

  });




  it('should be able to read a file via the drop-handler attributes function', function(){

    compileInput('<input ng-model="placeholder" type="file" format="text" dcm-read-file drop-handler="dh">');

    scope.dh({
      dataTransfer: {
        files: [fakeText]
      }
    });

    readFiles();

    expect(scope.placeholder).toEqual(fakeText.fakeReadResult);

  });


});
