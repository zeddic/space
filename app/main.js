requirejs.config({
  baseUrl: 'app',
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

  //urlArgs: "bust=" +  (new Date()).getTime()
});

requirejs([
  'lib/jquery',
  'app',
]);
