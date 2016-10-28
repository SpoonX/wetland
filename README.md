# ![Wetland](https://cdn.rawgit.com/SpoonX/wetland/master/wetland.svg)

[![Build Status](https://travis-ci.org/SpoonX/wetland.svg?branch=master)](https://travis-ci.org/SpoonX/wetland)
[![npm version](https://badge.fury.io/js/wetland.svg)](https://badge.fury.io/js/wetland)
[![Gitter chat](https://badges.gitter.im/SpoonX/Dev.svg)](https://gitter.im/SpoonX/Dev)
[![Donate](https://img.shields.io/badge/donate-patreon-orange.svg?style=flat)](https://www.patreon.com/user?u=4274718)

Wetland is a modern, and enterprise grade object-relational mapper (ORM) for node.js.
It allows you to get started quickly, without losing flexibility or features.

## Features
Some of the major features provided include:

* Unit of work
* Migrations
* Transactions
* Entity manager
* Cascaded persists
* Deep joins
* Repositories
* QueryBuilder
* Entity mapping
* Optimized state manager
* Recipe based hydration
* [More...](https://wetland.spoonx.org)

## Installation
To install wetland run the following command:

`npm i --save wetland`

Typings are provided by default for TypeScript users. No additional typings need installing.

## Compatibility

* All operating systems
* Node.js 6.0+

## Usage

The following is a snippet to give you an idea what it's like to work with wetland.
For a much more detailed explanation, [head to the documention.](https://wetland.spoonx.org).

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
