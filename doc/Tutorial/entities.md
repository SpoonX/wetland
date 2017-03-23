# Entities
> To clone the finished code for this part of the tutorial, run the following command:
>
> `git clone git@github.com:SpoonX/wetland-tutorial.git -b 2-entities --single-branch`
>
> To clone the base code for this part of the tutorial, run the following command:
>
> `git clone git@github.com:SpoonX/wetland-tutorial.git -b 1-setting-up --single-branch`
>
> **Github:** [Diff for this part of the tutorial](https://github.com/SpoonX/wetland-tutorial/compare/1-setting-up...2-entities?diff=split) - [Full repository on github](https://github.com/SpoonX/wetland-tutorial)

In this part of the tutorial, we'll be looking at actual code. We'll create an entity, create a schema and set up a relation.

## Preparing
Before we get started, we'll install the [wetland-cli](https://github.com/SpoonX/wetland-cli).
The cli allows us to perform tasks such as migrations, snapshots and more, in projects that use wetland.

This step is really simple, run:

`npm i -g wetland-cli`.

Verify the installation by running wetland --version:

```bash
$ wetland --version
1.0.0
```

## Product entity
First off, we're going to create a product entity. We'll start of with the basics.

Create a file in `app/entity/Product.js`.

```js
class Product {
  static setMapping(mapping) {
    mapping.forProperty('id').primary().increments();

    mapping.field('name', {type: 'string'});
  }
}

module.exports = Product;
```

Let's break it down.

### The class
In the previous step, we created a `wetland.js` file, in which we configured the path to the entities.
Any exported class in this directory will be registered with Wetland's entity manager.

Entities are very simple classes. They can be named exports, as well as default exports. That means we could change the line:
`module.exports = Product;` to `module.exports.Product = Product;` and it would still work. This is useful if you use wetland with Typescript or Babel.

_**Note:** There's an `Entity` class you can optionally extend, which adds a `toObject` method to your entity as a regular object. This method allows you to get a copy of the entity, which is useful in combination with toJSON for instance, to manipulate responses._

### Static setMapping
An entity's mapping is responsible for explaining to wetland what your database model looks like, so that data can be mapped back and forth between your object model and your database schema. This also allows the [schema builder](../API/schema-builder.md) to automatically generate your schema, and wetland to generate your migrations.

When using Babel or Typescript, you can use decorators to describe the mapping of your entities. For the majority, simply using Node.js, we use the static `setMapping` method. The setMapping method receives the [Mapping instance](../API/mapping.md) for this instance. Using this instance, we define a primary key and a name field.

#### What's forProperty?
You might have noticed that the way we define the primary key is slightly different from the way we define the name field. It's a lot easier than it seems. The `.forProperty` method returns a scoped field mapper that's aware of the property (field) it's for, to make for less writing. As an example, the following two definitions are _identical_ in terms of mapping, but take a different approach:

```js
class Product {
  static setMapping(mapping) {
    // Using forProperty
    mapping.forProperty('id').primary().increments();

    // Using defined property names
    mapping.primary('id').increments('id');
  }
}
```

### Primary key
To map the primary key, we use two different methods: `.primary()` and `.increments()`. As you might have guessed, `.primary()` tells wetland that this field is the primary key for this entity. The `.increments()` is a convenience method that calls `.generatedValue('autoIncrement')` for you, and tells wetland that this field is an auto incrementing integer field.

### Fields
For the `name` field, we use the [`.field()`](../API/mapping.md#field) method. This call simply says: _this field is a string, and it's called `name`_. This method has [quite a lot of options](../API/mapping.md#field-options), but we're only using one: `type`!

Here's a more advanced example _(don't change your file, this is just an example)_:

```js
class Product {
  static setMapping(mapping) {
    mapping.forProperty('id').primary().increments();

    mapping.field('name', {
      type: 'enumeration',
      name: 'custom_name',
      size: 20,
      nullable: true,
      defaultTo: 'Generic',
      comment: 'I love you, DBA',
      enumeration: ['Generic', 'Enum', 'Makes no sense here']
    });
  }
}

module.exports = Product;
```

## Category entity
Now that the basic mapping for Product is clear, let's create one for Category.

In `app/entity/Category.js`:

```js
class Category {
  static setMapping(mapping) {
    mapping.forProperty('id').primary().increments();

    mapping.field('name', {type: 'string'});
  }
}

module.exports = Category;
```

No break down needed, it's the exact same definition we used for Product, except it's called category.

## Test the schema
Let's test our schema! If everything went according to plan, you can now head to your terminal and run:

`wetland migrator schema -d`

This tells wetland that we want it to dump _(-d)_ our schema. The result should look like this:

```sql
-- Queries for schema
create table "category" ("id" integer not null primary key autoincrement, "name" varchar(255) not null);
create table "product" ("id" integer not null primary key autoincrement, "name" varchar(255) not null)
```

Success! Now let's continue by creating our schema. Let's tell wetland to do so:

```
$ wetland migrator dev -r

  Success: Dev migrations applied!
```

### Dev migrations
**Q:** Wait, why did we just use `wetland migrator dev -r` instead of `wetland migrator schema -r`!?

**A:** Good question! Wetland uses something called [dev migrations](../snapshots.md#dev-migrations).

Simply put, dev migrations make use of the [snapshot system](../snapshots.md). This allows wetland to diff your schema using snapshots (which get created every time you run dev migrations), and automatically migrate your database for you as you write code.

You can read more about snapshots and dev migrations [in the docs for snapshots](../snapshots.md).

## Next step
Now that we've taken a quick look at entities, it's time to move on.

In the next step of this tutorial, we'll briefly look at snapshots, and what they are.
Then, we'll implement automated dev migrations into our application and it should start to make more sense.

[Go to the next part](snapshots.md).
