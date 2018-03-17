
var async = require('async');
var faker = require('faker');

function fake(model, rawArgs) {
  var args = Array.prototype.slice.call(rawArgs, 0);
  return fakeMethod('find', model, args);
}

function fakeOne(model, rawArgs) {
  var args = Array.prototype.slice.call(rawArgs, 0);
  return fakeMethod('findOne', model, args);
}

function fakeMethod(findMethod, model, args) {
  var callback;
  if(typeof args[args.length - 1] === 'function') {
    callback = args.pop();
  }
  var query = makeFakeQuery(model[findMethod].apply(model, args));
  if(callback) {
    query.exec(callback);
  }
  return query;
}

function makeFakeQuery(mongooseQuery) {
  mongooseQuery.exec = function(callback) {
    process.nextTick(function() {
      var result = generateResult(mongooseQuery);
      callback(null, result);
    });
  }

  mongooseQuery.then = function(resolve, reject) {
    process.nextTick(function() {
      var result = generateResult(mongooseQuery);
      resolve(result);
    });
  }

  return mongooseQuery;
}

function generateResult(query) {
  if(query.op === 'findOne') {
    return makeFakeDocument(query);
  } else {
    var count = query.options.limit || 100;
    var results = Array(count);
    for(var i = 0; i < count; i++) {
      results[i] = makeFakeDocument(query);
    }
    return results;
  }
}

function makeFakeDocument(query) {
  var model = query.model; // check
  var doc = selectFields(query)
    .reduce(function(doc, path) {
      var value = fakePathParam(model, path);
      doc[path] = typeof value === 'function'
        ? value()
        : value;
      return doc;
    }, {});

  Object.assign(doc, conditionalProps(query));

  var isLean = query._mongooseOptions.lean;
  if(isLean) return doc;
  return new model(doc);
}

function selectFields(query) {
  var fields = query._fields || allPaths(query);
  return Object.keys(fields)
    .filter(function(key) {
      return fields[key];
    });
}

function allPaths(query) {
  // Mongoose does not explicit require paths unless
  // specified, leaving it to Mongo -- we can't.
  var paths = query.model.schema.paths;
  return paths;
}

function fakePathParam(model, pathName) {
  var path = model.schema.paths[pathName];
  if(!path) return null;
  path.options = path.options || {};
  var prop = path.options.fake;
  if(prop) {
    if(typeof prop === 'function') return prop;
    return nestedProp(faker, prop);
  }
  return path.options.default 
    || path.defaultValue 
    || makeNew(path.options.type);
}

function makeNew(constructor) {
  if(typeof constructor === 'function') {
    return constructor();
  }
}

function nestedProp(obj, prop) {
  var nestedProps = prop.split('.');
  var key;
  while(key = nestedProps.shift()) {
    obj = obj[key];
  }
  return obj;
}

function conditionalProps(query) {
  var conds = query._conditions;
  var props = {};
  Object.keys(conds).forEach(function(key) {
    var value = conds[key];
    if(typeof value !== 'object') {
      return props[key] = value;
    }
    var $conds = Object.keys(value)
      .filter(function(key) {return key.charAt(0) === '$';});
    if(!$conds.length) return props[key] = value;
    $conds.forEach(function($cond) {
      console.log('[fakegoose]: "' + $cond + '" is not supported..yet');
    });
  });
  return props;
}

function seed(model, count, forceAppend, callback) {
  if(!callback) {
    callback = forceAppend;
    forceAppend = false;
  }
  if(forceAppend) return _seed(model, count, callback);
  model.count(function(error, total) {
    if(error) return callback(error);
    var remainder = Math.max(0, total - count);
    if(!remainder) return callback(null);
    _seed(model, remainder, callback);
  });
}

function _seed(model, count, callback) {
  var records = Array(count);
  for(var i = 0; i < count; i++) {
    records[i] = makeJsonDocument(model);
  }
  async.each(records, function(doc, next) {
    new model(doc).save(next);
  });
}

function makeJsonDocument(model) {
  var paths = Object.keys(model.schema.paths);
  return paths.reduce(function(doc, path) {
    var value = fakePathParam(model, path);
    doc[path] = typeof value === 'function'
      ? value()
      : value;
    return doc;
  }, {});
}

module.exports = {
  find: fake,
  findOne: fakeOne,
  seed: seed
};

