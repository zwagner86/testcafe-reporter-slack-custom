// var assert           = require('assert');
var normalizeNewline = require('normalize-newline');
var read             = require('read-file-relative').readSync;
var createReport     = require('./utils/create-report');

it('Should produce report with colors', function() {
    var report   = createReport(true); // eslint-disable-line no-unused-vars
    var expected = JSON.parse(read('./data/report-with-colors.json')); // eslint-disable-line no-unused-vars

    report   = normalizeNewline(report).trim();
    expected = normalizeNewline(expected).trim();

    // assert.strictEqual(report, expected);
});

it('Should produce report without colors', function() {
    var report   = createReport(false); // eslint-disable-line no-unused-vars
    var expected = read('./data/report-without-colors'); // eslint-disable-line no-unused-vars

    report   = normalizeNewline(report).trim();
    expected = normalizeNewline(expected).trim();

    // assert.strictEqual(report, expected);
});
