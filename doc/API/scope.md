# Scope
The scope class is instantiated by the entity manager.

```js
let scope = wetland.getManager();
```

{% method %}
## .attach()
This method is used to proxy an entity with the entity proxy.

{% common %}
```js
scope.attach(entity);
```
{% endmethod %}

{% method %}
## .clear()
Clears the unit of work.

{% common %}
```js
scope.clear();
```
{% endmethod %}

{% method %}
## .detach()
Removes proxy and clear this entity from the unit of work.

{% common %}
```js
scope.detach(entity);
```
{% endmethod %}

{% method %}
## .flush()
This method is responsible for persisting the unit of work.
This means calculating changes to make, as well as the order to do so.
One of the things involved in this is making the distinction between stores.

{% common %}
```js
scope.flush();
```
{% endmethod %}

{% method %}
## .getConfig()
Gets the wetland configuration.

{% common %}
```js
scope.getConfig();
```
{% endmethod %}

{% method %}
## .getEntities()
Gets all registered entities with the entity manager.

{% common %}
```js
scope.getEntities();
```
{% endmethod %}

{% method %}
## .getEntity();
Gets a single entity with the entity manager.

{% common %}
```js
scope.getEntity('name');
```
{% endmethod %}

{% method %}
## .getReference()
Gets a reference to a persisted row without actually loading it.
Besides giving it the entity, you also need to specify the primary key value of the targeted row.

{% common %}
```js
scope.getReference(entity, 1);
```
{% endmethod %}

{% method %}
## .getRepository()
Returns an entity repository instance for provided entity.

{% common %}
```js
scope.getRepository(entity);
```
{% endmethod %}

{% method %}
## .getStore()
Gets the store for provided entity with wetland.

{% common %}
```js
scope.getStore(entity);
```
{% endmethod %}

{% method %}
## .getUnityOfWork()
Returns an instance of unit of work. The methods of the unit of work are listed and described [here.](./unit-of-work.md)

{% common %}
```js
scope.getUnitOfWork();
```
{% endmethod %}

{% method %}
## .persist()
Mark provided entity as new with the unit of work.
This method returns `.registerNew()` from the unit of work to register new entities that will be persisted when `.flush()` is called.

{% common %}
```js
scope.persist([entity1, entity2]);
```
{% endmethod %}

{% method %}
## .refresh()
This method refreshes provided entities, syncing with the database. Entities must be passed as an array.

{% common %}
```js
scope.refresh([entity1, entity2]);
```
{% endmethod %}

{% method %}
## .remove()
Marks an entity as deleted with the unit of work.
This method returns `.registerDeleted()` from the unit of work to register the provided entity as deleted.
While it is registered as deleted, the entity will be deleted from the database when `.flush()` is called.

{% common %}
```js
scope.remove(entity);
```
{% endmethod %}

{% method %}
## .resolveEntityReference()
Resolve provided value to an entity reference. The argument can be a name, a constructor or the entity itself.

{% common %}
```js
scope.resolveEntityReference(entity);
```
{% endmethod %}
