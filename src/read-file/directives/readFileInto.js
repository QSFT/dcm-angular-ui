'use strict';
/**
 * @ngdoc directive
 * @name dcmReadFile
 * @module dcm-ui.read-file
 * @restrict A
 *
 * @description
 * When the file selected by a file input control changes read the file contents are read into
 * the scope variable that is specified.
 * The file is read as a data uri, file or text. A base64 encoded string prefixed with 'data:[mime type],'.
 *
 * @usage
 * <INPUT TYPE='file' dcm-read-file format="file|uri|text" ngModel="account.fileData>
 *   OR
 * <INPUT TYPE='file' dcm-read-file="some.var" format="file|uri|text" ngModel="account.fileData>
 */

angular.module('dcm-ui.read-file')
.directive( 'dcmReadFile', ['$window', '$q', '$log',
  function( $window, $q, $log ) {
    return {
      require: '?ngModel',
      restrict: 'A',
      scope: {
        into: '=?dcmReadFile',
        format: '@',
        display: '@',
        openFileSelect: '=?',
        dropHandler: '=?'
      },

      compile: function(el, at){

        // this directive needs to be attached to a file input
        if( !el.is( 'input' ) || !at.type || at.type.toLowerCase() !== 'file' ){
          throw({message: 'attempted to use dcm-read-file on an element which is not a file input: ' + el.get(0).tagName});
        }


        return function( scope, element, attributes, ngModel ) {

          scope.format = scope.format || '';

          // check that that the browser supports the file reader api
          if( !$window.FileReader ){
            element.after( '<input class="form-control" disabled value="File reading is not supported in this browser.">' );
            element.detach();
            return;
          }

          var getExtension = function(fileName) {
            var ext = fileName.match(/\.([^.]+)$/);
            if (ext) {
              return ext[1];
            } else {
              return '';
            }
          };

          var getReadType = function(file) {

            if (scope.format === 'auto') {
              switch (getExtension(file.name)) {
              case 'txt':
              case 'text':
              case 'yaml':
                return 'text';

              default:
                return 'uri';
              }

            } else if (scope.format === 'text') {
              return 'text';
            } else if (scope.format === 'file') {
              return 'file';
            } else {
              return 'uri';
            }

          };


          var dcmReadFile = function(thisFile){

            var loadFilePromise = $q.defer();

            var reader = new $window.FileReader();

            var destroyReader = function() {
              reader.onloadend = null;
              reader.onerror = null;
              reader.onabort = null;
              reader = null;
            };

            reader.onerror = destroyReader;
            reader.onabort = destroyReader;


            reader.onloadend = function(){

              var result;

              // if the format is file then the data: and mimetype prefixes
              // need to be removed from the string
              if( getReadType(thisFile) === 'file' ){
                var endOfHeader = reader.result.indexOf( ',' );
                // no data if there is no header
                if (endOfHeader === -1) {
                  result = '';
                } else {
                  result = reader.result.substring( endOfHeader + 1 );
                }
              } else {
                result = reader.result;
              }



              if (ngModel && attributes.filesize && thisFile.size > parseInt(attributes.filesize, 10) ) {

                // reject promise as file is too big
                ngModel.$setValidity('filesize', false);
                ngModel.$setDirty();
                loadFilePromise.reject();

              } else {

                // return the file from the promise as it is valid...

                var upload = {
                  data: result,
                  size: thisFile.size,
                  name: thisFile.name,
                  lastModified: thisFile.lastModified,
                  extension: getExtension(thisFile.name),
                  type: getReadType(thisFile)
                };

                var ext = upload.name.match(/\.([^.]+)$/);
                if (ext) {
                  upload.extension = ext[1];
                }

                loadFilePromise.resolve(upload);

              }

              destroyReader();

            };

            if (getReadType(thisFile) === 'text') {
              reader.readAsText(thisFile);
            } else {
              reader.readAsDataURL(thisFile);
            }


            return loadFilePromise.promise;

          };




          var processFiles = function(fileList) {

            if (ngModel && attributes.filesize) {
              ngModel.$setValidity('filesize', true);
            }

            var aPromises = [];

            // read the files...
            for(var idx = 0; idx < fileList.length; idx++) {
              aPromises.push(dcmReadFile(fileList[idx]));
            }

            $q.all(aPromises).then(function(files){

              // write to the scope (if the into value is specified)
              if (attributes.dcmReadFile) {
                if (attributes.multiple) {
                  scope.into = files;
                } else {
                  scope.into = files[0];
                }
              }

              // set the value in the model
              if (ngModel) {
                if (attributes.multiple) {
                  ngModel.$setViewValue(_.pluck(files,'data'));
                } else {
                  ngModel.$setViewValue(files[0].data);
                }
              }

            }, function(){

              // upload was rejected, clear any existing values (old uploads)

              // write to the scope (if the into value is specified)
              if (attributes.dcmReadFile) {
                if (attributes.multiple) {
                  scope.into = [];
                } else {
                  scope.into = undefined;
                }
              }

              // set the value in the model
              if (ngModel) {
                if (attributes.multiple) {
                  ngModel.$setViewValue([]);
                } else {
                  ngModel.$setViewValue('');
                }
              }

            });


          };




          // listen for selected files to change
          element.change( function(evt){
            processFiles(evt.target.files);
          });

          // function to trigger input elements file select dialog
          scope.openFileSelect = function() {
            element.click();
          };

          scope.dropHandler = function(evt) {
            processFiles(evt.dataTransfer.files);
          };

        }
      }
    };
  }
]);
