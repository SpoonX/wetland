# Populator

> To clone the finished code for this part of the tutorial, run the following command:
>
> `git clone git@github.com:SpoonX/wetland-tutorial.git -b 12-populator --single-branch`
>
> To clone the base code for this part of the tutorial, run the following command:
>
> `git clone git@github.com:SpoonX/wetland-tutorial.git -b 11-joins --single-branch`
>
> **Github:** [Diff for this part of the tutorial](https://github.com/SpoonX/wetland-tutorial/compare/11-joins...12-populator?diff=split) - [Full repository on github](https://github.com/SpoonX/wetland-tutorial)

In this final step of the tutorial we'll be looking at a tool provided by Wetland: The Populator

## Theory time
The populator is a tool that allows you to convert (nested) object literals into entity instances, or "patch" an existing set of entities. This is useful when building APIs, where you'll want to create entities from the data posted to your server, or update existing entity instances.

The Populator requires a Scope, so it can use the available IdentityMap for performance optimizations and proper linking based on provided identifiers.

### Assign
Assign simply assigns the data to whatever base was provided. If no base was provided, a new entity, or array will be created.

#### Create
Using assign without a base will return a new entity (or array) with provided data assigned.

##### Simple
Assigns one single layer, and single relations.

```js
const User = require('./entity/User');

let scope     = wetland.getManager();
let data      = {username: 'Frank', email: 'frank@provider.tld'};
let populator = wetland.getPopulator(scope);
let populated = populator.assign(User, data);  // Assign data
```

##### Nested n levels
Will nest n levels, and ignore the remaining depth.

```js
const User = require('./entity/User');

let scope     = wetland.getManager();
let data      = {username: 'Frank', email: 'frank@provider.tld', profile: {avatar: {}}};
let populator = wetland.getPopulator(scope);
let populated = populator.assign(User, data, null, 2);
```

##### Nested infinite levels
Nests as long as it finds relations.

```js
const User = require('./entity/User');

let scope     = wetland.getManager();
let data      = {username: 'Frank', email: 'frank@provider.tld'};
let populator = wetland.getPopulator(scope);
let populated = populator.assign(User, data, null, true);
```

_**Note:** be careful with circular relations._

##### Don't nest
Only populate properties on given entity, and ignore all relations.

```js
const User = require('./entity/User');

let scope     = wetland.getManager();
let data      = {username: 'Frank', email: 'frank@provider.tld'};
let populator = wetland.getPopulator(scope);
let populated = populator.assign(User, data, null, false);
```

#### Update
To update, meaning, patch existing entity instances with new data, simply provide the base. The rest of the method is the same as above examples.

```js
const User = require('./entity/User');

let base      = Object.assign(new User, {username: 'Hank', email: 'frank@provider.tld'});
let scope     = wetland.getManager();
let data      = {username: 'Frank'}; // change username
let populator = wetland.getPopulator(scope);
let populated = populator.assign(User, data, base);
```

### Assign collection
This method behaves exactly like assign, but accepts an Array. This method uses assign, as assign uses this method as well whenever the populator encounters a single, or collection relation.

```js
const User              = require('./entity/User');
const {ArrayCollection} = require('wetland');

let scope     = wetland.getManager();
let populator = wetland.getPopulator(scope);
let data      = new ArrayCollection;

data.push({username: 'Frank', email: 'frank@provider.tld'});

let populated = populator.assignCollection(User, data);  // Assign data
```

_**Note:** provided base, if used, needs to be proxied for the populator to work. This is automatically done when you use repository.fetch / fetchOne or Query.getResult(). It uses the proxy to maintain relation changes._

_**Another note:** Instances part of collections need to be part of the IdentityMap for the populator to work on updates. It uses these as base._

### Find data for update
This is a convenience method meant to be used sparingly as it is not an optimized format. It analyzes the provided data, and fetches the to-be-updated records from the database. It uses individual queries to provide joins for some optimizations.

```js
const User              = require('./entity/User');
const {ArrayCollection} = require('wetland');

let scope     = wetland.getManager();
let populator = wetland.getPopulator(scope);
let data      = {username: 'irrelevant', profile: {id: 1}};
let primary   = 1; // Primary key of the user we're fetching data for

populator.findDataForUpdate(primary, User, data).then(result => {
  // Returns user populated with profile having id 1
});
```

_**Note:** This method does not work recursively at the time of writing; and might never do so._

#### Suggestion
When updating data, instead of relying on `.findDataForUpdate()`, it's best to fetch the data using the EntityRepository, and pass it in as base, this is much faster and predictable.

## Coding time
Now, let's use this tool to create a general update method.

### Create
Let's change the product create method to use the Populator. Open up `app/resource/product.js` and replace the `POST /` route with the following code:

```js
// Create a new product
router.post('/', (req, res) => {
  let manager   = req.getManager();
  let populator = req.wetland.getPopulator(manager);
  let product   = populator.assign(Product, req.body);

  manager.persist(product).flush()
    .then(() => res.json(product))
    .catch(error => res.status(500).json({error}));
});
```

As you can see, we get the populator from wetland and then assign the body without a base, meaning it'll return a new entity and nest one level deep (category).

### Update
Now add a `PATCH /:id` route with the following code:

```js
// Update a product
router.patch('/:id', (req, res) => {
  let manager   = req.getManager();
  let populator = req.wetland.getPopulator(manager);

  manager.getRepository(Product)
    .findOne(req.params.id)
    .then(product => {
      if (!product) {
        return res.status(404).json(null);
      }

      // Only allow own-properties in populate.
      populator.assign(Product, req.body, product, false);

      // Nested then, to avoid and action on 404.
      return manager.flush().then(() => res.json(product));
    })
    .catch(error => res.status(500).json({error}));
});
```

This is very similar to create, except we first fetch the product to be updated and then use that as the `base` for `.assign()`.

#### Testing
Start your server (or restart it, if it's still running): `node app`.

##### Create
Running the following command:

```bash
curl -XPOST -H 'Content-Type: application/json' -d '{
 "name":"populator made me",
 "stock": 42,
 "category": 1
}' http://127.0.0.1:3000/product
```

Which should produce a response like:

```json
{
  "name": "Populator made me",
  "stock": 42,
  "id": 8,
  "categories": [],
  "created": "2017-03-08 16:56:40"
}
```

##### Update
Running this:

```bash
curl -XPATCH -H 'Content-Type: application/json' -d '{
 "name":"populator changed me",
 "stock": 1337
}' http://127.0.0.1:3000/product/8
```

_**Note:** don't forget to change the 8 to whatever id was returned to you if different._

Should produce a result similar to:

```json
{
  "id": 8,
  "name": "populator changed me",
  "created": "2017-03-08 16:56:40",
  "stock": 1337,
  "categories": []
}
```

##### Verify
To verify the changes have been applied, you can check the single-product route: [http://127.0.0.1:3000/product/8](http://127.0.0.1:3000/product/8).

## Next step
Alright, we're all done with the populator, and this tutorial! You can now wield this powerful ORM and start making working with the database fun and reliable.

### What's next
If you really want to learn more about wetland at this point, you can check out the bonus topics or the API documentation.
