# api-http

[![NPM Version](https://img.shields.io/npm/v/api-http.svg)](https://www.npmjs.com/package/api-http)
[![Build Status](https://img.shields.io/travis/aantthony/api-http/master.svg)](https://travis-ci.org/aantthony/api-http)

Simple Node.js class for performing HTTP requests.


```bash
npm install api-http
```

## Example Usage
```
var APIHTTP = require('api-http');

var facebook = new APIHTTP('https://graph.facebook.com/v2.5/');

facebook.get('me')
.then(function (person) {
  console.log(person.first_name);
});

```

## Methods

### .get(), .delete(), .head()

Arguments: [path, query]

Example Usage:

```js
// http://example.com/users?online=true
api.get('users', {online: true});
```

### .post(), .patch(), .put(), ... etc.

Arguments: [path, body, query]

Example Usage:
```js
api.post('customers', {
  firstName: 'John',
  lastName: 'Smith'
});
```


### .token(accessToken)

Create a new APIHTTP client scoped with an OAuth Bearer access token:

Example:

```js
facebook.token('2348923984324').get('me')
```

## Options / Properties

### accessToken

Scope the client to an OAuth Bearer access token. This is an alternative to using the `.token(accessToken)` method, which would be more convenient if you are using different access tokens for multiple requests.

### error

Function: [res]

Transform responses with a 4xx or 5xx HTTP status.

The default implementation will try to pick up the error message to set `.status`, `.name`, and `.code` automatically.

Example:
```js
var client = new APIHTTP('http://localhost:8080', {
  error: function rejectHandler(res) {
    throw new Error(res.message);
  }
})
```

### success

Function: [res]

Transform responses with 2xx HTTP status codes.

If you wanted, you could pass the result through [camelize](https://www.npmjs.com/package/camelize) or something.

Default implementation:

```js
function success(res) {
  return res.data;
}
```

### headers

Function: []

Function which returns the headers for the request.
In general, you will never need to pass this option unless you are overriding the authentication logic. If you wanted to set a custom user-agent, or add a correlation ID, subclass this method and don't forget to call `super()`.

Note: All of the options simply set keys on `this` which means you can easily subclass APIHTTP.
