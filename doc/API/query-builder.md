# Query Builder
To get the query builder:

```js
let queryBuilder = wetland.getManager().getRepository(Entity).getQueryBuilder();
```

{% method %}
## .createAlias()
Creates an alias for an entity. This method is used by `.join()` to create an alias for the join column.
To create an alias we recommend you to pass it directly on the `.getQueryBuilder()` method.

{% common %}
```js
queryBuilder.createAlias('a');
```
{% endmethod %}

{% method %}
## .crossJoin()
Performs a cross join. Takes the column name the fist argument and the target alias as the second argument.

{% common %}
```js
queryBuilder.crossJoin('columnName', 'a');
```
{% endmethod %}

{% method %}
## .fullOuterJoin()
Performs a full outer join.

{% common %}
```js
queryBuilder.fullOuterJoin('columnName', 'a');
```
{% endmethod %}

{% method %}
## .getQuery()
Gets an instance of the query class.

{% common %}
```js
queryBuilder.getQuery();
```
{% endmethod %}

{% method %}
## .innerJoin()
Performs an inner join.

{% common %}
```js
queryBuilder.innerJoin('columnName', 'a');
```
{% endmethod %}

{% method %}
## .insert()
Signals an insert.

{% common %}
```js
queryBuilder.insert({name: 'Wesley'});
```
{% endmethod %}

{% method %}
## .join()
Performs a join. This method is used by specific join methods in this class and we recommend you to use them instead.

{% common %}
```js
queryBuilder.join('innerJoin', 'columnName', 'a');
```
{% endmethod %}

{% method %}
## .leftJoin()
Performs
Performs a left join.

{% common %}
```js
queryBuilder.leftJoin('columnName', 'a');
```
{% endmethod %}

{% method %}
## .leftOuterJoin()
Performs a left outer join.

{% common %}
```js
queryBuilder.leftOuterJoin('columnName', 'a');
```
{% endmethod %}

{% method %}
## .limit()
Sets the limit.

{% common %}
```js
queryBuilder.limit(10);
```
{% endmethod %}

{% method %}
## .offset()
Sets the offset.

{% common %}
```js
queryBuilder.offset(10);
```
{% endmethod %}

{% method %}
## .orderBy()
Sets the order by. 

{% common %}
```js
queryBuilder.orderBy('name');
queryBuilder.orderBy('name', 'desc');
queryBuilder.orderBy({name: 'desc'});
queryBuilder.orderBy(['name', {age: 'asc'}]);
```
{% endmethod %}

{% method %}
## .outerJoin()
Performs an outer join.

{% common %}
```js
queryBuilder.outerJoin('columnName', 'a');
```
{% endmethod %}

{% method %}
## .prepare()
Makes sure all changes have been applied to the query.

{% common %}
```js
queryBuilder.prepare();
```
{% endmethod %}

{% method %}
## .remove()
Signals a delete.

{% common %}
```js
queryBuilder.remove();
```
{% endmethod %}

{% method %}
## .rightJoin()
Performs a right join.

{% common %}
```js
queryBuilder.rightJoin('columnName', 'a');
```
{% endmethod %}

{% method %}
## .rightOuterJoin()
Performs a right outer join.

{% common %}
```js
queryBuilder.rightOuterJoin('columnName', 'a');
```
{% endmethod %}

{% method %}
## .select()
Select columns. Giving it an alias or the column name equals to `SELECT *`.

{% common %}
```js
queryBuilder.select('a');
queryBuilder.select('a.age');
queryBuilder.select({sum: 'age'});
```
{% endmethod %}

{% method %}
## .update()
Signals an update.

{% common %}
```js
queryBuilder.update({name: 'Wesley'});
```
{% endmethod %}

{% method %}
## .where()
Sets the where clause.

{% common %}
```js
queryBuilder.where({name: 'Wesley'});
queryBuilder.where({name: ['Wesley', 'Raphaela']});
queryBuilder.where({name: 'Wesley', company: 'SpoonX', age: {gt: 25}});
```
{% endmethod %}
