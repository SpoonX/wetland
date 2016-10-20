# Schema Builder
The schema builder is used by the migrator class to create the entity's schema.

{% method %}
## .apply()
Persists the schema to the database, returns a promise.

{% common %}
```js
schemaBuilder.apply();
```
{% endmethod %}

{% method %}
## .bigInteger()
Define a column type as `BIGINT`. Field object is defined by the [field options.](mapping.md#field)

{% common %}
```js
schemaBuilder.bigInteger(table, field);
```
{% endmethod %}

{% method %}
## .binary()
Define a column type as `BINARY`.

{% common %}
```js
schemaBuilder.binary(table, field);
```
{% endmethod %}

{% method %}
## .boolean()
Define a column type as `BOOLEAN`.

{% common %}
```js
schemaBuilder.boolean()
```
{% endmethod %}

{% method %}
## .create()
Creates the schema.

{% common %}
```js
schemaBuilder.create();
```
{% endmethod %}

{% method %}
## .date()
Define a column type as `DATE`.

{% common %}
```js
schemaBuilder.date(table, field);
```
{% endmethod %}

{% method %}
## .dateTime()
Define a column type as `DATETIME`.

{% common %}
```js
schemaBuilder.datetime(table, field);
//or
schemaBuilder.dateTime(table, field);
```
{% endmethod %}

{% method %}
## .decimal()
Define a column type as `DECIMAL`.
If `precision` and `scale` are not defined on the field options, `precision` will be set to `8` and `scale` to `2`.

{% common %}
```js
schemaBuilder.decimal(table, field);
```
{% endmethod %}

{% method %}
## .enumeration()
Define a column type as `ENUM`.

{% common %}
```js
schemaBuilder.enumeration(table, field);
```
{% endmethod %}

{% method %}
## .float()
Define a column type as `FLOAT`.
If `precision` and `scale` are not defined on the field options, `precision` will be set to `8` and `scale` to `2`.

{% common %}
```js
schemaBuilder(table, field);
```
{% endmethod %}

{% method %}
## .getSQL()
Gets the schema queries.

{% common %}
```js
schemaBuilder.getSQL();
```
{% endmethod %}

{% method %}
## .integer()
Define a column type as `INT`.

{% common %}
```js
schemaBuilder.integer(table, field);
```
{% endmethod %}

{% method %}
## .json()
Define a column type as `JSON`.

{% common %}
```js
schemaBuilder.json(table, field);
```
{% endmethod %}

{% method %}
## .jsonb()
Define a column type as `JSONB`.

{% common %}
```js
schemaBuilder.jsonb(table, field);
```
{% endmethod %}

{% method %}
## .string()
Define a column type as `VARCHAR`.
If `size` is not defined on the field options, it defaults to `255`. 

{% common %}
```js
schemaBuilder.string(table, field);
```
{% endmethod %}

{% method %}
## .text()
Define a column type as `TEXT`.

{% common %}
```js
schemaBuilder.text(table, field);
```
{% endmethod %}

{% method %}
## .time()
Define a column type as `TIME`.

{% common %}
```js
schemaBuilder.time(table, field);
```
{% endmethod %}

{% method %}
## .timestamp()
Define a column type as `TIMESTAMP`.

{% common %}
```js
schemaBuilder.timestamp(table, field);
```
{% endmethod %}

{% method %}
## .uuid()
Define a column type as `CHAR(36)`. (`UUID` on postgresql)

{% common %}
```js
schemaBuilder.uuid(table, field);
```
{% endmethod %}
