#!/usr/bin/env node

const path = require('path');
const fakegoose = require('..');
const package = require('../package');
const mongoose = require('mongoose');
const commander = require('commander');

const defaultCount = 1;
const defaultSeed = 'mongodb://localhost:27017/test';

commander
  .version(package.version)
  .arguments('<file>')
  .option('--count [int]', 'number of documents to create', parseInt)
  .option('--seed [mongo_url]', 'mongodb database url')
  .parse(process.argv);

const modelFile = commander.args.pop();
if(!modelFile) {
  throw new Error('Please specify a Mongoose model file');
}

const Model = require(path.join(process.cwd(), modelFile));
if(!(Model && Model.schema)) {
  throw new Error(`"${modelFile}" does not export a Mongoose Model:
    EXAMPLE: module.exports = mongoose.model('MyModel', myModelSchema);\n\n`);
}

Model.schema.plugin(fakegoose);
const count = commander.count || defaultCount;

function printRecords(error, records) {
  if(error) throw error;
  console.log(JSON.stringify(records, null, 2));
}

if(commander.seed) {
  var forceAppend = true;
  mongoose.connect(commander.seed || defaultSeed);
  Model.seed(count, forceAppend, function(error) {
    if(error) throw error;
  });
} else if(count === 1) {
  Model
    .fakeOne()
    .lean()
    .exec(printRecords);
} else {
  Model
    .fake()
    .lean()
    .limit(count)
    .exec(printRecords);
}
