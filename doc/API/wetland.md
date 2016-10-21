# Wetland
Through wetland we are able to connect with the database,
register entities and access methods that belong to different classes throughout the ORM. 
Here we are going to describe all of its methods and how to use them.

```js
let wetland = new Wetland();
```

{% method %}
## .destroyConnections()
This method destroys all active connections, returning a Promise.

{% common %}
```js
wetland.destroyConnections();
```
{% endmethod %}

{% method %}
## .getConfig()
Gets the wetland config.

{% common %}
```js
wetland.getConfig();
```
{% endmethod %}

{% method %}
## .getManager()
This method gets a scoped entity manager.


{% common %}
```js
wetland.getManager();
```
{% endmethod %}

{% method %}
## .getMigrator()
This method returns an instance of migrator, that you can use to create and run your database migrations. 

{% common %}
```js
wetland.getMigrator();
```
{% endmethod %}

{% method %}
## .getStore()
Gets a store by name. If no name is given, this method will return the default store.

{% common %}
```js
wetland.getStore('store');
```
{% endmethod %}

{% method %}
## .registerEntities()
This method register multiple entities with the entity manager. 
Using this method is another way to register your entities, if you decide not to register them upon creating a wetland instance.

{% common %}
```js
wetland.registerEntities([entity1, entity2]);
```
{% endmethod %}

{% method %}
## .registerEntity()
Just like `.registerEntities()`, but only registering one entity with the entity manager.

{% common %}
```js
wetland.registerEntity(entity);
```
{% endmethod %}

{% method %}
## .registerStore()
This method registers a store with wetland. 
The first registered store using this method will be set as the default store. 
The second argument is an object with your store configuration. 

{% common %}
```js
wetland.registerStore('myStore', {config: {...}});
```
{% endmethod %}

{% method %}
##.registerStores()
Registers multiple stores with wetland. Stores must be passed as a single object.

{% common %}
```js
let stores = {
  store1 : {...},
  store2 : {...}
};

wetland.registerStores(stores);
```
{% endmethod %}
