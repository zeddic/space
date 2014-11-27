requirejs.config({
  baseUrl: '../app',
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
], function() {

  console.log('loaded!');
});

    // <script src="lib/stats.min.js"></script>
    // <script src="lib/three.min.js"></script>
    // <script src="lib/pixi.js"></script>
    // <script src="lib/jquery-2.1.0.js"></script>
    // <script src="lib/angular.js"></script>
    // <script src="lib/angular-sanitize.js"></script>
    // <script src="app/input.js"></script>
    // <script src="app/vector.js"></script>
    // <script src="app/util.js"></script>
    // <script src="app/interval.js"></script>
    // <script src="app/spatial-hash.js"></script>
    // <script src="app/collision-system.js"></script>
    // <script src="app/entities.js"></script>
    // <script src="app/game-object.js"></script>
    // <script src="app/steering.js"></script>
    // <script src="app/behaviors.js"></script>
    // <script src="app/ship.js"></script>
    // <script src="app/bullet.js"></script>
    // <script src="app/commands.js"></script>
    // <script src="app/world.js"></script>
    // <script src="app/camera.js"></script>
    // <script src="app/game.js"></script>
    // <script src="app/app.js"></script>
    // <script data-main="app/main" src="lib/require.js"></script>