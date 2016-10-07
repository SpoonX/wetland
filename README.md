# ![Wetland](https://cloud.githubusercontent.com/assets/67802/19189074/3c112d48-8c96-11e6-82e0-c64caca59e77.png)

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
* Repositories
* QueryBuilder
* Mapping
* MetaData
* Entity proxy
* Criteria parser
* More...

## Installation
To install wetland simply run the following command:

`npm i --save wetland`

If you're using typescript, the typings are supplied by default. No additional typings have to be installed.

## Usage

Usage will be documented soon. To give you an idea, here's an implementation example:

### Vanilla
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

// Get a manager scope. Call this method for every context (e.g. requests).
let manager = wetland.getManager();

// Get the repository for Foo
let repository = manager.getRepository(Foo);

repository.find({name: 'cake'}).then(results => {
  // ...
});
```

### Babel / Typescript
```ts
import {Wetland} from 'wetland';
import {Foo} from './entity/Foo';
import {Bar} from './entity/Bar';

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

// Get a manager scope. Call this method for every context (e.g. requests).
let manager = wetland.getManager();

// Get the repository for Foo
let repository = manager.getRepository(Foo);

repository.find({name: 'cake'}).then(results => {
  // ...
});
```
