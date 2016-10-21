# Quick start
Here we will show you how to use basic methods to apply changes and fetch items from your database.
More detailed examples can be found in our Cookbook.

## Prerequisites
For this guide, we will assume you have both [node](https://nodejs.org/en/download/current/) and 
[npm](https://www.npmjs.com/get-npm) installed.
Your node version must be 6.0 or above to be compatible with all ES6 features. We will also assume you have one of the 
[databases](./installation.md#your-database) supported by wetland.

{% method %}
## Creating an entity
One way of creating your entities is creating a file for each of them on the same directory.
In this example, we will store them in `./entities`. [Mapping methods](./API/mapping.md) are used to configure your 
entity's schema. Here is what an entity file looks like:

{% sample lang="js" %}
```js
class User {
  static setMapping(mapping) {
    mapping.forProperty('id').primary().increments();
    mapping.field('name', {type: 'string', size: 40});
    mapping.field('phone', {type: 'integer'});
  }
}

module.exports.User = User;
```
{% sample lang="ts" %}
```js
export class User {
  static setMapping(mapping) {
    mapping.forProperty('id').primary().increments();
    mapping.field('name', {type: 'string', size: 40});
    mapping.field('phone', {type: 'integer'});
  }
}
```
{% endmethod %}

{% method %}
## Implementing wetland
In this quick start, we will register both our entities and our default store upon wetland's instantiation. Wetland 
will fetch all entity files on the `wetland.entityPath` directory and register each one of them.
There are many ways to register entities and stores, detailed examples can be found in our Cookbook. 

{% sample lang="js" %}
```js
const Wetland = require('wetland').Wetland;
const wetland = new Wetland({
  stores: {
    defaultStore: {
      client    : 'mysql',
      connection: {
        host    : '127.0.0.1',
        username: 'root',
        database: 'my_database'
      }
    }
  },
  entityPath: __dirname + './entities' 
});

```

{% sample lang="ts" %}
```js
import {Wetland} from 'wetland';

const wetland = new Wetland({
  stores: {
    defaultStore: {
      client    : 'mysql',
      connection: {
        host    : '127.0.0.1',
        username: 'root',
        database: 'my_database'
      }
    }
  },
  entityPath: __dirname + './entities' 
});
```
{% endmethod %}

{% method %}
## "I'd like to speak to the manager!"
To instantiate the entity manager all you need to do is call `.getManager()` on your wetland instance.
The entity manager distributes scopes and supplies some core methods to be used in your application.

{% sample lang="js" %}
```js
let manager = wetland.getManager();
```

{% sample lang="ts" %}
```js
let manager = wetland.getManager();
```
{% endmethod %}

{% method %}
## Creating new rows
Creating a new row is very easy.
All you have to do is create a new instance of your entity and add its properties like with any object.

{% common %}
```js
let newUser  = new User();
newUser.name = 'Wesley';
```
{% endmethod %}

{% method %}
## Persisting changes
To persist changes into your database, call  `.persist()` to stage this entity to be persisted and `.flush()` to apply those changes.

{% common %}
```js
manager.persist(newUser).flush().then(() => console.log('New user created'));
```
{% endmethod %}

{% method %}
## Fetching from the database
To fetch rows from your database, call `.getRepository()` to specify which table you are fetching from and `.find()` to 
fetch based on your criteria.

{% common %}
```js
manager.getRepository(User).find({name: 'Wesley'}).then();
```
{% endmethod %}
