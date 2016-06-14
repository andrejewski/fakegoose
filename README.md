# Fakegoose

Fakegoose is a plugin for simulating queries and seeding collections in 
[Mongoose](https://github.com/Automattic/mongoose) using the 
[Faker](https://github.com/Marak/faker.js) contextual data generation tool. 
Fakegoose takes Mongoose schemas and generates the proper dummy data based
on the types and defaults described for on-the-fly queries or seeding
collections for testing.

```sh
npm install fakegoose
```

## Command-line Usage

### Seeding the database

```sh
fakegoose examples/chat-message.js --count 42 --seed mongodb://localhost:27017/test
```

### Quick JSON documents

```sh
fakegoose examples/chat-message.js --count 42
```

Without the `--seed [mongo_url]` argument, generated documents will be
printed with `console.log()`.

**Note:** Fakegoose must be installed globally `install --global` to be used from the command-line. 

## Programmatic Usage

Fakegoose works like other Mongoose plugins and only effects the
models of schemas it is applied to. Inside the schema, the `fake` 
property instructs Fakegoose how to generate fake data. See [Faker](https://github.com/Marak/faker.js)
for a list of all methods. If Faker does not have the generator
you need, `fake` can also be a function that takes no arguments.

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
    fake: 'lorem.paragraph' // calls faker.lorem.paragraph()
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

### Querying

The `fake` and `fakeOne` methods are drop-in replacements for
Mongoose's `find` and `findOne` accepting the same arguments
and using the same chaining interface. 

`Model.fake`
- `fake([conditions]) Query`
- `fake(conditions[, options]) Query`
- `fake(conditions[, options], callback:(error, results)) Query`

`Model.fakeOne`
- `fakeOne([conditions]) Query`
- `fakeOne(conditions[, options]) Query`
- `fakeOne(conditions[, options], callback:(error, results)) Query`

```js
// elsewhere
var assert = require('assert');
var mongoose = require('mongoose');
var ChatMessage = mongoose.model('ChatMessage');

ChatMessage.fakeOne({first: 'Chris'}, function(error, message) {
  if(error) {
    // this won't be called ever but is good
    // to include if #fakeOne is ever going
    // to be changed to #findOne.
  }
  assert.equal(message.first, 'Chris');
});
```

Fakegoose queries will conform to simple conditions, but don't yet
interpret `$[g|l]t[e]`, `$in`, or other expressions, but can with
help from viewers like you. Options like `select`, `limit`, `skip`,
and `lean` work properly, however complicated features such as
aggregation and `populate` do not..yet.

### Seeding

`Model.seed`
- `Model.seed(count:number[, forceAppend=false], callback:(error))`

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
