
var mongoose = require('mongoose');
var fakegoose = require('..'); // "fakegoose" outside of this project

var chatMessageSchema = new mongoose.Schema({
  first: {
    type: String,
    fake: 'name.firstName'  // calls faker.name.firstName()
  },
  last: {
    type: String,
    fake: 'name.lastName'   // calls faker.name.lastName()
  },
  text: {
    type: String,
    fake: 'lorem.paragraph' // calls fake.lorem.paragraph()
  },
  date: {
    type: Date,
    fake: 'date.past'       // you get the pattern
  }
});

chatMessageSchema.plugin(fakegoose);
module.exports = mongoose.model('ChatMessage', chatMessageSchema);

