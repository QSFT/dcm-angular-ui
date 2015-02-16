dcm-angular-ui
==============

A collection of Angular UI components used in [Dell Cloud Manager](http://www.enstratius.com/)
and suitable for reuse in other web applications.

Current components include:
* [dcm-ui.grid](http://dell-oss.github.io/dcm-angular-ui/#/api/grid) : A grid control capable of managing large data sets.
* [dcm-ui.select2](http://dell-oss.github.io/dcm-angular-ui/#/api/select2) : A wrapper for select2 that allows you to use all of it's functionality
* [dcm-ui.slider](http://dell-oss.github.io/dcm-angular-ui/#/api/slider) : A horizontal slider control
* [dcm-ui.multiple-input](http://dell-oss.github.io/dcm-angular-ui/#/api/multiple-input) : Converts an input field to accepting multiple entries
* [dcm-ui.resizable-cols](http://dell-oss.github.io/dcm-angular-ui/#/api/resizable-cols) : Makes selected table columns resizable

For examples and documentation of each component see [http://dell-oss.github.io/dcm-angular-ui/](http://dell-oss.github.io/dcm-angular-ui/)


Quick Start
===========

+ Install dcm-angular-ui with [Bower](https://github.com/bower/bower).

>
```bash
$ bower install dcm-angular-ui
```

+ Include the desired modules is your `index.html`:

>
``` html
<script src="bower_components/angular/angular.js"></script>
<script src="bower_components/dcm-angular-ui/dist/js/dcm-ui-helpers.min.js"></script>
<script src="bower_components/dcm-angular-ui/dist/js/dcm-ui-grid.min.js"></script>
<script src="bower_components/dcm-angular-ui/dist/js/dcm-ui-resizable-cols.min.js"></script>
```

+ Inject the relevant `dcm-ui` module into your app:

>
``` js
angular.module('myApp', ['ngAnimate', 'dcm-ui.grid']);
```


Development
===========

1) have node/npm installed

2) run `npm install` to download the required packages

3) run `npm start` to run the project/docs

To run the unit tests in development mode (execute on every change) run `npm test`

After running the tests coverage reports are available in ./test/coverage
