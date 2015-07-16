'use strict';

// file read into needs to be tested using protractor
describe('Directive: readFile', function () {
  // load the directive's module
  beforeEach(module('dcm-ui.read-file'));

  var $scope, $compile, $timeout, dropZoneEl, fakeEvent;

  beforeEach(inject(function ($rootScope, _$compile_, _$timeout_) {

    $scope = $rootScope.$new();
    $compile = _$compile_;
    $timeout = _$timeout_;

    $scope.dropHandler = jasmine.createSpy('drop handler spy');

    dropZoneEl = angular.element('<div dcm-drop-zone="dropHandler">');

    $compile(dropZoneEl)($scope);


    fakeEvent = {
      stopPropagation: jasmine.createSpy('stop prop spy'),
      preventDefault: jasmine.createSpy('prevent default spy'),
      originalEvent: {
        dataTransfer: {
          types: ['Files'],
          effectAllowed: '',
          dropEffect: ''
        }
      }
    };

  }));





  it('should give the element the drop-zone-hover class when hovered with files', function(){

    fakeEvent.type = 'dragenter';

    dropZoneEl.triggerHandler(fakeEvent);

    expect(dropZoneEl.attr('class').match(/\bdrop-zone-hover\b/)).not.toBeNull();

    // these things should also have happened...
    expect(fakeEvent.stopPropagation).toHaveBeenCalled();
    expect(fakeEvent.preventDefault).toHaveBeenCalled();


  });



  it('should not give the element the drop-zone-hover class when hovered without files', function(){

    fakeEvent.type = 'dragenter';
    fakeEvent.originalEvent.dataTransfer.types = ['something else'];

    dropZoneEl.triggerHandler(fakeEvent);

    expect(dropZoneEl.attr('class').match(/\bdrop-zone-hover\b/)).toBeNull();

  });


  it('should keep the drop-zone-hover class until the timeout after dragleave', function(){

    fakeEvent.type = 'dragenter';

    dropZoneEl.triggerHandler(fakeEvent);

    expect(dropZoneEl.attr('class').match(/\bdrop-zone-hover\b/)).not.toBeNull();

    fakeEvent.type = 'dragleave';

    dropZoneEl.triggerHandler(fakeEvent);

    expect(dropZoneEl.attr('class').match(/\bdrop-zone-hover\b/)).not.toBeNull();

    $timeout.flush();

    expect(dropZoneEl.attr('class').match(/\bdrop-zone-hover\b/)).toBeNull();

  });



  it('should keep the drop-zone-hover class if another dragenter occurs before dragleave timeout', function(){

    fakeEvent.type = 'dragenter';
    dropZoneEl.triggerHandler(fakeEvent);
    expect(dropZoneEl.attr('class').match(/\bdrop-zone-hover\b/)).not.toBeNull();

    fakeEvent.type = 'dragleave';
    dropZoneEl.triggerHandler(fakeEvent);
    expect(dropZoneEl.attr('class').match(/\bdrop-zone-hover\b/)).not.toBeNull();


    fakeEvent.type = 'dragenter';
    dropZoneEl.triggerHandler(fakeEvent);
    expect(dropZoneEl.attr('class').match(/\bdrop-zone-hover\b/)).not.toBeNull();

    // should not be any timeouts (should have been canceled on reentry...)
    expect($timeout.flush).toThrow();

    expect(dropZoneEl.attr('class').match(/\bdrop-zone-hover\b/)).not.toBeNull();

  });



  it('should invoke the drag handler on drop', function(){

    fakeEvent.type = 'drop';

    dropZoneEl.triggerHandler(fakeEvent);

    expect($scope.dropHandler).toHaveBeenCalledWith(fakeEvent.originalEvent);
    expect(fakeEvent.stopPropagation).toHaveBeenCalled();
    expect(fakeEvent.preventDefault).toHaveBeenCalled();

  });



});
