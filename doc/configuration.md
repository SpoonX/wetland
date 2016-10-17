# Configuration
To get your application up and running, you need to set some things up first. In this section we are going to give you an example of how to create a simple todo application using wetland. We already made an example of a [todo application](https://github.com/SpoonX/wetland/tree/master/examples/todo), feel free to take a look or try it yourself.

## Creating a schema
The schema will define the properties of an entity, along with its fields and relationships. Here are the two entities we are going to use in this example. You can find all mapping options described on the Mapping chapter.

{% method %}
##### List schema
List:
 - name: VARCHAR(24)
 - todos: collection Todo

{% common %}
```
// ./entities/list
```

{% sample lang="js" %}
```js
let Todo = require('./todo');

class List {
  static setMapping(mapping) {
    mapping.forProperty('id').primary().increments();
    mapping.field('name', {type: 'string', size: 24});
    mapping.forProperty('todos')
      .oneToMany({targetEntity: Todo, mappedBy: 'list'})
      .cascade(['persist']);
  }
}

module.exports = List;
```

{% sample lang='ts' %}
```js
import {Todo} from './todo';

export class List {
  static setMapping(mapping) {
    mapping.forProperty('id').primary().increments();
    mapping.field('name', {type: 'string'});
    mapping.forProperty('todos')
      .oneToMany({targetEntity: Todo, mappedBy: 'list')
      .cascade(['persist', 'remove']);
  }
}
```
{% endmethod %}

{% method %}
##### Todo schema
Todo:
 - task: VARCHAR
 - done: BOOLEAN
 - list_id: INT

{% common %}
```
// ./entities/todo
```

{% sample lang="js" %}
```js
let List = require('./list');

class Todo {
  static setMapping(mapping) {
    mapping.forProperty('id').primary().increments();
    mapping.field('task', {type: 'string'});
    mapping.field('done', {type: 'boolean', defaultTo: false});
    mapping.forProperty('list')
      .manyToOne({targetEntity: List, inversedBy: 'todos'})
      .joinColumn({onDelete: 'cascade'});
  }
}

module.exports = Todo;
```

{% sample lang="ts" %}
```js
import {List} from './list';

export class Todo {
  static setMapping(mapping) {
    mapping.forProperty('id').primary().increments();
    mapping.field('task', {type: 'string'});
    mapping.field('done', {type: 'boolean', defaultTo: false});
    mapping.forProperty('list')
      .manyToOne({targetEntity: Todo, inversedBy: 'todos'})
      .joinColumn({onDelete: 'cascade'});
  }
}
```
{% endmethod %}

## Implementing wetland
Implementation and usage of wetland is quite simple. First, you must require wetland and then create a new instance. You can register both your stores and your entities upon creating a new instance, as we are demonstrating in this section. Other possibilities will be described later in this book. For demonstrative purposes, we are going to use MySQL as our database.
[//]: #specify_in_which_chapter

{% method %}
### Database configuration
You can use multiple databases to store you entities. If no stores are given, it defaults to an empty object. Normally you would want to set one database as default, specially if all your entities will be stored on the same database. If this is not your case, you can specify which database will be used for each of your entities upon creating your schema, using `.entity()`. The usage of this method will be explained on the next chapter.

{% sample lang="js" %}
```js
const Wetland = require('wetland');

let wetland = new Wetland({
  stores: {
    defaultStore: {
      client: 'mysql',
      connection: {
        user    : 'your-username',
        database: 'your-database'
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
    defaultStore: {
      client: 'mysql',
      connection: {
        user    : 'your-username',
        database: 'your-database'
      }
    }
  }
});
```
{% endmethod %}

### Registering entities
In this example we are registering our entities upon creating the wetland's instance, but there are many other convenient methods to register your entities and we are going to demonstrate how to use each one of them on Chapter x.
[//]: #Edit_related_chapter

{% method %}
##### Using an entity array

{% sample lang="js"%}
```js
const Wetland = require('wetland');
const List    = require('./entities/list');
const Todo    = require('./entities/todo');

let wetland = new Wetland({
  stores  : {...},
  entities: [List, Todo]
});
```

{% sample lang="ts" %}
```js
import {Wetland} from 'wetland';
import {List} from './list';
import {Todo} from './todo';

const wetland = new Wetland({
  stores  : {...},
  entities: [List, Todo]
});
```
{% endmethod %}

{% method %}
##### Using entities path

{% sample lang="js"%}
```js
const Wetland = require('wetland');

let wetland = new Wetland({
  stores : {...},
  entityPath: __dirname + './entities'
});
```

{% sample lang="ts" %}
```js
import {Wetland} from 'wetland';

const wetland = new Wetland({
  stores : {...},
  entityPath: __dirname + './entities'
});
```
{% endmethod %}
