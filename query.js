
var faker = require('faker');

function range(min, max, step) {
  if(typeof max !== 'number') {
    max = min;
    min = 0;
    step = 1;  
  } else if(typeof step !== 'number') {
    step = 1;
  }
  if(min === max) return [];
  step = Math.abs(step) * ((max-min)/Math.abs(max-min));
  var list = [];
  if(min < max) {
    while(min < max) {
      list.push(min);
      min += step;
    }
  } else {
    while(min > max) {
      list.push(min);
      min += step;
    }
  }
  return list;
}

function fakeInstances(builder, count) {
  // query._conditions {String: Any}
  // query._fields {String: Boolean}
  // query._mongooseOptions.lean Boolean
  var builder = Object.keys(query._fields)
    .filter(function(k) {return query._fields[k];})
    .reduce(function(obj, key) {
      var path = Model.schema.paths[key];
      if(path) {
        var fakeFunc;
        if(typeof path.fake === 'string') {
          fakeKeys = path.fake.split('.');
          fakeFunc = faker;
          var key;
          while(key = path.shift()) {
            fakeFunc = fakeFunc[key];
          }
        } else if(path.fake) {
          fakeFunc = path.fake;
        }
        // } else {
        //   fakeFunc = typeFake[path.type.name];
        // }
        obj[key] = fakeFunc;
      }
      return obj;     
    }, {});

  var buildKeys = Object.keys(builder);
  return range(0, count).map(function() {
    return buildKeys.reduce(function(obj, key) {
      obj[key] = builder[key];
      return obj;
    }, {});
  });
}

function FakeQuery(Model, findMethod, args) {
  // Idea: create an actual mongoose.Query,
  // proxy all FakeQuery methods to that
  // query instance and intercept on .exec(),
  // .then(), and callback arguments.
  
  function fake(query) {
    if(findMethod === 'findOne') return fakeInstances(Model, query, 1).pop();
    return fakeInstances(Model, query, query.options.limit || 10);
  }

  var Query = Model[findMethod];
  if(!Array.isArray(args)) args = Array.prototype.slice.call(this, 0);
  if(typeof args.slice(-1) === 'function') {
    var query = Query.apply(Query, args.slice(0, -1));
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

