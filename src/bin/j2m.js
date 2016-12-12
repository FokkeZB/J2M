#!/usr/bin/env node

var J2M = require('../J2M');
var settings = require('./settings');

var readline = require('readline');
var endOfLine = require('os').EOL;
var fs = require('fs');

var colors = require('colors');

/**
 * All content will be written into this string. This string will then be converted.
 * This cannot be done line-by-line because there are muliline contexts in both formats, that
 * would be discarded
 *
 * @type {string}
 */
var input = '';

/**
 * Does the final conversion of all data in the "input" variable and outputs it correctly
 */
function convert() {
	if (settings.toJ) {
		console.log(J2M.toJ(input));
	} else if (settings.toM) {
		console.log(J2M.toM(input));
	} else {
		console.error("Something went horribly wrong. This should never happen".red);
		process.exit(500);
	}
}


if (settings.stdin) {
	var rl = readline.createInterface({
		input: process.stdin,
		terminal: false
	});
	rl.on('line', function(line){
		input += line + endOfLine;
	});

	rl.on('close', function() {
		convert();
		process.exit(0);
	});
} else {
	input = fs.readFileSync(settings.filename, 'utf8');
	convert();
}
