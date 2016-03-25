
var faker = require('faker');

function FakeQuery(Model, findMethod, args) {
  // Idea: create an actual mongoose.Query,
  // proxy all FakeQuery methods to that
  // query instance and intercept on .exec(),
  // .then(), and callback arguments.
  
  function fake(query) {
    // TODO: create fake result from real query
  }

  var Query = Model[findMethod];
  if(!Array.isArray(args)) args = Array.prototype.slice.call(this, 0);
  if(typeof args.slice(-1) === 'function') {
    var query = Query.apply(Query, args.slice(0,1));
    return args.slice(-1)(null, fake(query));
  }

  var query = Query.apply(Query, arguments);
  var fakeQuery = {};

  function intercept(method) {
    function _intercept(success, failure) {
      if(method === 'exec') return success(null, fake(query));
      if(method === 'then') return success(fake(query));
      if(typeof arguments[arugments.length-1] === 'function') {
        var args = Array.prototype.slice.call(arguments, 0);
        query[method].apply(query, args.slice(0, -1));
        args.pop()(null, fake(query));
      } else {
        query[method].apply(query, arguments);
      }
      return fakeQuery;
    }
  }

  Object.keys(query)
    .filter(function(method) {
      return typeof query[method] === 'function';
    })
    .reduce(function(query, method) {
      query[method] = intercept(method);
      return query;
    }, fakeQuery);

  return fakeQuery;
}

module.exports = FakeQuery;

