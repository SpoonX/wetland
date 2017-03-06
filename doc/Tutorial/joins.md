# Joins
> To clone the finished code for this part of the tutorial, run the following command:
>
> `git clone git@github.com:SpoonX/wetland-tutorial.git -b 11-joins --single-branch`
> 
> To clone the base code for this part of the tutorial, run the following command:
>
> `git clone git@github.com:SpoonX/wetland-tutorial.git -b 10-query --single-branch`
>
> **Github:** [Diff for this part of the tutorial](https://github.com/SpoonX/wetland-tutorial/compare/10-query...11-joins?diff=split) - [Full repository on github](https://github.com/SpoonX/wetland-tutorial)

In earlier parts of this tutorial, we've learned how to define relations, use the repository and use the querybuilder. We haven't used relations yet, though. In this part we'll start using joins.

So I'd say, join us on an adventure...!

![](./media/joins.gif)

_**Note:** no, I'm not apologizing for the pun._

## Theory time
No, no theory time is getting old. Besides, all the theory required to implement this has already been written in previous parts of the tutorial. So let's just dive into..

## Coding time
Yeah! Alright, what we'll do first is make our current code compatible with the relations we have defined.

### Create
Currently, when creating a product or a category we just set the fields. Let's change that to also include the relation provided!

For the sake of this part of the tutorial, we'll allow a single relation to be passed along. Also we'll only implement the product side of things, because we'll be changing it again in the next step of the tutorial.

Open up `app/resource/product.js`

First off, let's import another class offered by wetland: `ArrayCollection`. At the top of the file, with the rest of the imports, add:

```js
const {ArrayCollection} = require('wetland');
```

Next up, let's change the `POST /` route:

```js
// Create a new product
router.post('/', (req, res) => {
  let manager = req.getManager();
  let product = new Product;

  product.name       = req.body.name;
  product.stock      = parseInt(req.body.stock);
  product.categories = new ArrayCollection;

  let category = manager.getReference('Category', req.body.category);

  product.categories.add(category);

  manager.persist(product).flush()
    .then(() => res.json(product))
    .catch(error => res.status(500).json({error}));
});
```

Woa, a couple new things appeared. Let's break that down.

#### ArrayCollection
ArrayCollection is a class that behaves identical to an array, but adds some functionality. It makes for optimized proxying, prevents duplicates and adds easy methods to add or remove entities from the collection.

```js
const {ArrayCollection} = require('wetland');

let collection = new ArrayCollection;
let entity     = new Product;

// Add entity
collection.add(entity);

// Add again, but it'll get skipped because it's already in there
collection.add(entity);

// Remove it again
collection.remove(entity);
```

#### Get reference
The [.getReference()](https://wetland.spoonx.org/API/scope.html#getreference) method allows you to, as quoted from the API documentation page:

> Gets a reference to a persisted row without actually loading it from the database, or returns a row found in the IdentityMap (if fetched earlier in the scope).

We don't want to first fetch the record from the database for this example, so we ask Wetland to pretend it did. We're asking it to fetch row `req.body.category`, so whatever we sent to the server, for entity `Category`.

_**Note:** besides a string, this method, just like any other method in wetland, also accepts a reference to the actual entity._

### Find
Now that our product gets associated with a category, let's make sure it also gets returned when we make a request to the server.

Head back to your editor, and in the `app/resource/product.js` file look up the `GET /` route. Now change it to this:

```js
// List all products
router.get('/', (req, res) => {
  req.getRepository('Product').find(null, {populate: 'categories'})
    .then(result => res.json(result || []))
    .catch(error => res.status(500).json({error}));
});
```

Ha, we're finally using that second argument of find! We tell it to populate the categories for us with our request. **It's important** to note that the value of populate is the name of the property that holds the join; not the name of the entity. That's why we used `'categories'` and **not** `'Category'`.

Now, I know you're dying to give this a spin, but let's first patch our other endpoints to do the same.

_**Note:** populate also accepts an array for multiple populates, an object including aliases, or a combination of those._

#### Find one
Look up the `GET /:id` route, and change it to this:

```js
// Get a specific product
router.get('/:id', (req, res) => {
  req.getRepository(Product)
    .findOne(req.params.id, {populate: 'categories'})
    .then(result => {
      if (!result) {
        return res.status(404).json(null)
      }

      return res.json(result);
    })
    .catch(error => res.status(500).json({error}));
});
```

#### Category resource
Now open up `app/resource/category.js` and do the same:

```js
const express  = require('express');
const router   = express.Router();
const Category = require('../entity/Category');

// Get a specific category
router.get('/:id', (req, res) => {
  req.getRepository(Category)
    .findOne(req.params.id, {populate: 'products'})
    .then(result => {
      if (!result) {
        return res.status(404).json(null)
      }

      return res.json(result);
    })
    .catch(error => res.status(500).json({error}));
});

// List all categories
router.get('/', (req, res) => {
  req.getRepository('Category').find(null, {populate: 'products'})
    .then(result => res.json(result || []))
    .catch(error => res.status(500).json({error}));
});

// Create a new category
router.post('/', (req, res) => {
  let manager  = req.getManager();
  let category = new Category;

  category.name = req.body.name;

  manager.persist(category).flush()
    .then(() => res.json(category))
    .catch(error => res.status(500).json({error}));
});

module.exports = router;
```

#### Product repository
Finally, open up `app/repository/ProductRepository.js` and change it to:

```js
const {EntityRepository} = require('wetland');

class ProductRepository extends EntityRepository {
  findDepleted() {
    return this.find({stock: 0}, {populate: 'categories'});
  }

  findAbundant() {
    return this.getQueryBuilder('p')
      .select('p', 'c')
      .where({'p.stock': {'>': 4}})
      .leftJoin('p.categories', 'c')
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

Nothing surprising, but our first actual implementation of a join method on the query builder! As you can see, we also simply add both aliases to the `.select()` call to make sure all fields are returned.

### Testing it
Start your server (or restart it, if it's still running): `node app`.

Next up, proceed by creating some new products that are linked to a category.

```bash
curl -XPOST -H 'Content-Type: application/json' -d '{
 "name":"generic product 1",
 "stock": 21,
 "category": 1
}' http://127.0.0.1:3000/product
 
curl -XPOST -H 'Content-Type: application/json' -d '{
 "name":"generic product 2",
 "stock": 0,
 "category": 1
}' http://127.0.0.1:3000/product
```

Which should result in a result similar to this:

```json
{
  "name": "Generic product 1",
  "stock": 21,
  "categories": [
    {
      "id": 1,
      "products": []
    }
  ],
  "id": 5,
  "created": "2017-03-05 16:45:38"
}
```

Sweet! Now the other endpoints should all return relations. Here's a list of links to see for yourself:

* [http://127.0.0.1:3000/category](http://127.0.0.1:3000/category)
* [http://127.0.0.1:3000/product](http://127.0.0.1:3000/product)
* [http://127.0.0.1:3000/product/abundant](http://127.0.0.1:3000/product/abundant)
* [http://127.0.0.1:3000/product/depleted](http://127.0.0.1:3000/product/depleted)

## Next step
We've juggled with joins, and made quite the application. Now it's time to take a look at another cool tool wetland offers: the Populator.

[Go to the next part](populator.md).
