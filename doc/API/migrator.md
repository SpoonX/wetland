# Migrator
To get the migrator:

```js
let migrator = wetland.getMigrator();
```

{% method %}
## .allMigrations()
Gets all migrations from the directory on the config.

{% common %}
```js
migrator.allMigrations();
```
{% endmethod %}

{% method %}
## .appliedMigrations()
Gets all applied migrations.

{% common %}
```js
migrator.appliedMigrations();
```
{% endmethod %}

{% method %}
## .create()
Creates a new migration file.

{% common %}
```js
migrator.create('migrationName');
```
{% endmethod %}

{% method %}
## .createSchema()
Creates your database schema.

{% common %}
```js
migrator.createSchema();
```
{% endmethod %}

{% method %}
## .down()
Go down one version based on latest run migration timestamp.
Pass `'run'` to run the migration or `'getSQL'` to get the queries.

{% common %}
```js
migrator.down('run');
```
{% endmethod %}

{% method %}
## .getConnection()
Get the connection for the migrations tables.

{% common %}
```js
migrator.getConnection();
```
{% endmethod %}

{% method %}
## .latest()
Go up to the latest migration.
Pass `'run'` to run the migration or `'getSQL'` to get the queries.

{% common %}
```js
migrator.latest('run');
```
{% endmethod %}

{% method %}
## .revert()
Revert the last run UP migration (or batch of UP migrations).
Pass `'run'` to run the migration or `'getSQL'` to get the queries.

{% common %}
```js
migrator.revert('run');
```
{% endmethod %}

{% method %}
## .run()
Run a specific migration.
Although you can run your migration using this method, we recommend you to use `.up()`, `.down()`,
`.latest()` and `.revert()` instead.

{% common %}
```js
migrator.run('up', 'getSQL', '20161004123412_foo');
```
{% endmethod %}

{% method %}
## .up()
Go up one version based on latest run migration timestamp.

{% common %}
```js
migrator.up('run');
```
{% endmethod %}
