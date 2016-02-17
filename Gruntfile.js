module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    wiredep: {
  
      task: {
  
        // Point to the files that should be updated when
        // you run `grunt wiredep`
        src: [
          '*.html',   // .html support...
          //'*.jade',   // .jade support...
          //'app/styles/main.scss',  // .scss & .sass support...
          //'app/config.yml'         // and .yml & .yaml support out of the box!
        ],
        
        options: {
          // See wiredep's configuration documentation for the options
          // you may pass:
          exclude: ['bower_components/tincan/build/tincan.js' ],
          // https://github.com/taptapship/wiredep#configuration
        }
      }
    }
  });
  
  grunt.loadNpmTasks('grunt-wiredep');
  
  grunt.registerTask('default', ['wiredep']);
};
