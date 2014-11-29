define(function(require) {

  var SpatialHash = require('spatial-hash');
  var Vector = require('vector');

  describe('Benchmark', function() {
    var start, elapsed;

    it('runs a benchmark', function() {
    //   var hash = new SpatialHash();
    //   var point = new Vector(0, 0);

    //   var ops = benchmark(function() {
    //     hash.getKeys(point, 500);
    //   }, 10);

    //   console.log('elapsed: ' + elapsed + ' - ' + ops + 'ops');
    }

    function benchmark(fn, times) {
      clockStart();
      for (var i = 0; i < times; i++) {
        fn();
      }

      elapsed = elapsed();
      return times / elapsed * 1000;
    }

    function clockStart() {
      start = new Date();
    }

    function elapsed() {
      var end = new Date();
      return end - start;
    }
  });
});
