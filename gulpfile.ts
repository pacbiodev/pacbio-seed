/// <reference path="./typings/node/node.d.ts" />

var gulp = require('gulp');
var bump = require('gulp-bump');
var concat = require('gulp-concat');
var filter = require('gulp-filter');
var inject = require('gulp-inject');
var minifyCSS = require('gulp-minify-css');
var minifyHTML = require('gulp-minify-html');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');
var template = require('gulp-template');
var tsc = require('gulp-typescript');
var uglify = require('gulp-uglify');
var watch = require('gulp-watch');

var Builder = require('systemjs-builder');
var del = require('del');
var fs = require('fs');
var join = require('path').join;
var resolve = require('path').resolve;
var runSequence = require('run-sequence');
var semver = require('semver');
var series = require('stream-series');
var spawn;

var http = require('http');
var connect = require('connect');
var serveStatic = require('serve-static');
var openResource = require('open');

var server;

(() => {
  var childProcess = require("child_process");
  var __spawn = childProcess.spawn;
  spawn = function () {
    console.log('spawn called');
    console.log(arguments);
    return __spawn.apply(this, arguments);
  }
})();

// --------------
// Configuration.
var APP_BASE = '/';

var PATH = {
  dest: {
    all: 'dist',
    dev: {
      all: 'dist',
      lib: 'dist/public/lib',
      ng2: 'dist/public/lib/angular2.js',
      router: 'dist/public/lib/router.js'
    },
    prod: {
      all: 'dist/prod',
      lib: 'dist/prod/lib'
    }
  },
  src: {
    // Order is quite important here for the HTML tag injection.
    lib: [
      './node_modules/angular2/node_modules/traceur/bin/traceur-runtime.js',
      './node_modules/es6-module-loader/dist/es6-module-loader-sans-promises.js',
      './node_modules/es6-module-loader/dist/es6-module-loader-sans-promises.js.map',
      './node_modules/reflect-metadata/Reflect.js',
      './node_modules/reflect-metadata/Reflect.js.map',
      './node_modules/systemjs/dist/system.src.js',
      './node_modules/angular2/node_modules/zone.js/dist/zone.js',
      './angular-2.0.alpha.29.patched/angular2.js',
      './angular-2.0.alpha.29.patched/router.js',
      './node_modules/bootstrap/dist/css/bootstrap.css',
      './node_modules/bootstrap/dist/css/bootstrap-theme.css',
      './node_modules/json-fn/jsonfn.js',
      './node_modules/js-extensions/extensions.js'
    ]
  }
};

var ng2Builder = new Builder({
  paths: {
    'angular2/*': 'node_modules/angular2/es6/dev/*.js',
    rx: 'node_modules/angular2/node_modules/rx/dist/rx.js'
  },
  meta: {
    'angular2/angular2': { build: true },
    'angular2/router': { build: true },
    rx: {
      format: 'cjs'
    }
  }
});

var appProdBuilder = new Builder({
  baseURL: 'file:./tmp',
  meta: {
    'angular2/angular2': { build: false },
    'angular2/router': { build: false }
  }
});

var HTMLMinifierOpts = { conditionals: true };

var tsProject = tsc.createProject('tsconfig.json', {
  typescript: require('typescript')
});

var semverReleases = ['major', 'premajor', 'minor', 'preminor', 'patch',
                      'prepatch', 'prerelease'];

var port = 5555;

// --------------
// Typings
gulp.task('tsd', 
          (cb) => {
            gulp.watch(resolve('./', 'typings/tsd.d.ts'),
                       () => {
                         console.log('Refreshing checked in typings');
                         var git = spawn('git',
                           ['checkout', 'HEAD', 'typings\\*'],
                           {
                             stdio: [
                               0,      // use parents stdin for child
                               'pipe', // pipe child's stdout to parent
                               'pipe'  // pipe child's stderr to parent
                             ]
                           });

                         git.stdout
                           .on('data',
                           (data) => {
                             console.log(data.toString('utf8'));
                           });

                         git.stderr
                           .on('data',
                           (data) => {
                             console.log(data.toString('utf8'));
                           });

                         git.on('close',
                                () => {
                                  cb();
                                  process.exit(0);
                                });
                       });

            tsd({
                  command: 'reinstall',
                  config: './tsd.json'
                },
                () => {
                });
          });

// --------------
// Clean.

gulp.task('clean', 
          (done) => {
            del(PATH.dest.all, done);
          });

gulp.task('clean.dev', 
          (done) => {
            del(PATH.dest.dev.all, done);
          });

gulp.task('clean.app.dev', 
          (done) => {
            // TODO: rework this part.
            del([join(PATH.dest.dev.all, '**/*'), 
                '!' + PATH.dest.dev.lib, 
                '!' + join(PATH.dest.dev.lib, '*')], done);
          });

gulp.task('clean.prod', 
          (done) => {
            del(PATH.dest.prod.all, done);
          });

gulp.task('clean.app.prod', 
          (done) => {
            // TODO: rework this part.
            del([join(PATH.dest.prod.all, '**/*'), 
                      '!' + PATH.dest.prod.lib, 
                      '!' + join(PATH.dest.prod.lib, '*')], done);
          });

gulp.task('clean.tmp', 
          (done) => {
            del('tmp', done);
          });

// --------------
// Build dev.

gulp.task('build.ng2.dev', 
          () => {
            ng2Builder.build('angular2/router', 
                             PATH.dest.dev.router, 
                             {});
            return ng2Builder.build('angular2/angular2', 
                                    PATH.dest.dev.ng2, 
                                    {});
          });

gulp.task('build.lib.dev', 
          [/*'build.ng2.dev'*/],
          () => {
            return gulp.src(PATH.src.lib)
                       .pipe(gulp.dest(PATH.dest.dev.lib));
          });

gulp.task('build.js.dev', 
          () => {
            var result = gulp.src('./src/**/*.ts')
                             .pipe(plumber())
                             .pipe(sourcemaps.init())
                             .pipe(tsc(tsProject));

            return result.js
                         .pipe(sourcemaps.write())
                         .pipe(template(templateLocals()))
                         .pipe(gulp.dest(PATH.dest.dev.all));
          });

gulp.task('build.assets.dev', 
          ['build.js.dev'], 
          () => {
            return gulp.src(['./src/**/*.{html,htm,txt}',
                             './src/**/*.hbs',
                             './src/**/*.pem',
                             './src/**/*.yml',
                             './src/**/*.{css,woff}',
                             './src/**/*.{png,gif,jpeg,jpg,ico}',
                             './src/**/*.strings'])
              .pipe(gulp.dest(PATH.dest.dev.all));
          });

gulp.task('build.index.dev', 
          () => {
            var target = gulp.src(injectableDevAssetsRef(), { read: false });

            return gulp.src('./src/public/index.html')
                       .pipe(inject(target, { transform: transformPath('dev') }))
                       .pipe(template(templateLocals()))
                       .pipe(gulp.dest(join(PATH.dest.dev.all, './public')));
          });

gulp.task('build.app.dev', 
          (done) => {
            // 'clean.app.dev', 
            runSequence('build.assets.dev',
                        'build.index.dev',
                        done);
          });

gulp.task('build.dev', 
          (done) => {
            runSequence('clean.dev', 
                        'build.lib.dev', 
                        'build.app.dev', 
                        done);
          });

// --------------
// Build prod.

gulp.task('build.ng2.prod', 
          () => {
            ng2Builder.build('angular2/router', 
                             join('tmp', 'router.js'), 
                             {});
            return ng2Builder.build('angular2/angular2', 
                                    join('tmp', 'angular2.js'), 
                                    {});
          });

gulp.task('build.lib.prod', 
          ['build.ng2.prod'], 
          () => {
            var jsOnly = filter('**/*.js');
            var lib = gulp.src(PATH.src.lib);
            var ng2 = gulp.src('tmp/angular2.js');
            var router = gulp.src('tmp/router.js');

            return series(lib, ng2, router).pipe(jsOnly)
                                           .pipe(concat('lib.js'))
                                           .pipe(uglify())
                                           .pipe(gulp.dest(PATH.dest.prod.lib));
          });

gulp.task('build.js.tmp', 
          () => {
            var result = gulp.src(['./src/**/*ts', '!./src/init.ts'])
                             .pipe(plumber())
                             .pipe(tsc(tsProject));

            return result.js
                         .pipe(template({ VERSION: getVersion() }))
                         .pipe(gulp.dest('tmp'));
          });

// TODO: add inline source maps (System only generate separate source maps file).
gulp.task('build.js.prod', 
          ['build.js.tmp'], 
          () => {
            return appProdBuilder.build('app', 
                                        join(PATH.dest.prod.all, 'app.js'),
                                        { minify: true })
                                 .catch((e) => { 
                                          console.log(e); });
                                        });

gulp.task('build.init.prod', 
          () => {
            var result = gulp.src('./src/init.ts')
                             .pipe(plumber())
                             .pipe(sourcemaps.init())
                             .pipe(tsc(tsProject));

            return result.js
                         .pipe(uglify())
                         .pipe(template(templateLocals()))
                         .pipe(sourcemaps.write())
                         .pipe(gulp.dest(PATH.dest.prod.all));
          });

gulp.task('build.assets.prod', ['build.js.prod'], () => {
  var filterHTML = filter('**/*.html');
  var filterCSS = filter('**/*.css');
  return gulp.src(['./src/**/*.html', './src/**/*.css'])
    .pipe(filterHTML)
    .pipe(minifyHTML(HTMLMinifierOpts))
    .pipe(filterHTML.restore())
    .pipe(filterCSS)
    .pipe(minifyCSS())
    .pipe(filterCSS.restore())
    .pipe(gulp.dest(PATH.dest.prod.all));
});

gulp.task('build.index.prod', 
          () => {
            var target = gulp.src([join(PATH.dest.prod.lib, 'lib.js'),
                                   join(PATH.dest.prod.all, '**/*.css')], 
                                   { read: false });
            return gulp.src('./src/index.html')
                       .pipe(inject(target, { transform: transformPath('prod') }))
                       .pipe(template(templateLocals()))
                       .pipe(gulp.dest(PATH.dest.prod.all));
          });

gulp.task('build.app.prod', 
          (done) => {
            // build.init.prod does not work as sub tasks dependencies so placed it here.
            runSequence('clean.app.prod', 
                        'build.init.prod', 
                        'build.assets.prod',
                        'build.index.prod', 
                        'clean.tmp', 
                        done);
          });

gulp.task('build.prod', 
          (done) => {
            runSequence('clean.prod', 
                        'build.lib.prod', 
                        'clean.tmp', 
                        'build.app.prod',
                        done);
          });

// Set Environment and Start Server
gulp.task('serve.dev',
  () => {
    process.env.NODE_ENV = 'development';
    gulp.start('serve.node');
  });

gulp.task('serve.prod',
  () => {
    process.env.NODE_ENV = 'production';
    gulp.start('serve.node');
  });

// Launch server
gulp.task('serve.node',
          (cb) => {
            if (server)
              server.kill();

            server = spawn('node',
                          ['dist/server.js'],
                          {
                            stdio: [
                              0,      // use parents stdin for child
                              'pipe', // pipe child's stdout to parent
                              'pipe'  // pipe child's stderr to parent
                            ]
                          });

            server.stdout
                  .on('data',
                  (data) => {
                    console.log(data.toString('utf8'));
                  });

            server.stderr
                  .on('data',
                  (data) => {
                    console.log(data.toString('utf8'));
                  });
          });

process.on('exit',
           (code) => {
             console.log('Gulp process exiting (status: %d)', code);

             if (server)
               server.kill()
           });

// --------------
// Version.

registerBumpTasks();

gulp.task('bump.reset', 
          function() {
            return gulp.src('package.json')
                       .pipe(bump({ version: '0.0.0' }))
                       .pipe(gulp.dest('./'));
          });

// --------------
// Test.

// Change to spawn node instance

// --------------
// Serve dev.

gulp.task('serve.dev', 
          ['build.dev'], 
          () => {
            var app;

            watch('./src/**', () => {
              gulp.start('build.app.dev');
            });

            app = connect().use(serveStatic(join(__dirname, PATH.dest.dev.all)));
            http.createServer(app)
                .listen(port, 
                        () => {
                          openResource('http://localhost:' + port);
                        });
          });

// --------------
// Serve prod.

gulp.task('serve.prod', 
          ['build.prod'], 
          () => {
            var app;

            watch('./src/**', 
                  () => {
                    gulp.start('build.app.prod');
                  });

            app = connect().use(serveStatic(join(__dirname, PATH.dest.prod.all)));
            http.createServer(app)
                .listen(port, 
                        () => {
                          openResource('http://localhost:' + port);
                        });
          });

// --------------
// Utils.

function transformPath(env) {
  var v = getVersion();
  return (filepath) => {
           arguments[0] = filepath.replace('/' + PATH.dest[env].all, '');

           // The public folder is a content route. Therefore it must be
           // stripped from url.
           if (arguments[0].substring(0, 7) === '/public')
               arguments[0] = arguments[0].substring(7);

           return inject.transform.apply(inject.transform, arguments);
         };
}

function injectableDevAssetsRef() {
  var src = PATH.src.lib.map((path) => {
                               return join(PATH.dest.dev.lib, 
                                           path.split('/').pop());
                             });
  src.push(PATH.dest.dev.ng2, 
           PATH.dest.dev.router,
           join(PATH.dest.dev.all, '**/*.css'));
  return src;
}

function getVersion(){
  var pkg = JSON.parse(fs.readFileSync('package.json'));
  return pkg.version;
}

function templateLocals() {
  return {
    VERSION: getVersion(),
    APP_BASE: APP_BASE
  };
}

function registerBumpTasks() {
  semverReleases.forEach((release) => {
                            var semverTaskName = 'semver.' + release;
                            var bumpTaskName = 'bump.' + release;
                            gulp.task(semverTaskName, 
                                      () => {
                                        var version = semver.inc(getVersion(), release);
                                        return gulp.src('package.json')
                                                   .pipe(bump({ version: version }))
                                                   .pipe(gulp.dest('./'));
                                      });
                            gulp.task(bumpTaskName, 
                                      (done) => {
                                        runSequence(semverTaskName, 
                                                    'build.app.prod', 
                                                    done);
                                      });
                          });
}
