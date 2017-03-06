# Repository

> To clone the finished code for this part of the tutorial, run the following command:
>
> `git clone git@github.com:SpoonX/wetland-tutorial.git -b 8-repository --single-branch`
>
> To clone the base code for this part of the tutorial, run the following command:
>
> `git clone git@github.com:SpoonX/wetland-tutorial.git -b 7-entitymanager-scope-unitofwork --single-branch`
>
> **Github:** [Diff for this part of the tutorial](https://github.com/SpoonX/wetland-tutorial/compare/7-entitymanager-scope-unitofwork...8-repository?diff=split) - [Full repository on github](https://github.com/SpoonX/wetland-tutorial)

In this part of the tutorial we'll be exploring repositories.
The concept of repositories isn't that complex to grasp if you've worked with any other ORM-like system before; or even if you've written any objects before.

This part will be a bit longer than the previous ones.

## Theory time

When using an ORM, one of the thing you want is a simple way to get the data required for your domain.
Wetland comes with a QueryBuilder, which we'll get into later, but that wouldn't do the trick.
Building the queries in your domain would get messy quick: enter repositories.

So what's a repository?

> Mediates between the domain and data mapping layers using a collection-like interface for accessing domain objects.
>
> **Source: [P of EAA](https://martinfowler.com/eaaCatalog/repository.html)**

In less difficult terms, a repository allows you to fetch data using very little code, keeping your domain nice and simple.

## Use it
Let's use repositories, and also create a custom one just for fun! _(Also because it's secretly part of the next tutorial about query builders.)_

### Fetching categories
Earlier in the tutorial, we created some categories. If not, create some!

Now, let's make an endpoint where we can fetch our categories. Open up `app/resource/category.js` and add the following route:

```js
router.get('/', (req, res) => {
  let wetland  = req.wetland;
  let manager  = wetland.getManager();

  manager.getRepository('Category').find()
    .then(result => res.json(result || []))
    .catch(error => res.status(500).json({error}));
});
```

**Note:** From now on, we'll be "adding routes" as the files will become too big to put in the tutorial completely. As a final example of what that looks like, after adding above route, your file should look like this:

```js
const express  = require('express');
const router   = express.Router();
const Category = require('../entity/Category');

// List all categories
router.get('/', (req, res) => {
  let wetland  = req.wetland;
  let manager  = wetland.getManager();

  manager.getRepository('Category').find()
    .then(result => res.json(result || []))
    .catch(error => res.status(500).json({error}));
});

// Create a new category
router.post('/', (req, res) => {
  let wetland  = req.wetland;
  let manager  = wetland.getManager();
  let category = new Category;

  category.name = req.body.name;

  manager.persist(category).flush()
    .then(() => res.json(category))
    .catch(error => res.status(500).json({error}));
});

// Delete a category
router.delete('/:id', (req, res) => {
  let manager = req.getManager();

  manager.getRepository('Category')
    .findOne(req.params.id)
    .then(result => {
      if (!result) {
        return res.status(404).json(null)
      }

      return manager.remove(result).flush()
        .then(() => res.json(result));
    })
    .catch(error => res.status(500).json({error}));
});

// Update a category
router.patch('/:id', (req, res) => {
  let manager = req.getManager();

  manager.getRepository('Category')
    .findOne(req.params.id)
    .then(result => {
      if (!result) {
        return res.status(404).json(null)
      }

      result.name = req.body.name;

      return manager.flush().then(() => res.json(result));
    })
    .catch(error => res.status(500).json({error}));
});

router.get('/', (req, res) => res.json({hello: 'from category.js'}));

module.exports = router;
```

#### Breaking it down
The code isn't that challenging at this point.

First, just like with the `create` endpoint, we get an Entity Manager Scope:

```js
let wetland  = req.wetland;
let manager  = wetland.getManager();
```

And then we proceed to ask for the repository that handles access to data for the `Category` entity:

```js
manager.getRepository('Category')
```

Which is where it gets interesting, and we see our first `Repository` method being used: `.find([criteria][, options])`.

```js
manager.getRepository('Category').find()
```

We're not passing in any arguments to `.find()` at this time, but we'll get to that later.

The rest of the code is simply handling the request. If there's no data, we return an empty array. Any errors will be returned using the 500 status code:

```js
manager.getRepository('Category').find()
  .then(result => res.json(result || []))
  .catch(error => res.status(500).json({error}));
```

_**Note:** A whole bunch of stuff is happening under the hood. Don't worry if it doesn't make sense yet, we'll explain this procedure more in depth later on._

#### testing it
To allow ourselves some breathing room, let's first test this feature before we head on to the next.

Start your server (or restart it, if it's still running): `node app.js`.

Open up the following url: [http://127.0.0.1:3000/category](http://127.0.0.1:3000/category) and you should see something like this:

```json
[
  {
    id: 1,
    name: "generic",
    created: 1488358591896,
    products: [ ]
  }
]
```

Success! We can now fetch our categories and have ultimate bragging rights.

### Fetching a category
Okay so we're able to fetch all categories now. But what about accessing a single category?

Add the following route to your `app/resource/category.js` file:

```js
// Get a specific category
router.get('/:id', (req, res) => {
  req.getRepository(Category)
    .findOne(req.params.id)
    .then(result => {
      if (!result) {
        return res.status(404).json(null)
      }

      return res.json(result);
    })
    .catch(error => res.status(500).json({error}));
});
```

#### Breaking it down again
Here we registere a route with a parameter `id`. This will be the primary key value (id) of the category record we wish to fetch.

Then, I've subtly added a call to a new feature, being `req.getRepository(Category)`. This is one of the methods we get by using [express-wetland](https://github.com/SpoonX/express-wetland#methods). All it does, is replace the `getManager` call.

```js
let wetland    = req.wetland;
let manager    = wetland.getManager();
let repository = manager.getRepository(Category);
```

Equals:

```js
let repository = req.getRepository(Category);
```

This only works for express _(and sails.js with the [sails-hook-wetland](https://github.com/SpoonX/sails-hook-wetland))_, but will be used for the rest of this tutorial to make our code snippets more compact.

Next up, is a call to the second method of a repository, `.findOne()`. We give it the id (primary key value) and ask it to `.findOne()` record for us.

And finally, we check if there's a result. If not, we return a 404 (not found) response; otherwise we return the record. And the obvious `.catch()` again to handle errors.

```js
.catch(error => res.status(500).json({error}));
```

#### Testing the new route
Start your server (or restart it, if it's still running): `node app.js`.

Open up the following url: [http://127.0.0.1:3000/category/1](http://127.0.0.1:3000/category/1) and you should see something like this:

```json
{
  id: 1,
  name: "generic",
  created: 1488358591896,
  products: [ ]
}
```

Success! We can now fetch a single category and have even ultimaterer bragging rights.

To test the 404, just for fun, send in an `id` that doesn't exist yet: [http://127.0.0.1:3000/category/9001](http://127.0.0.1:3000/category/9001).

This returns `null`, and a 404 response code.

### Speed round for Product
**Important:** don't skip this part. Actually, don't skip anything, but especially this part.

Let's now open up `app/resource/product.js` and add the same things we have added for category so far.
Try doing it yourself, without copying the code as an exercise. Otherwise go through the previous steps of this tutorial to refresh your memory.

Your file should look like this _(with the express-wetland methods used, and the test routes removed)_:

```js
const express = require('express');
const router  = express.Router();
const Product = require('../entity/Product');

// Get a specific product
router.get('/:id', (req, res) => {
  req.getRepository(Product)
    .findOne(req.params.id)
    .then(result => {
      if (!result) {
        return res.status(404).json(null)
      }

      return res.json(result);
    })
    .catch(error => res.status(500).json({error}));
});

// List all products
router.get('/', (req, res) => {
  req.getRepository('Product').find()
    .then(result => res.json(result || []))
    .catch(error => res.status(500).json({error}));
});

// Create a new product
router.post('/', (req, res) => {
  let manager = req.getManager();
  let product = new Product;

  product.name  = req.body.name;
  product.stock = parseInt(req.body.stock);

  manager.persist(product).flush()
    .then(() => res.json(product))
    .catch(error => res.status(500).json({error}));
});

module.exports = router;
```

## Custom repository
Every Entity has a repository attached to it. By default, that's the aptly named [`EntityRepository`](https://wetland.spoonx.org/API/entity-repository.html) which gives you most methods you need for regular operations.

But what if you want to tuck in some logic? Or create more descriptively named methods? Enter, custom repositories.

### Creating a custom repository
We'll be looking at a couple of things that are new to us here. Let's go through them one by one, starting with the Repository file.

#### Repository file
Create a new file: `app/repository/ProductRepository.js` with the following contents:

```js
const {EntityRepository} = require('wetland');

class ProductRepository extends EntityRepository {
  findDepleted() {
    return this.find({stock: 0});
  }
}

module.exports = ProductRepository;
```

All this custom repository does so far, is extending the default EntityRepository and adding a single method.

So to clarify, our custom repository still has the `.find()` and `.findOne()` methods. But it _also_ has the `. findDepleted()` method now.

Let's say we want to be able to get all products that are out of stock in a pretty, descriptive way. We identify those products by fetching them where `stock: 0`. This is our first introduction to `criteria`, the first argument to .find(), which are instructions that tell the database what criteria records should satisfy to be part of the result.

The query for our implementation, would be something like: 

```sql
select * from `product` where `stock` = 0;
```

But we'll get into criteria a bit more later on.

_**Note:** Notice how the repository simply uses the .find() method, too._

#### Repository mapping
Now it's time to tell our `Product` mapping that there's a different repository we'd like to use.
Open up `app/entity/Product.js` and add the `entity` mapping:

```js
const ProductRepository = require('../repository/ProductRepository');

class Product {
  static setMapping(mapping) {
    mapping.entity({repository: ProductRepository});

    // The other mappings go here...
  }
  // Hooks...
}

module.exports = Product;
```

Make sure not to remove the other mappings, or the lifecycle callback. Your entity should now look like this:

```js
const ProductRepository = require('../repository/ProductRepository');

class Product {
  static setMapping(mapping) {
    mapping.entity({repository: ProductRepository});

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

The `.entity()` mapping is now telling Wetland to use a different (custom) repository.

### Using our new repository
Head back to `app/resource/product.js` and add the following route **before** the `/:id` route:

```js
// Get depleted products
router.get('/depleted', (req, res) => {
  req.getRepository(Product)
    .findDepleted()
    .then(result => res.json(result || []))
    .catch(error => res.status(500).json({error}));
});
```

Here we're simply calling the `.findDepleted()` method on our new repository, instead of using `.find()`.

_**Note:** the reason we have to define this route before the `/:id` route is because that would otherwise match first._

### Testing the custom repository
Start your server (or restart it, if it's still running): `node app.js`.

To test the custom repository, let's add a couple of products. Here are some curl commands to help:

```bash
curl -XPOST -H 'Content-Type: application/json' -d '{
 "name":"glasses",
 "stock": 10
}' http://127.0.0.1:3000/product

curl -XPOST -H 'Content-Type: application/json' -d '{
 "name":"umbrella",
 "stock": 0
}' http://127.0.0.1:3000/product

curl -XPOST -H 'Content-Type: application/json' -d '{
 "name":"lighter",
 "stock": 2
}' http://127.0.0.1:3000/product

curl -XPOST -H 'Content-Type: application/json' -d '{
 "name":"jeans",
 "stock": 0
}' http://127.0.0.1:3000/product
```

Now navigate to [http://127.0.0.1:3000/product/depleted](http://127.0.0.1:3000/product/depleted), and if you used the curl commands you should now see something like this:

```json
[
  {
    "id": 2,
    "name": "Umbrella",
    "created": "2017-03-05 09:29:21",
    "stock": 0,
    "categories": []
  },
  {
    "id": 4,
    "name": "Jeans",
    "created": "2017-03-05 09:29:21",
    "stock": 0,
    "categories": []
  }
]
```

Okay, we're done. It's time to breathe and head to the part of this tutorial.

## Next step
Wooo! We can now start making beautiful repositories that make it easier (and more fun) to work with our database.

[Go to the next part](querybuilder.md).
