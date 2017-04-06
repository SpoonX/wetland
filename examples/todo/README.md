# Example todo
This is a small example utilizing wetland to create a todo application.

It shows you how to create a schema, run the migrator, query the database, apply cascaded persists and more.

## Setting up

Create a project directory, and navigate to it.

- `npm init -y`
- `npm i sqlite3 wetland --save`
- `cp -r node_modules/wetland/examples/todo/* .`

The project is all set up now.

## Mappings

*The mappings for List*
```js
class List {
  static setMapping(mapping) {
    mapping.forProperty('id').primary().increments();
    mapping.field('name', {type: 'string', size: 24});
    mapping.forProperty('todos')
      .oneToMany({targetEntity: Todo, mappedBy: 'list'})
      .cascade(['persist']);
  }
}
```

*The mappings for Todo*
```js
class Todo {
  static setMapping(mapping) {
    mapping.forProperty('id').primary().increments();
    mapping.field('task', {type: 'string'});
    mapping.field('done', {type: 'boolean', defaultTo: false});
    mapping.forProperty('list')
      .manyToOne({targetEntity: 'List', inversedBy: 'todos'})
      .joinColumn({onDelete: 'cascade'});
  }
}
```

## Running
To run the examples, follow the following commands.
Bear in  mind that both `.flush()` and `.execute()` return Promises that need to be handled.

**NOTE:** Run the `setup` command first. Otherwise there won't be a schema to query against.

### setup
Run using `node todo setup`.

This sets up the schema based on your entity mappings.

```js
return wetland.getMigrator().devMigrations()
  .then(() => console.log('Tables created'));
```

### create-list
Run using `node todo create-list <list_name>`.

This will create and persist the new list entity into the database.

```js
let newList  = new List;
newList.name = list;

return manager.persist(newList).flush();
```

### create-full
Run using `node todo create-full <list_name> [todo, todo, ...]`.

This will create and persist both the list and the todo(s) entities.

```js
let todos    = parameters.splice(4);
let newList  = new List;
let newTodos = [];

todos.forEach(todo => {
  let newTodo  = new Todo;
  newTodo.task = todo;

  newTodos.push(newTodo);
});

newList.name  = list;
newList.todos = newTodos;

return manager.persist(newList).flush();
```

### show-all
Run using `node todo show-all`.

This will fetch all lists and its respective todos.

```js
return manager.getRepository(List).find(null, {join: ['todos']})
  .then(all => console.log(util.inspect(all, { depth: 8 })));
```

### add-todo
Run using `node todo add-todo <list_name> <todo>`.

This will add a todo on the referred list.

```js
manager.getRepository(List).findOne({name: list}).then(list => {
  let newTodo  = new Todo;
  newTodo.task = todo;

  list.todos.add(newTodo);

  return manager.flush();
});
```

### done
Run using `node todo done <list_name> <todo>`.

This will update the referred todo setting its property `done` to `true`.

```js
return manager.getRepository(Todo)
  .find({'t.task': todo}, {alias: 't', populate: 't.list'})
  .then(all => {
    let rowToUpdate = all.filter(row => row.list.name === list)[0];

    rowToUpdate.done = true;

    return manager.flush();
  })
  .then(console.log(`Todo '${todo}' from list '${list}' was set as done.`));
```

### remove-todo
Run using `node todo remove-todo <list_name> <todo>`.

This will remove the todo from the referred list.

```js
return manager.getRepository(Todo)
  .findOne({'t.task': todo, 'list.name': list}, {alias: 't', join: ['t.list']})
  .then(todo => manager.remove(todo).flush());
```

### delete-list
Run using `node todo delete-list <list_name>`.

This will delete the list and all its todos.

```js
return manager.getRepository(List).findOne({name: list})
  .then(list => manager.remove(list).flush());
```
