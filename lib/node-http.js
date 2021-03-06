var http = require('http'),
    https = require('https'),
    url = require('url'),
    reges = require('reges'),
    eventy = require('eventy'),
    Bupper = require('bupper');

module.exports = function NodeHttp() {
  var options = {};
  var bupper = new Bupper;

  var nodeHttp = function () {
    return this;
  }.call(eventy({}));

  function makeRequest() {
    var client;

    if (options.protocol === 'http:') client = http;
    if (options.protocol === 'https:') client = https;

    var req = client.request(options, onResponse);

    req.on('error', onError);
    if (options.data) req.write(options.data);
    req.end();
  }

  function onResponse(response) {
    nodeHttp.trigger('response', response);

    response.on('data', function(chunk) {
      bupper.add(chunk);
    });

    response.on('end', function() {
      response.buffer = bupper.combine();
      nodeHttp.trigger('complete', response);
      nodeHttp.trigger('buffer', response.buffer, response);
      nodeHttp.trigger(response.statusCode, response);
      if (response.status === 200) nodeHttp.trigger('Ok', response).trigger('success', response);
      if (response.status === 201) nodeHttp.trigger('Created', response).trigger('success', response);
      if (response.status === 202) nodeHttp.trigger('Accepted', response).trigger('success', response);
      if (response.status === 204) nodeHttp.trigger('No Content', response).trigger('success', response);
      if (response.status === 301) nodeHttp.trigger('Moved Permanently', response);
      if (response.status === 302) nodeHttp.trigger('Found', response);
      if (response.status === 303) nodeHttp.trigger('See Other ', response);
      if (response.status === 304) nodeHttp.trigger('Not Modified', response);
      if (response.status === 403) nodeHttp.trigger('Forbidden', response).trigger('fail', response);
      if (response.status === 404) nodeHttp.trigger('Not Found', response).trigger('fail', response);
      if (response.status === 500) nodeHttp.trigger('Internal Server Error', response).trigger('fail', response);
    });
  }

  function onError(e) {
    nodeHttp.trigger('error', e);
  }

  nodeHttp.url = function (address) {
    address = url.parse(address);

    for (var k in address) {
      options[k] = address[k];
    }

    return this;
  }

  nodeHttp.header = function (name, value) {
    if (typeof options.headers === 'undefined') options.headers = {};
    options.header[name] = value;
    return this;
  }

  nodeHttp.method = function (name) {
    options.method = name;
    return this;
  }

  nodeHttp.data = function (data) {
    options.data = data;
    return this;
  }

  nodeHttp.complete = function (callback) {
    this.on('complete', callback);
    return this;
  }

  nodeHttp.success = function (callback) {
    this.on('success', callback);
    return this;
  }

  nodeHttp.fail = function (callback) {
    this.on('fail', callback);
    return this;
  }

  nodeHttp.GET = function (url, onComplete, onError) {
    this.url(url).method('GET');
    if (onComplete) this.on('complete', onComplete);
    if (onError) this.on('error', onError);
    return makeRequest();
  }

  /*
    Alias of GET
  */
  nodeHttp.get = nodeHttp.GET;

  nodeHttp.POST = function (url, data, onComplete, onError) {
    this.url(url).method('POST');
    if (onComplete) this.on('complete', onComplete);
    if (onError) this.on('error', onError);
    return makeRequest();
  }

  /*
    Alias of POST
  */
  nodeHttp.post = nodeHttp.POST;

  nodeHttp.request = function (opts, onComplete, onError) {
    options = opts;
    if (onComplete) this.on('complete', onComplete);
    if (onError) this.on('error', onError);
    return makeRequest();
  }

  nodeHttp.reset = function () {
    options = {};
    return this;
  }

  return nodeHttp;
}
