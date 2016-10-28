# ![Wetland](https://cdn.rawgit.com/SpoonX/wetland/master/wetland.svg)

Wetland is an enterprise grade object-relational mapper (ORM) for node.js.

_**Note:** This module is under active development.
While it's usable and well tested, some key features are still in progress._

## Features
The major features this ORM provides are listed below.
Looking at the tests will provide more detailed information, pending full documentation.

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
To install wetland run the following command:

`npm i --save wetland`

Typings are provided by default for TypeScript users. No additional typings need installing.

## Usage

Simple implementation example:

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

Additional documentation is in progress.
