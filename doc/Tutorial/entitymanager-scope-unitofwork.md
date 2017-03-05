# EntityManager, Scope and UnitOfWork

> To clone the finished code for this part of the tutorial, run the following command:
>
> `git clone git@github.com:SpoonX/wetland-tutorial.git -b 7-entitymanager-scope-unitofwork --single-branch`
>
> To clone the base code for this part of the tutorial, run the following command:
>
> `git clone git@github.com:SpoonX/wetland-tutorial.git -b 6-lifecycle-callbacks --single-branch`
>
> Find the full repository on github [here](https://github.com/SpoonX/wetland-tutorial).

In this part of the tutorial we'll take a quick look at the entity manager.

## What?
The entity manager is responsible for holding all entities. It resolves strings to references, and allows you to register new entities.

The entity manager itself is something you very rarely use. It gets used once to register entities, which is done by wetland itself (remember where we configured the path to the entities in wetland.js?).

That's why usually, when we talk about the entity manager, we'll refer to an EntityManager `Scope` instance. A scope instance does what a regular entity manager does, and more.

## Why a scope
Because Node.js is an async language where the server is shared between many clients, you have to segment states for requests.
Wetland does so through scoped entity managers.

The reason we might expect a scope at all, is because entity instance are expected to have a state. The states are:

- clean
- new
- dirty
- relationship_changed
- deleted

Internally, wetland maintains this state, as well as an index for entities. This state shouldn't collide with other scopes.

### Use case
Wetland maintains the state of your entities, and doesn't apply them to the database until you tell it to. It then applies all the changes in a **single transaction**, so it can roll back on failure, and commit on success to guarantee data integrity.

Let's say you have some code running that stages entities to be deleted, and unstages them based on a conditional further down the application. Now, let's say some other user makes a request to your server and flushes his or her changes to the database, before you got to the point where you unstage entities to be deleted: your data has just been deleted.

For that reason you want to work with scopes in every context: requests, cron jobs, cli commands and so on.

## Unit of work
When we say that wetland maintains state, there's a specific part of wetland that's responsible for this. This is called the unit of work.

Before I explain what the unit of work is, I want you to know that **you don't have to worry** about it that much. You almost never directly work with the unit of work. Nonetheless, it's good to know a bit more about the internals of, and patterns used in, wetland.

So, what's a unit of work?

> Maintains a list of objects affected by a business transaction and coordinates the writing out of changes and the resolution of concurrency problems.
>
> _**Source: [P of EAA](https://martinfowler.com/eaaCatalog/unitOfWork.html)**_

In simpler terms, the unit of work maintains the state of your entities. So:

- If you fetch an entity and change it, the unit of work will know that it needs to **update** the record
- If you create a new entity and _persist_ it, the unit of work will know that it needs to **create** a new record
- If you **add or remove** an entity from or to a relation property, the unit of work will know it needs to update the relation
- If you remove an entity, the unit of work will know that it should **delete** the record

These changes, as mentioned earlier, don't get applied instantly. Instead they're **staged** for you to _flush_ to the database at a later time.

## Coding time
With the theory out of the way, let's put it to practise. To do this, we'll create our first category and store it in the database!

Open up `app/resource/category.js` and change it to:

```js
const express  = require('express');
const router   = express.Router();
const Category = require('../entity/Category');

router.post('/', (req, res) => {
  let wetland  = req.wetland;
  let manager  = wetland.getManager();
  let category = new Category;

  category.name = req.body.name;

  manager.persist(category)
    .flush()
    .then(() => res.json(category))
    .catch(error => res.status(500).json({error}));
});

router.get('/', (req, res) => res.json({hello: 'from category.js'}));

module.exports = router;
```

Let's break this down in detail.

### Breaking it down
We're using router.post to register a new post route.

The first part to notice is that we import the Category entity. We'll be creating an instance, and giving it a name.

Isolated, that looks like this:

```js
// Import entity
const Category = require('../entity/Category');

// Create a new instance
let category = new Category;

// Set the name
category.name = req.body.name;
```

Nothing special here. It's just a normal class instance, and we're setting a property's value.

Now lets look at these lines:

```js
let wetland  = req.wetland;
let manager  = wetland.getManager();
let category = new Category;

category.name = req.body.name;
```

The first thing we do, is get the wetland instance from the request. This is the same as the wetland instance we created in `app.js`. From the wetland instance, we then request a manager. **This is the scope** we talked about earlier. Then, we create a new `Category` instance, and set its name.

This is where it gets interesting:

```js
manager.persist(category)
  .flush()
  .then(() => res.json(category))
  .catch(error => res.status(500).json({error}));
```

First, we tell the manager that there's a new category in town, by calling `.persist()`. At this point, the entity is simply **marked as new** _(remember the unit of work? Yeah, that's where it is now)_. At this point, we could persist more entities, remove some... But we're not doing that. Instead we're telling the manager that we want to `.flush()` our results. Now all staged changes get prepared, a transaction gets started and the category gets stored in the database.

The then and catch are simply there to respond to the request.

### Testing it
Now, let's test our newly added code. Open up your terminal start your server.

`node app.js`

Then run the following curl command in a new terminal tab / window:

```bash
curl -XPOST -H 'Content-Type: application/json' -d '{
 "name":"generic"
 }' http://127.0.0.1:3000/category
```

This will end up in the code we just wrote, and should return the following:

```json
{
  "name": "generic",
  "created": 1488358591896,
  "id": 1,
  "products": []
}
```

_**Note:** The `created` value will be different, as this is a timestamp._

## Next step
This was a lot to process, but we now know what we mean by state, scope and entity manager.

[Go to the next part](repository.md).
