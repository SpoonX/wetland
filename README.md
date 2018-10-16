# ![Wetland](https://cdn.rawgit.com/SpoonX/wetland/391040eba795183550bfff01d7c0ca56d01b5530/wetland.svg)

[![Build Status](https://travis-ci.org/SpoonX/wetland.svg?branch=master)](https://travis-ci.org/SpoonX/wetland)
[![npm version](https://badge.fury.io/js/wetland.svg)](https://badge.fury.io/js/wetland)
[![Slack Status](https://spoonx-slack.herokuapp.com/badge.svg)](https://spoonx-slack.herokuapp.com)

Wetland is a modern object-relational mapper (ORM) for node.js based on the JPA-spec.
It strikes a balance between ease and structure, allowing you to get started quickly, without losing flexibility or features.

**New!** Take a look at our [wetland tutorial](https://wetland.spoonx.org/Tutorial/setting-up.html).

**New!** Wetland CLI now has its [own repository](https://github.com/SpoonX/wetland-cli). `npm i -g wetland-cli`.

**New!** Wetland has a nice entity generator. Let us do the heavy lifting. [Repository can be found here](https://github.com/SpoonX/wetland-generator-entity).

## Features

Wetland is based on the [JPA-spec](http://download.oracle.com/otndocs/jcp/persistence-2_1-fr-eval-spec/index.html) and therefore has some similarities to Hibernate and Doctrine. While some aspects of the ORM have been adapted to perform better in the Node.js environment and don't follow the specification to the letter for that reason, the JPA specification is a stable and well written specification that makes wetland structured and performant.

Some of the major features provided include:

* Unit of work
* Derived tables
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

## Plugins / essentials

- [Wetland CLI](https://github.com/SpoonX/wetland-cli) `npm i -g wetland-cli`
- [Express middleware](https://github.com/SpoonX/express-wetland)
- [Sails.js hook](https://github.com/SpoonX/sails-hook-wetland)
- [Trailpack](https://github.com/SpoonX/trailpack-wetland)
- [Entity generator](https://github.com/SpoonX/wetland-generator-entity)

## Compatibility

* All operating systems
* Node.js 6.0+

## Gotchas

- When using sqlite3, foreign keys are disabled (this is due to alter table not working for foreign keys with sqlite).

## Usage

The following is a snippet to give you an idea what it's like to work with wetland.
For a much more detailed explanation, [head to the documentation.](https://wetland.spoonx.org).

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

### Entity example

#### Javascript

```js
const { UserRepository } = require('../repository/UserRepository');

class User {
  static setMapping(mapping) {
    // Adds id, updatedAt and createdAt for your convenience.
    mapping.autoFields();

    mapping.entity({ repository: UserRepository })
    mapping.field('dateOfBirth', { type: 'datetime' });
  }
}

module.exports.User = User;
```

#### Typescript

```js
import { entity, autoFields, field } from 'wetland';
import { UserRepository } from '../repository/UserRepository';

@entity({ repository: UserRepository })
@autoFields()
export class User {
  @field({ type: 'datetime' })
  public dateOfBirth: Date;
}
```

## License

MIT
