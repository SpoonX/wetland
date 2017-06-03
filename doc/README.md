# ![Wetland](https://cdn.rawgit.com/SpoonX/wetland/391040eba795183550bfff01d7c0ca56d01b5530/wetland.svg)

Wetland is a modern object-relational mapper (ORM) for node.js.

- [View on github](https://github.com/SpoonX/wetland)
- [View the quick start](https://wetland.spoonx.org/quick-start.html)
- [View the tutorial](https://github.com/SpoonX/swetland)

## Features

**New!** Take a look at our [wetland tutorial](https://wetland.spoonx.org/Tutorial/setting-up.html).

**New!** Wetland CLI now has its [own repository](https://github.com/SpoonX/wetland-cli). `npm i -g wetland-cli`.

**New!** Wetland has a nice entity generator. Let us do the heavy lifting. [Repository can be found here](https://github.com/SpoonX/wetland-generator-entity).

The major features this ORM provides are listed below.
Looking at the tests will provide more detailed information, pending full documentation.

* Unit of work
* Derived tables
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

## Plugins / essentials

- [Wetland CLI](https://github.com/SpoonX/wetland-cli) `npm i -g wetland-cli`
- [Express middleware](https://github.com/SpoonX/express-wetland)
- [Sails.js hook](https://github.com/SpoonX/sails-hook-wetland)
- [Trailpack](https://github.com/SpoonX/trailpack-wetland)
- [Entity generator](https://github.com/SpoonX/wetland-generator-entity)

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
repository.find({name: 'cake'}, {populate: ['candles', 'baker', 'baker.address']})
  .then(results => {
    // ...
  });
```

## License

MIT
