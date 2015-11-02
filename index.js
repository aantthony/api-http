'use strict'

var request = require('request')
var resolveURL = require('url').resolve

var P = (typeof Promise === 'undefined') ? require('es6-promise').Promise : Promise

module.exports = APIHTTP

function APIHTTP (baseURL, options) {
  if (!(this instanceof APIHTTP)) {
    // If `new` was not used:
    return new APIHTTP(baseURL, options)
  }

  if (typeof baseURL === 'object') {
    options = baseURL
    baseURL = options.baseURL
  }

  options = options || {}

  this.baseURL = baseURL

  if (options.baseURL) this.baseURL = options.baseURL
  if (options.error) this.error = options.error
  if (options.success) this.success = options.success
  if (options.headers) this.headers = options.headers

  if (options.Promise) this.Promise = options.promise
  if (options.accessToken) this.accessToken = options.accessToken
}

var proto = APIHTTP.prototype

// Allow promise library to be overriden
proto.Promise = P

proto.headers = function () {
  if (this.accessToken) {
    return {
      Authorization: 'Bearer ' + this.accessToken
    }
  }
  return {}
}

proto.token = function (accessToken) {
  var newClient = Object.create(this)
  newClient.accessToken = accessToken
  return newClient
}

proto.error = function (res) {
  var message = res.body.message || res.body.msg
  var name = res.body.name
  var code = res.body.code

  if (res.body.error) {
    var errData = res.body.error
    message = message || errData.error_user_msg || errData.message
    name = name || errData.type || errData.name
    code = code || errData.code
  }

  if (typeof res.body === 'string') message = res.body

  var error = new Error(message)

  // Detected parameters:
  error.name = name
  error.code = code

  // Response parameters:
  error.status = res.statusCode
  error.data = res.body

  throw error
}

proto.success = function (res) {
  return res.body
}

proto.request = function (method, path, body, query) {
  var self = this

  var url = resolveURL(this.baseURL || '/', path)
  var headers = this.headers()

  return new this.Promise(function (resolve, reject) {
    request({
      headers: headers,
      method: method,
      url: url,
      qs: query,
      json: true,
      body: body
    }, function (err, res, responseBody) {
      if (err) return reject(err)
      resolve(
        self.Promise.resolve()
        .then(function () {
          if (res.statusCode >= 400) {
            return self.error(res)
          } else {
            return self.success(res)
          }
        })
      )
    })
  })
}

// Methods without body:
var methodsWithoutBody = ['get', 'delete', 'head']
methodsWithoutBody.forEach(function (method) {
  proto[method] = function (path, query) {
    return this.request(method, path, undefined, query)
  }
})

// Other Methods:
require('methods').forEach(function (method) {
  if (proto[method]) return
  proto[method] = function (path, body, query) {
    return this.request(method, path, body, query)
  }
})
