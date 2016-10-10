# ![Wetland](https://cloud.githubusercontent.com/assets/67802/19230467/ed74d496-8ed4-11e6-84bf-4bcc7c5c2fef.png)

[![Build Status](https://travis-ci.org/SpoonX/wetland.svg?branch=master)](https://travis-ci.org/SpoonX/wetland)
[![npm version](https://badge.fury.io/js/wetland.svg)](https://badge.fury.io/js/wetland)
[![Dependency Status](https://gemnasium.com/badges/github.com/SpoonX/wetland.svg)](https://gemnasium.com/github.com/SpoonX/wetland)
[![Gitter chat](https://badges.gitter.im/SpoonX/Dev.svg)](https://gitter.im/SpoonX/Dev)

Wetland is an enterprise grade object-relational mapper (ORM) for node.js.

_**Note:** This module is under active development.
While it's usable and well tested, it's not done yet.
Some key features are still missing._

## Features
The following is a list of the biggest features this ORM provides.
For more detailed information, you can look at the tests until the documentation has been written.

* Unit of work
* Transactions
* Entity manager
* Manager scopes
* Cascade persist
* Deep joins
* Repositories
* QueryBuilder
* Mapping
* MetaData
* Entity proxy
* Collection proxy
* Criteria parser
* More...

## Installation
To install wetland simply run the following command:

`npm i --save wetland`

If you're using typescript, the typings are supplied by default. No additional typings have to be installed.

## Usage

Usage will be documented soon. To give you an idea, here's an implementation example:

```js
const Wetland = require('wetland').Wetland;
const Foo     = require('./entity/foo').Foo;
const Bar     = require('./entity/foo').Bar;
const wetland = new Wetland({
  stores: {
    simple: {
      client    : 'mysql',
      connection: {
        user    : 'root',
        database: 'testdatabase'
      }
    }
  },
  entities: [Foo, Bar]
});

// Create the tables. Async process, only here as example.
// use .getSQL() (not async) in stead of apply (async) to get the queries.
let migrator = wetland.getMigrator().create();
migrator.apply().then(() => {});

// Get a manager scope. Call this method for every context (e.g. requests).
let manager = wetland.getManager();

// Get the repository for Foo
let repository = manager.getRepository(Foo);

// Get some results, and join.
repository.find({name: 'cake'}, {joins: ['candles', 'baker', 'baker.address']})
  .then(results => {
    // ...
  });
```
