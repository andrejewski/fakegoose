
var FakeQuery = require('./query');

function fakegoose(schema, options) {

  schema.static('fake', function() {
    return FakeQuery(this, this.find, arguments);
  });

  schema.static('fakeOne', function() {
    return FakeQuery(this, this.findOne, arguments);
  });

}

module.exports = fakegoose;

