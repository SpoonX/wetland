# Unit of Work
The methods from unit of work are commonly used indirectly by calling other methods from scope and entity manager.
The unit of work static methods, such as `isClean()` or `getObjectState()` can be used to confirm or check the state of an object.
To get the unit of work:

```js
let unitOfWork = wetland.getManager().getUnitOfWork();
```


{% method %}
## .cascadeSingle()
Prepares cascade for a single entity. This method is used in `.prepareCascades()`.

{% common %}
```js
unitOfWork.cascadeSingle(entity, 'property', entity['property'], mapping);
```
{% endmethod %}

{% method %}
## .clean()
Mark everything as clean, empty transactions and empty after commits.

{% common %}
```js
unitOfWork.clean();
```
{% endmethod %}

{% method %}
## .clear()
Rolls back all affected objects.
It reverts changes in dirty entities, un-persist new entities, un-stage deleted entities and refresh persisted entities.

{% common %}
```js
unitOfWork.clear([entity1, entity2]);
```
{% endmethod %}

{% method %}
## .clearEntityState()
Clear the state for provided entity. Used by `.clean()` and `.clear()`.

{% common %}
```js
unitOfWork.clearEntityState(entity);
```
{% endmethod %}

{% method %}
## .commit()
Commits the current state to the database.

{% common %}
```js
// Skip cleaning (state) of entities. Saves on performance.
// Only use if you're done with the scope.
const skipClean = true;

// Skips the lifecycle hooks on the entities. Useful in rare situations.
const skipLifecycleHooks = true;

// Some options to override the defaults for this specific flush.
// Refresh is responsible for re-fetching the entity's data from the database.
const config = { refreshCreated: true, refreshUpdated: true };

// Aaaand commit!
unitOfWork.commit(skipClean, skipLifecycleHooks, config);
```
{% endmethod %}

{% method %}
## .getCleanObjects()
Returns an array of objects marked as clean.

{% common %}
```js
unitOfWork.getCleanObjects();
```
{% endmethod %}

{% method %}
## .getDeletedObjects()
Returns an array of objects marked as deleted.

{% common %}
```js
unitOfWork.getDeletedObjects();
```
{% endmethod %}

{% method %}
## .getDirtyObjects()
Returns an array of objects marked as dirty.

{% common %}
```js
unitOfWork.getDirtyObjects();
```
{% endmethod %}

{% method %}
## .getEntityManager()
Gets the entity manager used by this unit of work.

{% common %}
```js
unitOfWork.getEntityManager();
```
{% endmethod %}

{% method %}
## .getNewObjects()
Returns an array of objects market as new.

{% common %}
```js
unitOfWork.getNewObjects();
```
{% endmethod %}

{% method %}
## getObjectState(entity)
Static method to get the current state for provided entity as a string.

{% common %}
```js
getObjectState(entity);
```
{% endmethod %}

{% method %}
## getRelationshipsChangedObjects()
Returns an array of objects marked as having relationship changes.

{% common %}
```js
unitOfWork.getRelationshipsChangedObjects();
```
{% endmethod %}

{% method %}
## hasRelationChanges()
Static method that returns `true` if provided entity has relationship changes.

{% common %}
```js
hasRelationChanges(entity);
```
{% endmethod %}

{% method %}
## isClean()
Static method that returns `true` if provided entity is clean.

{% common %}
```js
isClean(entity);
```
{% endmethod %}

{% method %}
## isDirty()
Static method that returns `true` if provided entity is dirty.

{% common %}
```js
isDirty(entity);
```
{% endmethod %}

{% method %}
## .prepareCascades()
This method prepares cascades for all stages changes. It is used internally by `.commit()`.

{% common %}
```js
unitOfWork.prepareCascades();
```
{% endmethod %}

{% method %}
## .prepareCascadesFor()
Prepares the cascades for provided entity.
Used internally by `.cascadeSingle()` to cascade a property's child and by `prepareCascades()` to prepare cascades for every entity.

{% common %}
```js
unitOfWork.prepareCascadesFor(entity);
```
{% endmethod %}

{% method %}
## .registerClean()
Registers an object as clean. This method is used by `.clean()` to mark all objects as clean.

{% common %}
```js
unitOfWork.registerClean(object);
```
{% endmethod %}

{% method %}
## .registerCollectionChange()
Register a collection change between `targetEntity` and `relationEntity`.
Used internally by `.prepareCascadesFor()` to link up a new relation with entity.
Can also be used to remove a relationship.

{% common %}
```js
unitOfWork.registerCollectionChange('relationship_added', targetEntity, 'property', relationEntity);
```
{% endmethod %}

{% method %}
## .registerDeleted()
Registers an object as deleted.

{% common %}
```js
unitOfWork.registerDeleted(object);
```
{% endmethod %}

{% method %}
## .registerDirty()
Registers an object as dirty.

{% common %}
```js
unitOfWork.registerDirty(object);
```
{% endmethod %}

{% method %}
## .registerNew()
Registers an object as new. Used by `.cascadeSingle()` to register new relation.

{% common %}
```js
unitOfWork.registerNew(object);
```
{% endmethod %}

{% method %}
## .registerRelationChange()
Register a relationship change between `targetEntity` and `relationEntity`.
Used by `.prepareCascadesFor()` to register relationship changes.

{% common %}
```js
unitOfWork.registerRelationChange('relationship_added', targetEntity, 'property', relationEntity);
```
{% endmethod %}

{% method %}
## .setEntityState()
Sets the state of an entity.
Used internally by `.registerClean()`, `.registerNew()`, `.registerDirty()` and `.registerDeleted()`.

{% common %}
```js
unitOfWork.setEntityState(entity, 'clean');
```
{% endmethod %}
