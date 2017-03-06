# Relations
> To clone the finished code for this part of the tutorial, run the following command:
>
> `git clone git@github.com:SpoonX/wetland-tutorial.git -b 5-relations --single-branch`
> 
> To clone the base code for this part of the tutorial, run the following command:
>
> `git clone git@github.com:SpoonX/wetland-tutorial.git -b 4-migrations --single-branch`
> 
> **Github:** [Diff for this part of the tutorial](https://github.com/SpoonX/wetland-tutorial/compare/4-migrations...5-relations?diff=split) - [Full repository on github](https://github.com/SpoonX/wetland-tutorial)

In this part of the tutorial we'll take a look at relations as we move towards running queries.

## Preparing
As we approach the last changes we'll make to our schema, let's create a snapshot to track our changes.

```
$ wetland snapshot create relations

  Success: Snapshot 'relations' created successfully!
```

## Relations
Before we get started with writing the code for our relation, first some theory.

Relations are an important part of databases. They allow you to link data from different tables (or entities, in wetland terms) together in a logical manner.

### Example
A small example showing how to create a relationship.

#### `Student.js`

```js
const Year = require('./Year');

class Student {
  static setMapping(mapping) {
    // Primary key.
    mapping.forProperty('id').primary().increments();

    // Owner
    mapping.manyToOne('years', {targetEntity: Year, inversedBy: 'students'});
  }
}
```

#### `Year.js`

```js
const Student = require('./Student');

class Year {
  static setMapping(mapping) {
    // Primary key.
    mapping.forProperty('id').primary().increments();

    // Inversed side
    mapping.oneToMany('students', {targetEntity: Student, mappedBy: 'years'});
  }
}
```

### Foreign keys
Wetland, by default, uses foreign keys. These foreign keys are useful to enforce relations, rules and export a diagram of your schema that makes sense. It's possible to [disable foreign keys](../configuration.md#use-foreign-keys).

_**Note:** Foreign keys are disabled by default for sqlite._

### Ownership
Ownership in a relation is usually a bad thing in real life. With databases, however, it's required.

#### ORM
Ownership on the ORM side of things is important as it tells wetland which entity holds the mapping information for that relationship. It needs to know for state checking as well as query generating.

Ownership is indicated using the `inversedBy` property in a relation mapping method call. This tells the ORM that this property on this entity is the owner, and that the inversed side is property `inversedBy` on the other entity.

On the inversed side, you'll use the `mappedBy` property. This basically tells wetland: _use this property on the other side of the relationship to map this relationship_.

#### Database
On the database side of things, ownership is important as the owner holds the primary key value of the other table.

### Types
There are four types of relations. We'll take a quick look at all of them.

#### One to one
A one to one relationship means that two records exclusively belong to each other. In a one to one relationship, the owning side is whichever side you decide will hold the primary key to the other record by using the `inversedBy` property. A good example of a one-to-one relation, is a profile. A user has one profile, and a profile belongs to one user.

#### Many to one
In a many to one relationship, the many side is the owning side. This means that the many side gets a column that holds the primary key value of the one side.

This is useful for example when you have a student to year mapping. A student can only be in one year at a time, but a year can have many students.

#### One to many
A one-to-many relation, is the inversed side of a many-to-one relation. This means we'll use the `mappedBy` property in our relation method, because we're the inversed side. A good example is the previous one, except we'll be a year with a relationship to many students.

#### Many to many
In a many to many relation, both sides can have many of each other. The owning side is whichever side you decide will hold the primary key to the other record by using the `inversedBy` property.

Another important thing to note, is that in a many-to-many relationship, wetland will create a join table. This is needed because each side of the relation can only hold one primary key value referencing a row in the other table. This would mean we can't have many to many relations.

A join table simply holds the primary key value of both tables, being (by default) nothing more than a linking table. A good example is a webshop, where you have categories and products. Products can belong to multiple categories, and categories can have multiple products.

A join table for such a setup might look like this:

```
mysql> select * from category_product;
+----+-------------+------------+
| id | category_id | product_id |
+----+-------------+------------+
|  1 |           1 |          5 |
+----+-------------+------------+
1 rows in set (0.00 sec)
```

### Join columns
[Join columns](../API/mapping.md#joincolumn) are the columns that hold the join mapping. These are always defined (mapped) on the owning side of the relation. Defining a join column is optional, as wetland is clever enough to fill in the blanks with convention based defaults.

```js
const Year = require('./Year');

class Student {
  static setMapping(mapping) {
    mapping.forProperty('years')
      .oneToMany({targetEntity: Year, inversedBy: 'students'})
      .joinColumn({name: 'custom_column_name'});
  }
}
```

You can read more about [join column options in the documentation](../API/mapping.md#join-column-options).

### Join tables
[Join tables](../API/mapping.md#jointable) are only used for many-to-many relations. Just as with join columns, defining a join tables is optional, as wetland is clever enough to fill in the blanks with convention based defaults.

```js
const Product = require('./Product');

class Category {
  static setMapping(mapping) {
    mapping.forProperty('products')
      .manyToMany({targetEntity: Product, inversedBy: 'categories'})
      .joinTable({name: 'custom_table_name'});
  }
}
```

You can read more about [join column options in the documentation](../API/mapping.md#join-table-options).

## Getting our hands dirty
It's time to finally start adding code to our application. In this specific case, it doesn't matter who the owning side is, so we'll make `Category` the owner.

### Owning side
Let's start by defining the owning side of the relation. Open up `app/entity/Category.js` and add the relation mapping:

```js
class Category {
  static setMapping(mapping) {
    mapping.forProperty('id').primary().increments();

    mapping.field('name', {type: 'string'});

    // This is new
    mapping.manyToMany('products', {targetEntity: 'Product', inversedBy: 'categories'});
  }
}

module.exports = Category;
```

### Inversed side
Now let's open up `app/entity/Product.js` and add the inversed side:

```js
class Product {
  static setMapping(mapping) {
    mapping.forProperty('id').primary().increments();

    mapping.field('name', {type: 'string'});

    mapping.field('stock', {type: 'integer', defaultTo: 0});

    // This is new
    mapping.manyToMany('categories', {targetEntity: 'Category', mappedBy: 'products'});
  }
}

module.exports = Product;
```

### Testing
To verify this worked, let's run the dev command to see what will happen the next time dev migrations run.

Run the following command: `wetland migrator dev -d`

And you should get:

```sql
-- Queries for dev migrations:
create table "category_product" ("id" integer not null primary key autoincrement, "category_id" integer null, "product_id" integer null);
create index "idx_category_product_category_id" on "category_product" ("category_id");
create index "idx_category_product_product_id" on "category_product" ("product_id")
```

## Next step
Awesome, we've set up our relation, and have a better understanding of relations and their roles.

[Go to the next part](lifecycle-callbacks.md).
