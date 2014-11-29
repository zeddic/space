// This creates an array of all the test files that Karma finds 
// to be added to the Require JS config below
var tests = [], file;
for (file in window.__karma__.files) {
  if (window.__karma__.files.hasOwnProperty(file)) {
    if(/_test\.js$/.test(file)) {
      tests.push(file);
    }
  }
}

requirejs.config({
  //baseUrl: '../app',
  baseUrl: '/base/app',
  paths: {
      lib: '../lib',
      jquery: '../lib/jquery'
  },
  shim: {
    'lib/angular': {
      exports: 'angular'
    },
    'lib/pixi': {
      exports: 'PIXI'
    },
    'lib/stats.min': {
      exports: 'Stats'
    }
  },
  deps: tests,
  callback: window.__karma__.start
});
