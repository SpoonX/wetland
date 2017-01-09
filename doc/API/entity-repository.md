# Entity Repository
To get the entity repository:

```js
let entityRepository = wetland.getManager().getRepository(Entity);
```

{% method %}
## .find()
Finds entities based on provided criteria. Use `null` if you don't wish to pass any criteria.
Optionals [finding options](#find-options) can be used as a second argument.

{% common %}
```js
entityRepository.find({name: 'Wesley'} , {populate: ['project']});
```
{% endmethod %}

{% method %}
## .findOne()
Finds a single entity. In this method, criteria can be either an object, a number, a string or `null`. 

{% common %}
```js
entityRepository.findOne({'u.name': 'Wesley', 'project.name': 'wetland'}, {alias: 'u', populate: ['u.project']});
```
{% endmethod %}

{% method %}
## .getQueryBuilder()
Gets a new query builder. Optionally you can create your alias by passing a string as an argument.

{% common %}
```js
entityRepository.getQueryBuilder('u');
```
{% endmethod %}

#### Find options

|  Options  |                Type                         |
|:----------|:-------------------------------------------:|
| orderBy   | any                                         |
| alias     | string                                      |
| limit     | number                                      |
| offset    | number                                      |
| debug     | boolean                                     |
| populate  | object,  array of strings, array of objects |
