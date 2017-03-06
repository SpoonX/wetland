# Query
> To clone the finished code for this part of the tutorial, run the following command:
>
> `git clone git@github.com:SpoonX/wetland-tutorial.git -b 10-query --single-branch`
>
> To clone the base code for this part of the tutorial, run the following command:
>
> `git clone git@github.com:SpoonX/wetland-tutorial.git -b 9-querybuilder --single-branch`
>
> **Github:** [Diff for this part of the tutorial](https://github.com/SpoonX/wetland-tutorial/compare/9-querybuilder...10-query?diff=split) - [Full repository on github](https://github.com/SpoonX/wetland-tutorial)

In this part of the tutorial, we'll take a look at the Query object we get from the QueryBuilder.

## Some theory
The query object is the final layer that stands between you and knex. It's what makes populate work, and allows wetland to hydrate your results. It's also really convenient when you want to do slightly more customzied things, like fetching raw results or scalar values.

### Execute
Execute simply runs the query. If a parent was registered, it will make sure it only returns records associated with the parent. This method simply executes the knex instance query builder, and resolves to the raw result.

```js
query.execute().then(result => {
  // Got the raw results!
});
```

### Get result
The execute method is where the most powerful features of wetland get used when it comes to fetching results.
It allows you to fetch data in Entity form, giving you access to all the features that come with it.

The steps executed by getResult are, in order:

1. Executes the query using `.execute()`
2. Hydrates the result into entities using wetland's optimized hydrator for awesome performance
3. Wraps the entities in proxies to track changes.. for awesome performance
4. Registers the entities with the identityMap, and marks them as clean in the UnitOfWork
5. Performs child queries _([QueryBuilder.populate()](./querybuilder.md#populate))_
6. Attaches the results to each other using an indexed map..... for awesome performance!

```js
query.getResult().then(result => {
  // Got the results!
});
```

### Scalar values
When producing a count, a sum, or any aggregated value for that matter, there's a high chance you just want just that value.

```js
queryBuilder
  .select({count: 'u.id'})
  .getQuery()
  .getSingleScalarResult()
  .then(numberOfUsers => {
    // We have our number!
  });
```

## Using it
In fact, we want to use the `.getSingleScalarResult()` method to get the number of abundant and depleted products.

Open up `app/repository/ProductRepository.js` and add the following count methods:

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

  findDepletedCount() {
    return this.getQueryBuilder('p')
      .select({count: 'p.id'})
      .where({stock: 0})
      .getQuery()
      .getSingleScalarResult();
  }

  findAbundantCount() {
    return this.getQueryBuilder('p')
      .select({count: 'p.id'})
      .where({'p.stock': {'>': 4}})
      .getQuery()
      .getSingleScalarResult();
  }
}

module.exports = ProductRepository;
```

At this point, none of this should look new to you. We get a query builder, tell it we want a count, specify the criteria and proceed to ask the query for a single scalar result.

### Making it testable
In order to test these new methods, we have to create two new endpoints.

Open up `app/resource/product.js` and add the following routes:

```js
// Get abundant products count
router.get('/abundant/count', (req, res) => {
  req.getRepository(Product)
    .findAbundantCount()
    .then(result => res.json({count: result}))
    .catch(error => res.status(500).json({error}));
});

// Get depleted products count
router.get('/depleted/count', (req, res) => {
  req.getRepository(Product)
    .findDepletedCount()
    .then(result => res.json({count: result}))
    .catch(error => res.status(500).json({error}));
});
```

Again, nothing new except the `{count: result}` format, which is just because a Number is not a valud JSON value.

Now start your server (or restart it, if it's still running): `node app`.

And click these links to test the results:

**[http://127.0.0.1:3000/product/depleted/count](http://127.0.0.1:3000/product/depleted/count)**

```json
{
  "count": 2
}
```

**[http://127.0.0.1:3000/product/abundant/count](http://127.0.0.1:3000/product/abundant/count)**

```json
{
  "count": 1
}
```

## Next step
Well, we know how the Query instance behaves. Also, we can count now!

![](./media/count.gif)

Excuse the pun. Let's move on to joins!

[Go to the next part](joins.md).



