# api-http

[![NPM Version](https://img.shields.io/npm/v/api-http.svg)](https://www.npmjs.com/package/api-http)
[![Build Status](https://img.shields.io/travis/aantthony/api-http/master.svg)](https://travis-ci.org/aantthony/api-http)

Simple Node.js class for performing HTTP requests.


```bash
npm install api-http
```

## Example Usage

```js
import ApiHttp from 'api-http';

const facebook = new APIHTTP('https://graph.facebook.com/v2.5/');

const person = await facebook.get('me')
console.log(person.first_name);

```

## Methods

### .get(), .delete(), .head()

Arguments: [path, query]

Example Usage:

```js
var api = require('api-http')('http://example.com/');
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


### .withAccessToken(accessToken)

Create a new APIHTTP client scoped with an OAuth Bearer access token:

Example:

```js
facebook.withAccessToken('2348923984324').get('me')
```

### .withBasicAuth(username, password)

Create a new APIHTTP client scoped with a [Basic Access Authorization](https://en.wikipedia.org/wiki/Basic_access_authentication) header:

Example:

```js
api.withBasicAuth('Aladdin', 'open sesame').get('something/x/y')
```
