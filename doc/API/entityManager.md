# Entity Manager
To create an entity manager instance and use the methods bellow:

```js
let manager = wetland.getManager();
````

{% method %}
## .createScope()
Creates a new entity manager scope.

{% common %}
```js
manager.createScope();
```
{% endmethod %}

{% method %}
## .getConfig()
Gets the config using `.getConfig()` from wetland.

{% common %}
```js
manager.getConfig();
```
{% endmethod %}

{% method %}
## .getEntities()
Returns all registered entities as an object.

{% common %}
```js
manager.getEntities();
```
{% endmethod %}

{% method %}
## .getEntity()
Get the reference to an entity constructor by its name.

{% common %}
```js
manager.getEntity('entityName');
```
{% endmethod %}

{% method %}
## .getMapping()
Get the mapping for provided entity. Can be an instance, constructor or the name of the entity.

{% common %}
```js
manager.getMapping(entity);
```
{% endmethod %}

{% method %}
## .registerEntities()
Register multiple entities.

{% common %}
```js
manager.registerEntities([entity1, entity2]);
```
{% endmethod %}

{% method %}
## .registerEntity()
Register a single entity.

{% common %}
```js
manager.registerEntity(entity);
```
{% endmethod %}

{% method %}
## .resolveEntityReference()
Resolve provided value to an entity reference. The argument can be a name, the constructor or the entity itself.

{% common %}
```js
manager.resolveEntityReference(entity);
```
{% endmethod %}
