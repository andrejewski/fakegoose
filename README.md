# Fakegoose

Fakegoose is a plugin for simulating queries and seeding collections in 
[Mongoose](https://github.com/Automattic/mongoose) using the 
[Faker](https://github.com/Marak/faker.js) dummy data generation tool. 
Fakegoose takes Mongoose schemas and generates the proper dummy data based on the types and defaults described.

```sh
npm install fakegoose
```

## Usage

Fakegoose works like other Mongoose plugins and only effects the
Models of Schemas it is applied to. Inside the schema, the `fake` 
property instructs Fakegoose how to generate fake data. See [faker](https://github.com/Marak/faker.js)
for a list of all methods. 

```js
// models/chat-message.js
var mongoose = require('mongoose');
var fakegoose = require('fakegoose');

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
```

Fakegoose adds static methods `fake` (`find` variant) and 
`fakeOne` (`findOne` variant) for querying, and `seed` for
database population.

### `Model#fake() and Model#fakeOne()`

The `fake` and `fakeOne` methods are drop-in replacements for
Mongoose's `find` and `findOne` accepting the same arguments
and using the same chaining interface. 

```js
// elsewhere
var mongoose = require('mongoose');
var ChatMessage = mongoose.model('ChatMessage');

ChatMessage.fakeOne(function(error, message) {
  if(error) {
    // this won't be called ever but is good
    // to include if #fakeOne is ever going
    // to be changed to #findOne.
  }
});
```

Options like `select`, `limit`, `skip`, and `lean` work properly, however
complicated features such as aggregation and `populate` do not..yet.

### `Model.seed(count:number [, forceAppend=false], callback:(error))`

`Model.seed` adds `count` documents to the model's collection, passing
an error to the completion `callback` if there was a Mongoose error.
By default if you specify a `count` Fakegoose will only seed **at a maximum**
the number of documents necessary to reach the count. So if your collection
has 42 records and you call `Model.seed(69, ...)` only 27 documents will be
added to the collection. This is done because seeding generally is safe to
perform multiple times without overfilling the database. To add exactly
`count` documents, use `Model.seed(420, true, myCallback)`.

## Contributing

Contributions are incredibly welcome as long as they are standardly applicable
and pass the tests (or break bad ones). Tests are written in Mocha and
assertions are done with the Node.js core `assert` module.

```bash
# running tests
npm run test
```

Follow me on [Twitter](https://twitter.com/compooter) for updates or just for
the lolz and please check out my other [repositories](https://github.com/andrejewski)
 if I have earned it. I thank you for reading.

