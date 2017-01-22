# Configuration
To get your application up and running, you need to set some things up first.
In this section we are going to give you an example of how to create a simple todo application using wetland.
We already made an example of a [todo application](https://github.com/SpoonX/wetland/tree/master/examples/todo), 
feel free to take a look or try it yourself.

{% method %}
## Stores
You can use multiple databases to store your entities. Database configurations are stored in `wetland.stores`.
If no stores are given upon wetland's instantiation, it defaults to an empty object.
In this quick start we are going to use a mysql database as our store.
[Here](installation.md#your-database) is a list of currently supported databases.
For examples of how to use multiple databases, please refer to our [Cookbook.]()

{% sample lang="js" %}
```js
const Wetland = require('wetland').Wetland;

const wetland = new Wetland({
  stores: {
    myStore: {
      client: 'mysql',
      connection: {
        host    : 'localhost',
        user    : 'root',
        database: 'database'
      }
    }
  }
});
```

{% sample lang="ts" %}
```js
import {Wetland} from 'wetland';

const wetland = new Wetland({
  stores: {
    myStore: {
      client: 'mysql',
      connection: {
        host    : 'localhost',
        user    : 'root',
        database: 'wetland_database'
      }
    }
  }
});
```
{% endmethod %}

{% method %}
## Default Store
To set one of your stores to be the default store, you can either change your store key to `defaultStore` on 
`wetland.stores` or use your custom name as a value on `wetland.defaultStore`.

{% common %}
```js
const wetland = new Wetland({
  stores: {
    defaultStore: {...}
  }
});
```

{% common %}
```js
const wetland = new Wetland({
  stores: {
    myStore: {...}
  },
  defaultStore: 'myStore'
});
```
{% endmethod %}

{% method %}
## Entities
Wetland holds your entities on `wetland.entities`.
One way to register your entities is requiring each of your entities on your main file, and then passing them inside an array 
upon creating a new wetland instance.

{% sample lang="js" %}
```js
const Entity1 = require('./entities/Entity1');
const Entity2 = require('./entities/Entity2');
const wetland = new Wetland({
  entities: [Entity1, Entity2]
});
```

{% sample lang="ts" %}
```js
import {Entity1} from './entities/Entity1';
import {Entity2} from './entities/Entity2';

const wetland = new Wetland({
  entities: [Entity1, Entity2]
});
```
{% endmethod %}

{% method %}
## Mapping
Using the mapping config key you're able to configure some of the mapping's behavior.

{% common %}
```js
const wetland = new Wetland({
  mapping: {
    // Automatically convert camel-cased property names...
    // ... to underscored column-names.
    defaultNamesToUnderscore: false,

    // Default values for mappings.
    // Useful to set auto-persist (defaults to empty array).
    defaults: {cascades: ['persist']}
  }
});
```

{% endmethod %}

{% method %}
## Entity Path
If you have multiple entities on a single directory and you want to register them without having to require each one of them, 
you can simply write the path to your directory on `wetland.entityPath` to register all the entities in that directory.

{% common %}
```js
const wetland = new Wetland({
  entityPath: __dirname + './entities'
});
```
{% endmethod %}

{% method %}
## Entity Paths
If you have multiple entities in multiple directories, you can register all of them on `wetland.entityPaths`.
It works the same way as `entityPath` but you pass all your paths inside of an array.
Wetland will register all your entities in all given directories.

{% common %}
```js
const wetland = new Wetland({
  entityPath: [__dirname + './entities', __dirname + './moreEntities']
});
```
{% endmethod %}

{% method %}
## Debug
For debugging, simply set `wetland.debug` to true.

{% common %}
```js
const wetland = new Wetland({
  debug: true
});
```
{% endmethod %}

{% method %}
## Migrator
To configure a migration, change the properties on `wetland.migrator`. The options for the migrator config 
can be found on the [Migrator API.](./API/migrator.md)

{% common %}
```js
const wetland = new Wetland({
  migrator: {...}
});
```
{% endmethod %}
