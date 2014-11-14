module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Project configuration.
  grunt.initConfig({

    //Cartelle
    cartelle: {
      development: 'FRONTEND/IN',
      distribution: 'FRONTEND/OUT',
      temporary: '.tmp',
      server_public: 'public',
      server_views: 'views'
    },

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      js: {
          files: ['<%= cartelle.development %>/scripts/{,*/}*.js'],
          tasks: ['jshint','uglify'],
          options: {
              livereload: true
          }
      },
      gruntfile: {
          files: ['Gruntfile.js'],
          tasks: ['default']
      },
      compass: {
          files: ['<%= cartelle.development %>/stylesheets/{,*/}*.{scss,sass}'],
          tasks: ['compass', 'cssmin']
      },
      styles: {
          files: ['<%= cartelle.development %>/stylesheets/{,*/}*.css'],
          tasks: ['cssmin']
      },
      jade:{
        files: ['<%= cartelle.development %>/{,*/}*.jade'],
        tasks: ['jade', 'copy']
      },
      images:{
        files: ['<%= cartelle.development %>*.{gif,jpeg,jpg,png,svg,webp}'],
        tasks: ['concurrent']
      },
      other:{
        files: ['<%= cartelle.development %>stylesheets/fonts/{,*/}*.*'],
        tasks: ['copy']
      },
      livereload: {
          options: {
              livereload: '<%= connect.options.livereload %>'
          },
          files: [
              '<%= cartelle.distribution %>/{,*/}*.html',
              '<%= cartelle.distribution %>/styles/{,*/}*.css',
              '<%= cartelle.distribution %>/scripts/{,*/}*.js',
              '<%= cartelle.development %>styles/fonts/{,*/}*.*',
              '<%= cartelle.distribution %>/images/{,*/}*.{gif,jpeg,jpg,png,svg,webp}'
          ]
      }
    },

    // The actual grunt server settings
    connect: {
      options: {
          port: 3000,
          livereload: 35755,
          // Change this to '0.0.0.0' to access the server from outside
          hostname: 'localhost'
      },
      livereload: {
          options: {
              open: true,
              base: [
                  '<%= cartelle.distribution %>'
              ]
          }
      }
    },

    // includes: {
    //   files: {
    //     src: ['<%= cartelle.development %>/*.html'], // Source files
    //     dest: '<%= cartelle.distribution %>', // Destination directory
    //     flatten: true,
    //     cwd: '.',
    //     options: {
    //       silent: true,
    //       banner: '<!-- Player Wellness -->'
    //     }
    //   }
    // },
    
    bower_concat: {
      all: {
        dest: '<%= cartelle.temporary %>/scripts/bower.js'
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
       options: {
          browser: true,
          '-W099': true,
          '-W041': true,
          smarttabs:true,
          asi: true,
          boss: true,
          globals: {
            jQuery: true
          },
        },
        all: [
            'Gruntfile.js',
            '<%= cartelle.development %>/scripts/{,*/}*.js'
        ]
    },

    compass: {
        options: {
            sassDir: '<%= cartelle.development %>/stylesheets',
            cssDir: '.tmp/stylesheets',
            generatedImagesDir: '<%= cartelle.development %>/imgs',
            imagesDir: '<%= cartelle.development %>/imgs',
            javascriptsDir: '<%= cartelle.development %>/scripts',
            fontsDir: '<%= cartelle.development %>/stylesheets/fonts',
            importPath: '<%= cartelle.development %>/scripts',
            httpImagesPath: '/imgs',
            httpGeneratedImagesPath: '/imgs/generated',
            httpFontsPath: '/stylesheets/fonts',
            relativeAssets: false,
            assetCacheBuster: false
        },
        server: {
            options: {
                debugInfo: false
            }
        }
    },

    pkg: grunt.file.readJSON('package.json'),

    // Run some tasks in parallel to speed up build process
    concurrent: {
      dist: [
          'imagemin',
          'svgmin',
          'compass'
      ]
    },

   imagemin: {
        dist: {
            files: [{
                expand: true,
                cwd: '<%= cartelle.development %>/imgs',
                src: '{,*/}*.{gif,jpeg,jpg,png}',
                dest: '<%= cartelle.distribution %>/imgs'
            },
            {
                expand: true,
                cwd: '<%= cartelle.development %>/imgs',
                src: '{,*/}*.{gif,jpeg,jpg,png}',
                dest: '<%= cartelle.server_public %>/imgs'
            }]
        }
    },

    svgmin: {
        dist: {
            files: [{
                expand: true,
                cwd: '<%= cartelle.development %>/imgs',
                src: '{,*/}*.svg',
                dest: '<%= cartelle.distribution %>/imgs'
            },
            {
                expand: true,
                cwd: '<%= cartelle.development %>/imgs',
                src: '{,*/}*.svg',
                dest: '<%= cartelle.server_public %>/imgs'
            }]
        }
    },

    // Copies remaining files to places other tasks can use
    copy: {
        dist: {
            files: [{
                expand: true,
                dot: true,
                cwd: '<%= cartelle.development %>',
                dest: '<%= cartelle.distribution %>',
                src: [
                    'stylesheets/fonts/{,*/}*.*'
                ]
            },
            {
                expand: true,
                dot: true,
                cwd: '<%= cartelle.development %>',
                dest: '<%= cartelle.server_public %>',
                src: [
                    'stylesheets/fonts/{,*/}*.*'
                ]
            },
            {
                expand: true,
                dot: true,
                cwd: '<%= cartelle.development %>',
                dest: '<%= cartelle.server_views %>',
                src: [
                    '{,*/}*.jade'
                ]
            }]
        }
    },

    uglify: {
      options: {
        beautify: false,
        mangle: false
      },
      bower: {
        files: {
          '<%= cartelle.distribution %>/scripts/bower.min.js': ['<%= cartelle.temporary %>/scripts/bower.js'],
          '<%= cartelle.server_public %>/scripts/bower.min.js': ['<%= cartelle.temporary %>/scripts/bower.js']
        }
      },
      scripts: {
        files: {
          '<%= cartelle.distribution %>/scripts/scripts.min.js': ['<%= cartelle.development %>/scripts/**.js'],
          '<%= cartelle.server_public %>/scripts/scripts.min.js': ['<%= cartelle.development %>/scripts/**.js']
        }
      }
    },

    // 'ftp-deploy': {
    //     build: {
    //       auth: {
    //         host: '23.229.173.40',
    //         port: 21,
    //         authKey: 'key1'
    //       },
    //       src: '<%= cartelle.distribution %>',
    //       dest: 'public_html/test'
    //     }
    // },

    cssmin: {
      dist: {
          files: [{
              '<%= cartelle.distribution %>/stylesheets/main.min.css': [
                  '<%= cartelle.temporary %>/stylesheets/{,*/}*.css',
                  '<%= cartelle.development %>/stylesheets/{,*/}*.css',
                  '<%= cartelle.development %>/bower_components/bootstrap/dist/css/bootstrap.min.css'
              ]},
              {'<%= cartelle.server_public %>/stylesheets/main.min.css': [
                  '<%= cartelle.temporary %>/stylesheets/{,*/}*.css',
                  '<%= cartelle.development %>/stylesheets/{,*/}*.css',
                  '<%= cartelle.development %>/bower_components/bootstrap/dist/css/bootstrap.min.css'
              ]}]
      }
    },

    jade: {
      compile: {
        options: {
          pretty: true,
          data: function(dest, src) {
            // Return an object of data to pass to templates
            return require('./jade_locals.json');
          },
          debug: false
        },
        files: [ {
                  src: ["**/*.jade", '!layout.jade'],
                  dest: "<%= cartelle.distribution %>",
                  ext: ".html",
                  expand: true,
                  cwd: "<%= cartelle.development %>"
                } ]
      }
    },

    // Empties folders to start fresh
    clean: [
            '<%= cartelle.temporary %>',
            '<%= cartelle.distribution %>/*',
            '!<%= cartelle.distribution %>/.git*',
            '<%= cartelle.server_public %>/*',
            '<%= cartelle.server_views %>/*'
            ]
  });
  
  grunt.registerTask('build', [
        'clean',
        'jshint',
        'concurrent',
        'uglify:scripts',
        'bower_concat',
        'uglify:bower',
        'cssmin',
        'jade',
        'copy'
    ]);

  // Default task(s).
  grunt.registerTask('default', [
    'build',
    'connect:livereload',
    'watch'
    ]);
};