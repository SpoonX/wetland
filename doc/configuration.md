# Configuration

To get your application up and running, you need to set some things up first. In this section we are going to give you an example of how to create a simple todo application using wetland.

## Creating a schema

The schema will define the fields, properties and relationships of the entity. Here are the two entities we are going to use in this todo application. You can find all mapping options described on the Mapping chapter.

###### List schema
{% method %}

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

###### Todo schema
{% method %}

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

A wetland's instance can be created by simply requiring wetland and

### Database configuration

### Registering entities

