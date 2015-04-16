'use strict';

var packageJSON = require('./package.json');

module.exports = function (grunt) {

  var utils = require('./src/utils')(grunt);
  var tunnelId = Math.floor((new Date()).getTime() / 1000 - 1230768000).toString();

  function negateResult(result, callback) {
    // Reverses the job's passed status. Can be used as the onTestComplete callback for
    // the negative tests.
    var user = process.env.SAUCE_USERNAME;
    var pass = process.env.SAUCE_ACCESS_KEY;

    utils
    .makeRequest({
      method: 'PUT',
      url: ['https://saucelabs.com/rest/v1', user, 'jobs', result.job_id].join('/'),
      auth: { user: user, pass: pass },
      json: { passed: !result.passed }
    })
    .thenResolve(!result.passed)
    .nodeify(callback);
  }

  grunt.task.loadTasks('tasks');

  require('load-grunt-config')(grunt, {
    data: {
      srcFiles: ['tasks/**/*.js', 'src/**/*.js', 'Gruntfile.js'],
      negateResult: negateResult,
      tunnelId: tunnelId,
      baseSaucelabsTaskOptions: {
        build: process.env.TRAVIS_JOB_ID || 'dev-'+process.env.USER+':'+Date.now(),
        tags: ['v'+packageJSON.version, 'grunt-saucelabs'],
        browsers: [
          ['XP', 'chrome', '']
        ],
        tunneled: false,
        sauceConfig: {
          'video-upload-on-pass': false,
          'tunnel-identifier': tunnelId
        }
      }
    }
  });
};
