# Lifecycle callbacks
> To clone the finished code for this part of the tutorial, run the following command:
>
> `git clone git@github.com:SpoonX/wetland-tutorial.git -b 6-lifecycle-callbacks --single-branch`
> 
> To clone the base code for this part of the tutorial, run the following command:
>
> `git clone git@github.com:SpoonX/wetland-tutorial.git -b 5-relations --single-branch`
> 
> **Github:** [Diff for this part of the tutorial](https://github.com/SpoonX/wetland-tutorial/compare/5-relations...6-lifecycle-callbacks?diff=split) - [Full repository on github](https://github.com/SpoonX/wetland-tutorial)

In this part of the tutorial we'll take a look at lifecycle callbacks on entities.

## Theory
Before we get started, some theory!

### Example
Here's an example of all the available lifecycle callbacks.

```js
class MyEntity {

  beforeCreate(entityManager) {
    // Will be executed before creation of the entity in the database.
  }

  afterCreate (entityManager) {
    // Will be executed after creation of the entity in the database.
  }

  beforeUpdate (newValues, entityManager) {
    // Will be executed before update of the entity.
  }

  afterUpdate(entityManager) {
    // Will be executed after update of the entity
  }

  beforeRemove (entityManager) {
    // Will be executed before removal of the entity
  }

  afterRemove (entityManager) {
    // Will be executed after removal of the entity
  }
}
```

### What?
All write queries (update, delete and create) in wetland are performed within [transactions](https://en.wikipedia.org/wiki/Database_transaction). In wetland, these operations are calculated in the unit of work, but we'll get to that in a later part of the tutorial.

This cycle allows you to hook in using lifecycle callbacks, and perform actions on entity instance level. For instance, if you wish to encrypt a user's password before create and update, your entity might look something like this:

```js
const bcrypt   = require('bcrypt');
const {Entity} = require('wetland');

class User {
  static setMapping(mapping) {
    // Primary key
    mapping.forProperty('id').increments().primary();

    // Fields
    mapping.field('username', {type: 'string'});
    mapping.field('password', {type: 'string', nullable: false});
  }

  /**
   * Before creating the user, make sure the password gets hashed.
   *
   * @returns {Promise}
   */
  beforeCreate() {
    if (!this.password) {
      return;
    }

    return bcrypt.hash(this.password, 10).then(hash => {
      this.password = hash;
    });
  }

  /**
   * Before updating the user, make sure the password is hashed (unless provided as hash).
   *
   * @returns {Promise}
   */
  beforeUpdate(values) {
    if (!values.password) {
      return;
    }

    try {
      // check if the password is already hashed
      bcrypt.getRounds(values.password);
    } catch(e) {
      return bcrypt.hash(values.password, 10).then(hash => {
        values.password = hash;
      });
    }
  }
};

module.exports = User;
```

If you want a more complete example, take a look at the entity in [sails-hook-authorization](https://github.com/SpoonX/sails-hook-authorization) by [clicking here](https://github.com/SpoonX/sails-hook-authorization/blob/master/api/entity/User.js).

## Apply this new knowledge
Let's do some coding again. Using our new found knowledge of lifecycle callbacks, we'll now make sure that our product names are always uppercase-first, and our categories get a `created` column holding the time they were created.

### Formalized name
Let's start by opening `app/entity/Product.js` and update it to look like this:

```js
class Product {
  static setMapping(mapping) {
    mapping.forProperty('id').primary().increments();

    mapping.field('name', {type: 'string'});

    mapping.field('stock', {type: 'integer', defaultTo: 0});

    mapping.manyToMany('categories', {targetEntity: 'Category', mappedBy: 'products'});
  }

  beforeCreate() {
    // Make sure the first character is upper case.
    this.name = this.name[0].toUpperCase() + this.name.substr(1);
  }
}

module.exports = Product;
```

Now, every time we create a new product, the first character will always be upper-case.

### Creation time
To add the creation time to categories, open up `app/entity/Category.js` and change it to look like this:

```js
class Category {
  static setMapping(mapping) {
    mapping.forProperty('id').primary().increments();

    mapping.field('name', {type: 'string'});

    mapping.field('created', {type: 'datetime', nullable: true});

    mapping.manyToMany('products', {targetEntity: 'Product', inversedBy: 'categories'});
  }

  beforeCreate() {
    this.created = new Date();
  }
}

module.exports = Category;
```

We've added a `created` field of type `datetime` and a lifecycle callback that will set a new `Date` instance every time we create a new `Category`.

_**Note:** We've added a `{nullable: true}`, because sqlite will otherwise throw an error. It doesn't like nullable without defaults._

### Creation time, again!
To illustrate another way to set the default creation time, we'll update `app/entity/Product.js` to look like this:

```js
class Product {
  static setMapping(mapping) {
    mapping.forProperty('id').primary().increments();

    mapping.field('name', {type: 'string'});

    mapping.field('created', {type: 'timestamp', defaultTo: mapping.now()});

    mapping.field('stock', {type: 'integer', defaultTo: 0});

    mapping.manyToMany('categories', {targetEntity: 'Category', mappedBy: 'products'});
  }

  beforeCreate() {
    // Make sure the first character is upper case.
    this.name = this.name[0].toUpperCase() + this.name.substr(1);
  }
}

module.exports = Product;
```

Here we've added the following:

```js
mapping.field('created', {type: 'timestamp', defaultTo: mapping.now()});
```

This simply tells wetland we want a timestamp colomn that defaults to the insertion time (`mapping.now()`).

## Testing
We'll get to use this code soon enough, but for now you can verify all went well by dumping the dev migrations again.

`$ wetland migrator dev -d`

```sql
-- Queries for dev migrations:
alter table "category" add column "created" datetime not null;
alter table "product" add column "created" datetime not null default CURRENT_TIMESTAMP;
create table "category_product" ("id" integer not null primary key autoincrement, "category_id" integer null, "product_id" integer null);
create index "idx_category_product_category_id" on "category_product" ("category_id");
create index "idx_category_product_product_id" on "category_product" ("product_id")
```

_**Note:** You might have noticed that the datetime also gets created as a timestamp. This is due to us using sqlite._

## Next step
Lifecycle callbacks are cool and useful. And now we know how to wield them!

[Go to the next part](entitymanager-scope-unitofwork.md).
