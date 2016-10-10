# Example todo
This is a small example utilizing wetland to create a todo application.

It shows you how to create a schema, run the migrator, query the database, apply cascaded persists and more.

## Setting up

Create a project directory, and navigate to it.

- `npm init -y`
- `npm i sqlite3 wetland --save`
- `cp -r node_modules/wetland/examples/todo/* .`

The project is all set up now.

## Running
To run the examples, follow the following commands.

**NOTE:** Run the `setup` command first. Otherwise there won't be a schema to query against.

### setup
Run using `node todo setup`.

This sets up the schema.

### create-list
Run using `node todo create-list <list_name>`.

### create-full
Run using `node todo create-full <list_name> [todo, todo, ...]`.

### show-all
Run using `node todo show-all`.

### add-todo
Run using `node todo add-todo <list_name> <todo>`.

### done
Run using `node todo done <list_name> <todo>`.

### remove-todo
Run using `node todo remove-todo <list_name> <todo>`.

### delete-list
Run using `node todo delete-list <list_name>`.

