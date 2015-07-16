
/**
 * @ngdoc module
 * @name dcm-ui.read-file
 * @description
 *
 * The `dcm-ui.read-file` module allows you to use the HTML fileReader to load a file
 *
 * @example
   <example name="read-file-demo" module="dcm-ui.read-file">

    <file name="script.js">
      angular.module('dcm-ui.read-file')
        .run(['$rootScope',
          function($rootScope) {

            $rootScope.data = {
              singleFile: undefined,
              singleFileContent: '',
              multiFile: [],
              multiFileContent: []
            };

        }])
      ;
    </file>

    <file name="index.html">
      <form class="form">

        <div class="form-group" dcm-drop-zone="singleUploadHandler">

          <div class="drop-zone-message">
            <h3>Drop a single file here</h3>
          </div>

          <label for="exampleInput1">Load File</label>
          <input
            type="file"
            dcm-read-file="data.singleFile"
            ng-model="data.singleFileContent"
            id="exampleInput1"
            class="form-control"
            format="auto"
            drop-handler="singleUploadHandler"
          >
        </div>

        <div class="form-group" dcm-drop-zone="multiUploadHandler">

          <div class="drop-zone-message">
            <h3>Drop file(s) here</h3>
          </div>

          <label for="exampleInput2">Load Multiple Files</label>
          <input
            type="file"
            multiple
            dcm-read-file="data.multiFile"
            ng-model="data.multiFileContent"
            id="exampleInput2"
            class="form-control"
            drop-handler="multiUploadHandler"
          >
        </div>


      </form>

      <div class="panel panel-default">
        <div class="panel-heading">
          <h3 class="panel-title">Single File Content</h3>
        </div>
        <div class="panel-body">
          {{data.singleFileContent}}
        </div>
      </div>

      <div class="panel panel-default">
        <div class="panel-heading">
          <h3 class="panel-title">Multiple Files</h3>
        </div>
        <div class="panel-body">

          <div class="file" ng-repeat="file in data.multiFile">

            <h4>{{ file.name }}</h4>
            <dl class="dl-horizontal">
              <dt ng-repeat-start="(key, val) in file">{{key}}</dt>
              <dd ng-repeat-end>{{val}}</dd>
            </dl>

          </div>

        </div>
      </div>

    </file>

    <file name="style.css">

      dd {
        text-overflow: ellipsis;
        overflow: hidden;
        width: 440px;
      }

      .form-group {
        margin: 15px 5px;
      }

      .drop-zone-message {
        display: none;
      }

      .drop-zone-message h3 {
        position: absolute;
        top: 25%;
        margin: 0;
        width: 100%;
      }

      .drop-zone-hover {
        outline: 1px dashed grey;
        position: relative;
      }

      .drop-zone-hover .drop-zone-message {
        display: block;
        position: absolute;
        z-index: 100;
        background: #ffffff;
        width: 100%;
        height: 100%;
        text-align: center;
      }

    </file>

  </example>
 */
'use strict';
angular.module('dcm-ui.read-file',[]);
'use strict';
/**
 * @ngdoc directive
 * @name dcmDropZone
 * @module dcm-ui.read-file
 * @restrict A
 *
 * @description
 * Makes an element a drop zone for files
 *
 * @usage
 * <div dcm-drop-zone="drop handler function">...</div>
 */

angular.module('dcm-ui.read-file')
.directive( 'dcmDropZone', [ '$timeout',
  function( $timeout ) {
    return {
      restrict: 'A',
      scope: {
        dcmDropZone: '='
      },
      link: function( scope, element) {

        var dropHovered = false;
        var dropZoneTimer;

        element.on('dragstart dragenter dragover', function(event) {

          // Only file drag-n-drops allowed
          if (_.findWhere(event.originalEvent.dataTransfer.types, 'Files')) {

            event.stopPropagation();
            event.preventDefault();

            $timeout.cancel(dropZoneTimer);

            if (!dropHovered) {
              dropHovered = true;
              element.addClass('drop-zone-hover');
            }

            // set cursor icons
            event.originalEvent.dataTransfer.effectAllowed = 'copyMove';
            event.originalEvent.dataTransfer.dropEffect = 'move';

          }

        })
        .on('drop dragleave dragend', function () {

          $timeout.cancel(dropZoneTimer);

          dropZoneTimer = $timeout( function(){
            dropHovered = false;
            element.removeClass('drop-zone-hover');
          }, 70); // dropZoneHideDelay = 70, but anything above 50 is better

        });


        element.on('drop', function(evt){
          evt.stopPropagation();
          evt.preventDefault();
          scope.dcmDropZone(evt.originalEvent);
        });

      }
    };
  }
]);

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
