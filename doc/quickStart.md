# Getting started
Now that you know how to register your entities and your store, you are ready to get some work done.
Here we will show you how to use basic methods to apply changes and fetch items from your database.
More detailed examples can be found on our [Cookbook.]()

{% method %}
## "I'd like to speak to the manager!"
To instantiate the entity manager all you need to do is call `.getManager()` on your wetland instance.
The entity manager distributes scopes and supplies some core methods to be used in your application.

{% sample lang="js" %}
```js
const Wetland = require('wetland');
const wetland = new Wetland({
  stores: {
    defaultStore: {...}
  },
  entityPath: __dirname + './entities'
});

let manager = wetland.getManager();
```

{% sample lang="ts" %}
```js
import {Wetland} from 'wetland';

const wetland = new Wetland({
  stores: {
    defaultStore: {...}
  },
  entities: __dirname + './entities'
});

let manager = wetland.getManager();
```
{% method %}
## Creating new objects
Creating a new object is very easy.
All you have to do is create a new instance of your entity and edit its properties like a normal object.

{% common %}
```js
let newUser        = new User();
newUser.name       = 'Wesley';
```
{% endmethod %}

{% method %}
## Persisting changes
To persist object changes into your database, call  `.persist()` to stage this entity to be persisted and `.flush()` to 
actually apply those changes.

{% common %}
```js
manager.persist(newUser).flush().then(() => console.log('New user created'));
```
{% endmethod %}

{% method %}
## Fetching from the database
To fetch rows from your database, call `.getRepository()` to specify which table you are fetching from and `.find()` to 
fetch based on your criteria.

{% common %}
```js
manager.getRepository(User).find({name: 'Wesley'}).then();
```
{% endmethod %}
