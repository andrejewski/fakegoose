
var fakegoose = require('./fakegoose');

function fakegoosePlugin(schema, options) {

  schema.static('fake', function() {
    return fakegoose.find(this, arguments);
  });

  schema.static('fakeOne', function() {
    return fakegoose.findOne(this, arguments);
  });

  schema.static('seed', function(count, forceAppend, callback) {
    return fakegoose.seed(this, count, forceAppend, callback);
  });

}

module.exports = fakegoosePlugin;

