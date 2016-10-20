# Store
To get the store:

```js
let store = wetland.getStore('store');
```

{% method %}
## .getConnection()
Gets a connection for `role`. Uses round robin. If no argument is passed, uses `'single'` as default role.

{% common %}
```js
store.getConnection('master');
```
{% endmethod %}

{% method %}
## .getConnections()
Gets the connection registered on this store.

{% common %}
```js
store.getConnections();
```
{% endmethod %}

{% method %}
## .getName()
Gets the name of the store.

{% common %}
```js
store.getName();
```
{% endmethod %}

{% method %}
## .register()
Registers connections. Connection config is an object and its keys vary according to the type of connection. 

{% common %}
```js
store.register({
  client: 'mysql',
  connection: {
    host    : '127.0.0.1',
    user    : 'root'
    database: 'wetland_database'
  }
});
```
{% endmethod %}

{% method %}
## .registerConnection()
Register a connection. Stating role is optional.

{% common %}
```js
store.registerConnection({connection: {...}}, 'slave');
```
{% endmethod %}

{% method %}
## .registerPool()
Registers a pool of connections.

{% common %}
```js
store.registerPool({
  client     : 'mysql',
  connections: [{...}, {...}]
});
```
{% endmethod %}

{% method %}
## .registerReplication()
Registers replication connections.

{% common %}
```js
store.registerReplication({
  client     : 'mysql',
  connections: {
    master: [{...}, {...}],
    slave : [{...}, {...}, {...}]
  }
});
```
{% endmethod %}
