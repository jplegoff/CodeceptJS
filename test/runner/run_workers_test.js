const assert = require('assert');
const path = require('path');
const exec = require('child_process').exec;
const semver = require('semver');

const runner = path.join(__dirname, '/../../bin/codecept.js');
const codecept_dir = path.join(__dirname, '/../data/sandbox');
const codecept_run = `${runner} run-workers --config ${codecept_dir}/codecept.workers.conf.js `;

describe('CodeceptJS Workers Runner', function () {
  this.timeout(40000);

  before(() => {
    global.codecept_dir = path.join(__dirname, '/../data/sandbox');
  });

  it('should run tests in 3 workers', function (done) {
    if (!semver.satisfies(process.version, '>=11.7.0')) this.skip('not for node version');
    exec(`${codecept_run} 3`, (err, stdout, stderr) => {
      stdout.should.include('CodeceptJS'); // feature
      stdout.should.include('glob current dir');
      stdout.should.include('From worker @1_grep print message 1');
      stdout.should.include('From worker @2_grep print message 2');
      stdout.should.include('Running tests in 3 workers');
      stdout.should.not.include('this is running inside worker');
      stdout.should.include('failed');
      stdout.should.include('File notafile not found');
      stdout.should.include('Scenario Steps:');
      assert(err.code === 1, 'failure');
      done();
    });
  });

  it('should use grep', function (done) {
    if (!semver.satisfies(process.version, '>=11.7.0')) this.skip('not for node version');
    exec(`${codecept_run} 2 --grep "grep"`, (err, stdout, stderr) => {
      stdout.should.include('CodeceptJS'); // feature
      stdout.should.not.include('glob current dir');
      stdout.should.include('From worker @1_grep print message 1');
      stdout.should.include('From worker @2_grep print message 2');
      stdout.should.include('Running tests in 2 workers');
      stdout.should.not.include('this is running inside worker');
      stdout.should.not.include('failed');
      stdout.should.not.include('File notafile not found');
      assert(!err);
      done();
    });
  });

  it('should show failures when suite is failing', function (done) {
    if (!semver.satisfies(process.version, '>=11.7.0')) this.skip('not for node version');
    exec(`${codecept_run} 2 --grep "Workers Failing"`, (err, stdout, stderr) => {
      stdout.should.include('CodeceptJS'); // feature
      stdout.should.include('Running tests in 2 workers');
      stdout.should.not.include('should not be executed');
      stdout.should.not.include('this is running inside worker');
      stdout.should.include('failed');
      stdout.should.include('FAILURES');
      stdout.should.include('worker has failed');
      assert(err.code === 1, 'failure');
      done();
    });
  });

  it('should print stdout in debug mode and load bootstrap', function (done) {
    if (!semver.satisfies(process.version, '>=11.7.0')) this.skip('not for node version');
    exec(`${codecept_run} 1 --grep "grep" --debug`, (err, stdout, stderr) => {
      stdout.should.include('CodeceptJS'); // feature
      stdout.should.include('Running tests in 1 workers');
      stdout.should.include('bootstrap b1+b2');
      stdout.should.include('message 1');
      stdout.should.include('message 2');
      stdout.should.include('see this is worker');
      assert(!err);
      done();
    });
  });
});
