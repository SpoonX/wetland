# QueryBuilder

> To clone the finished code for this part of the tutorial, run the following command:
>
> `git clone git@github.com:SpoonX/wetland-tutorial.git -b 9-querybuilder --single-branch`
>
> To clone the base code for this part of the tutorial, run the following command:
>
> `git clone git@github.com:SpoonX/wetland-tutorial.git -b 8-repository --single-branch`
>
> Find the full repository on github [here](https://github.com/SpoonX/wetland-tutorial).

We've touched the subject of the QueryBuilder in the previous part, without explaining what it is or does.

In this part of the tutorial, we'll not only learn about the [QueryBuilder](../API/query-builder.md), but we'll use it!

## Theory time

A querybuilder is responsible for giving you a consistent, flexible and productive API to formulate your database queries for you.

A querybuilder is acquired through the EntityRepository:

```js
let queryBuilder = repository.getQueryBuilder('u');
```

It takes a single arguments, which is the alias to use for this entity in the query. Usually it's enough to use the first character of the entity (lower cased). The example above is `u` for `user`.

Let's take a look at the methods on a query builder. It's a lot of theory which serves as a reference. You can skip it all and move on to [Building time](#building-time), but make sure to reference it when you get stuck.

### Select
The `.select()` method allows you to specify which fields should be fetched.
You _should_ use the names of your properties, and not the columns. Even though it would work, it'll make your code less predictable.

```
queryBuilder.select('u.username');
```

#### Aliases
We're using the alias `u` to specify of which entity we want to fetch the specified field `username`.
For now, this isn't important. But seeing how we'll be using relations later on, it's important to already get used to it.

_**Note:** It's worth mentioning that the query would still work without any aliases at all for single-entity queries._

#### All fields
To fetch all fields for a specific entity, simply provide the alias.

```js
let queryBuilder = repository.getQueryBuilder('u');

queryBuilder.select('u'); // Will fetch all fields

// With a relation
queryBuilder.innerJoin('u.groups', 'g').select(['u', 'g']);
```

#### Functions
The querybuilder allows you to use select functions. The available functions are:

* sum
* count
* max
* min
* avg

Here's an example on how to use these:

```js
// The alias part is optional, but needed if referenced (for example in having).
queryBuilder.select({count: 'u.id', alias: 'number_of_users'});
```

How to fetch these values will be covered further on the tutorial.

### Where
The where method is what gets used to specify the, you guessed it, where clause of the query. 
As you also might have guessed, the where method is what the EntityRepository uses to set the criteria.
Let's take a look at some `.where()` calls to give you an idea of what it's capable of.

Let's start with a simple example.

```js
queryBuilder.where({name: 'foo'});
```

This simply says: give me all the records where the value of `name` equals value `foo`.

Here are a couple of other examples that shouldn't need an explanation, as they are very intuitive.

#### GreaterThan
```js
queryBuilder.where({age: {'>': 21}});

// Another way
queryBuilder.where({age: {'gt': 21}});

// Yet another way
queryBuilder.where({age: {'greaterThan': 21}});
```

#### In
Where one of the contributors (at the time of writing):

```js
queryBuilder.where({name: ['RWOverdijk', 'Rawphs', 'Scrunshes', 'ppvg']});

// Another way
queryBuilder.where({name: {in: ['RWOverdijk', 'Rawphs', 'Scrunshes', 'ppvg']}});
```

#### Not
`not` is special, in that it can take an operator, and make it a `not`.

```js
// Not in
queryBuilder.where({name: {not: ['RWOverdijk', 'Rawphs', 'Scrunshes', 'ppvg']}});

// Another example: not gt
queryBuilder.where({age: {not: {'gt': 21}}});
```

#### Between
Between accepts an array of two values: start, end.

```js
queryBuilder.where({age: {between: [21, 40]}});

// Not between
queryBuilder.where({age: {notBetween: [21, 40]}});

// Another way
queryBuilder.where({age: {not: {between: [21, 40]}}});
```

#### Like
There are acouple of ways to use `like`.

```js
queryBuilder.where({name: {like: '%foo%'}});

// Alias of like
queryBuilder.where({name: {contains: '%foo%'}});

// Another example, the%
queryBuilder.where({name: {startsWith: 'the'}});

// endsWith, %the
queryBuilder.where({name: {endsWith: 'the'}});
```

#### Operators
Here's a complete list of all operators:

* =
* <
* lt
* lessThan
* <=
* lte
* lessThanOrEqual
* >
* gt
* greaterThan
* >=
* greaterThanOrEqual
* gte
* !
* not
* between
* notBetween
* in
* notIn
* is
* isNot
* like
* notLike
* contains
* notContains
* startsWith
* notStartsWith
* endsWith
* notEndsWith

#### Conditions
There are two possible conditions:

* and
* or

They do exactly what you expect them to do. Here's an example:

```js
// age between 21 and 40, and (name startsWith 'the' or name endsWith 'the')
queryBuilder.where({
  age: {between: [21, 40]},
  or: [
    {name: {startsWith: 'the'}},
    {name: {endsWith: 'the'}}
  ]
});

// Another way, explicitely specifying `and`
queryBuilder.where({
  and: [
    {age: {between: [21, 40]}},
    {
      or: [
        {name: {startsWith: 'the'}},
        {name: {endsWith: 'the'}}
      ]
    }
  ]
});
```

_**Note:** Conditions can be nested._

### GroupBy
The `groupBy()` method allows you to group results based on given column(s).

```js
queryBuilder.select(['u.username', 'u.group']).groupBy('u.group');
```

### Having
Having works the same way `where` works and has the same operators. Here's an example:

```js
// Find groups containing more than 2 users
queryBuilder
  .select({count: 't.id', alias: 'users'})
  .groupBy('u.group')
  .having({'users': {gt: 2}});
```

### OrderBy
Order by a column, in direction.

```js
queryBuilder.orderBy('u.id', 'desc');

// Or..
queryBuilder.orderBy({'u.id': 'desc'});

// Let's get wild and combine
queryBuilder.orderBy([{'u.id': 'desc'}, 'u.role']);
```

### Limit
Set the maximum number of records you wish to get returned.

```js
queryBuilder.limit(30);
```

### Offset
Set the number of records you wish to skip (useful for pagination).

```js
queryBuilder.limit(30).offset(30); // page 2
```

### Join
There are a number of join methods available to simplify your life, and they all have the same signature.

```js
queryBuilder.innerJoin('u.groups', 'g');

// Nested, and mixed, joins. (there's no limit to the nesting)
queryBuilder
  .innerJoin('u.friends', 'f')
  .leftJoin('f.playlists', 'p')
  .leftOuterJoin('p.songs', 's');
```

Available join methods holding this signature are:

* leftJoin
* innerJoin
* leftOuterJoin
* rightJoin
* rightOuterJoin
* outerJoin
* fullOuterJoin
* crossJoin

### Populate
Populate is a different type of join method. It uses a separate query to perform the "join", to allow you to supply criteria, limit, sort etc for it. It returns a new QueryBuilder so everything in this document can be used on it. Even another `.populate()`.

```js
let queryBuilder = repository.getQueryBuilder('u');

let newQueryBuilder = queryBuilder.populate('u.groups', null, 'g');

// Using our own query builder
let myQueryBuilder = groupRepository.getQueryBuilder('g');

queryBuilder.populate('u.groups', myQueryBuilder, 'g');

// To illustrate how powerful this is
newQueryBuilder
  .limit(20)
  .offset(10)
  .where({foo: 'bar'})
  .innerJoin('users'); // No alias means use the host alias (group)
```

### QuickJoin
The `.quickJoin()` is useful when you want to just quickly fetch (all) associated data. What it does, is look at the type of relation you're requesting, and either perform a leftJoin or a populate(). Generally it's not a good idea to use this method as it introduces some magic into your domain.

```js
queryBuilder.quickJoin('u.groups', 'g');
```

### GetChild
When working with relations through populate (or in some cases quickJoin) you might want to get access to the child query builder. This method allows you to fetch it by alias.

```js
let queryBuilder = repository.getQueryBuilder('u');

queryBuilder.populate('u.groups', null, 'g');

let child = queryBuilder.getChild('g');
```

### Remove
Remove allows you to create a delete query. Generally this is discourages, as you should use the unit of work for this. However, in some cases it's an easier way to get things done (working in batches for instance).

```js
queryBuilder.remove().where({'active': false});
```

_**Note:** This method is very useful to delete multiple records based on criteria._

### Update
Update allows you to do exactly what it says, update. Specify the fields and their new values.

```js
// Set the deleted flag to true for all inactive accounts.
queryBuilder.update({deleted: true}).where({'active': false});
```

_**Note:** This method is very useful to update multiple records based on criteria._

### Insert
This method allows you to create a new record. Just supply the data (for instance an entity) and it'll format the insert query.

```js
queryBuilder.insert({username: 'Frank'});
```

_**Note:** This method shouldn't be used, unless needed. The best thing to do is use the unit of work._

### GetAlias
A simple method to get the alias of the querybuilder host. This is useful after using `.populate()` without having specified an alias.

```js
let queryBuilder    = repository.getQueryBuilder('u');
let newQueryBuilder = queryBuilder.populate('u.groups');
let alias           = newQueryBuilder.getAlias();
```

### GetQuery
With every query builder you use, you'll get into contact with this method. This method is responsible for finalizing and returning your query instance.

```js
// Hydrate results into entities
queryBuilder.select('u').getQuery().getResult().then(result => {
  // Got the hydrated result!
});

// Get the raw result
queryBuilder.select('u').getQuery().execute().then(rawResult => {
  // Got the raw result (array)!
});
```

**Note:** It's important that you use `.getQuery()` before executing the query.

### Prepare
In case you wish to work with the knex querybuilder being used under the hood by calling `.getStatement()`, but also wish to manipulate it using wetland, make sure to call `.prepare()`. In normal cases, `.getQuery()` would call `.prepare()` for you.

```js
queryBuilder.prepare().getStatement();
```

Prepare makes sure all your selects, order by, criteria and so on get applied to the query. This allows you more flexibility in the order of applying them. For instance, when you call `.select('g')` before 

### GetStatement
This method returns the [knexjs](http://knexjs.org/) instance being molded into the query you want.

## Building time
Now, let's use this information to use the query builder ourselves!

Remember how we implemented the `.findDepleted()` method in our repository? Let's add a method to find abundant products, having 4 or more stock.

### The findAbundant method
Open up `app/repository/ProductRepository.js` and change it to the following:

```js
const {EntityRepository} = require('wetland');

class ProductRepository extends EntityRepository {
  findDepleted() {
    return this.find({stock: 0});
  }

  findAbundant() {
    return this.getQueryBuilder('p')
      .select('p')
      .where({'p.stock': {'>': 4}})
      .getQuery()
      .getResult();
  }
}

module.exports = ProductRepository;
```

Here we build our own querybuilder, select all fields and tell it to only return results where the stock is greater than 4.

### Using findAbundant
Now to use this method, we'll add a new endpoint to our resource.

Open up `app/resource/product.js` and add the following endpoint **before** the `/:id` route:

```js
// Get abundant products
router.get('/abundant', (req, res) => {
  req.getRepository(Product)
    .findAbundant()
    .then(result => res.json(result || []))
    .catch(error => res.status(500).json({error}));
});
```

This code is very similar to that of [find depleted](./repository.md#using-our-new-repository), we simply call our new method on the repository.

### Testing our new method
Open up [http://127.0.0.1:3000/product/abundant](http://127.0.0.1:3000/product/abundant). You should now see something like this:

```json
[
  {
    "id": 1,
    "name": "Glasses",
    "created": "2017-03-05 09:05:55",
    "stock": 10,
    "categories": []
  }
]
```

## Next step
Alright, we can now build our own queries and set up joins. Let's start using joins.

[Go to the next part](joins.md).
