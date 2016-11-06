# Mapping
The mapping methods are used to create the entity's schema. Usage examples can be found on our [Cookbook.]()

{% method %}
## .addRelation()
This method adds a relation to the mapping, although we recommend you to use `.oneToOne()`, `.oneToMany()`, 
`.manyToMany()` or `.manyToOne()` instead, for practical reasons.
The options available to create your relationship are described [here.](#relationship-options)

{% common %}
```js
mapping.addRelation('property', {targetedEntity: 'target', type: 'oneToMany', inversedBy: 'field'});
```
{% endmethod %} 

{% method %}
## .cascade() 
Sets cascade options to `persist`, `delete` or both.
The cascade options must be passed as an array, regardless of how many cascade options the property has. 

{% common %}
```js
mapping.cascade('property', ['persist']);
// or
mapping.forProperty('property').cascade(['persist']);
```
{% endmethod %}

{% method %}
## .entity()
Maps an entity, allowing you to create a custom attributes for your entity.
By using this method you can customize the `repository`, `name`, `tableName` and `store` attributes of your entity.

{% common %}
```js
mapping.entity({repository: MyRepository, name: 'custom', store: MyOtherStore});
```
{% endmethod %}

{% method %}
## .extendField()
Extend the field options for a property. This method is used internally by other methods in the Mapping class.
The field options can be found [here.](#field-options)

{% common %}
```js
mapping.extendField('property', {type: 'integer'});
```
{% endmethod %}

{% method %}
## .field() 
Maps a field for an entity. [Here](#field-options) is the list of field options you can use to map your property accordingly.

{% common %} 
```js
mapping.field('property', {type: 'string', size: 20});
// or
mapping.forProperty('property').field({type: 'string', size: 20});
```
{% endmethod %}

{% method %}
## forEntity()
Static method to get the mapping for a specific entity. Returns the entity's mapping instance.

{% common %}
```js
forEntity('entity');
```
{% endmethod %}

{% method %}
## .forProperty()
Convenience method to map a property.
This method stores the name of the property, erasing the need to specify a target when chaining manipulating  
methods to map a property.

{% common %}
```js
mapping.forProperty('property');
```
{% endmethod %}

{% method %}
## .generatedValue()
This method maps the generated values of a property.
It calls `.extendField()` on the property, adding a type to the `generatedValue` field.

{% common %}
```js
mapping.generatedValue('id', 'autoIncrement');
// or
mapping.forProperty('id').generatedValue('autoIncrement');
```
{% endmethod %}

{% method %}
## .getColumnName()
Gets the column name for a property.

{% common %}
```js
mapping.getColumnName('property');
```
{% endmethod %}

{% method %}
## .getEntityName()
Gets the name of the entity.

{% common %}
```js
mapping.getEntityName();
```
{% endmethod %}

{% method %}
## .getField()
Gets the options for provided property. Returns an object of field options.

{% common %}
```js
mapping.getField('property');
```
{% endmethod %}

{% method %}
## .getFieldName()
Gets the column name for given property.

{% common %}
```js
mapping.getFieldName('property');
```
{% endmethod %}

{% method %}
## .getFields()
Gets the fields for mapped entity, returning an array of objects containing the field options for each property.

{% common %}
```js
mapping.getFields();
```
{% endmethod %}

{% method %}
## .getIndexes()
Get the indexes for an entity, returning an object of indexes.

{% common %}
```js
mapping.getIndexes();
```
{% endmethod %}

{% method %}
## .getJoinColumn()
Get the join column for the relationship mapped via property, returning an object.
{% common %}
```js
mapping.getJoinColumn('property');
```
{% endmethod %}

{% method %}
## .getJoinTable()
Get the join table for the relationship mapped via property, returning an object.

{% common %}
```js
mapping.getJoinTable('property');
```
{% endmethod %}

{% method %}
## .getPrimaryKey()
Get the property that was assigned as the primary key.

{% common %}
```js
mapping.getPrimaryKey();
```
{% endmethod %}

{% method %}
## .getPrimaryKeyField()
Get the column name of the primary key.

{% common %}
```js
mapping.getPrimaryKeyField();
```
{% endmethod %}

{% method %}
## .getPropertyName()
Get the property name for a column name.

{% common %}
```js
mapping.getPropertyName('column');
```
{% endmethod %}
{% method %}
## .getRelations()
Get relations for mapped entity, returning an object.

{% common %}
```js
mapping.getRelations();
```
{% endmethod %}

{% method %}
## .getRepository()
Gets the Repository class for this mapping's entity.

{% common %}
```js
mapping.getRepository();
```
{% endmethod %}

{% method %}
## .getStoreName()
Gets the name of the store mapped for this entity.

{% common %}
```js
mapping.getStoreName();
```
{% endmethod %}

{% method %}
## .getTableName()
Returns the name of the table.

{% common %}
```js
mapping.getTableName();
```
{% endmethod %}

{% method %}
## .getTarget()
Get the target this entity is for.

{% common %}
```js
mapping.getTarget();
```
{% endmethod %}

{% method %}
## .getUniqueConstraints()
Gets unique constraints, returning an object.

{% common %}
```js
mapping.getUniqueConstraints();
```
{% endmethod %}

{% method %}
## .increments()
Convenience method to set auto increment.
This method calls `.extendField()` on the property, setting the `generatedValue` field option to `autoIncrement`. 

{% common %}
```js
mapping.increments('property');
// or
mapping.forProperty('property').increments();
```
{% endmethod %}

{% method %}
## .index()
Maps an index. If you decide not to choose your index name, wetland will do it for you.
The index name will then be `'idx_'` followed by your property names separated by an underscore.

{% common %}
```js
// Compound
mapping.index('idx_name', ['property1', 'property2']);

// Single
mapping.index('idx_name', ['property']);
mapping.index('idx_name', 'property');

// Generated index name "idx_property"
mapping.index('property');
mapping.index(['property1', 'property2']);
```
{% endmethod %}

{% method %}
## .isRelation()
Checks if property exists as a relation, returning a boolean.

{% common %}
```js
mapping.isRelation('property');
```
{% endmethod %}

{% method %}
## .joinColumn()
Register a join column.
This method calls `.extendField()` on the property, assigning the options given to the `joinColumn` field.
The full list of options can be found [here.](#join-column-options)

{% common %}
```js
mapping.joinColumn('property', {});
// or
mapping.forProperty('property').joinColumn({});
```
{% endmethod %}

{% method %}
## .joinTable()
Register a join table.
This method also uses `.extendField()` to assign the options given to the `joinTable` field.
The full list of options can be found [here.](#join-table-options)

{% common %}
```js
mapping.joinTable('property', {});
// or
mapping.forProperty('property').joinTable({});
```
{% endmethod %}

{% method %}
## .manyToMany()
Maps a many-to-many relationship.
A property in this kind of relationship can be either `mappedBy` or `inversedBy`, 
depending on if it is or not on the owning side, respectively. 

{% common %}
```js
mapping.manyToMany('property', {targetEntity: 'target', mappedBy: 'field'});
// or
mapping.forProperty('property').manyToMany({targetEntity: 'entity', mappedBy: 'field'});
```
{% endmethod %}

{% method %}
## .manyToOne()
Maps a many-to-one relationship. In this type of relationship, a property can only be `inversedBy`.

{% common %}
```js
mapping.manyToOne('property', {targetEntity: 'target', inversedBy: 'field'});
// or
mapping.forProperty('property').manyToOne({targetEntity: 'target', inversedBy: 'field'});
```
{% endmethod %}

{% method %}
## .now()
Raw command for current timestamp.

{% common %}
```js
mapping.now();
```
{% endmethod %}

{% method %}
## .oneToMany()
Maps a one-to-many relationship. In this case, the property is the owning side, so it can only be set as `mappedBy`.

{% common %}
```js
mapping.oneToMany('property', {targetEntity: 'target', mappedBy: 'field'});
// or
mapping.forProperty('property').oneToMany({targetEntity: 'target', mappedBy: 'field'});
```
{% endmethod %}

{% method %}
## .oneToOne()
Maps a one to one relationship.
A property in this kind of relationship can be either `mappedBy` or `inversedBy`, just like the many-to-many example. 

{% common %}
```js
mapping.oneToOne('property', {targetEntity: 'target', mappedBy: 'field'});
// or
mapping.forProperty('property').oneToOne({targetEntity: 'target', mappedBy: 'field'});
```
{% endmethod %}

{% method %}
## .primary()
Maps a property to be the primary key. This method uses `.extendField()` to set the `primary` field to true.

{% common %}
```js
mapping.primary('property');
// or
mapping.forProperty('property').primary();
```
{% endmethod %}

{% method %}
## .uniqueConstraint()
Maps a unique constraint.
If you don't wish to use a custom name for your constraint, wetland will use your property names to name it for you, 
separating them with an underscore and adding `'_unique'` at the end.

{% common %}
```js
// Compound:
mapping.uniqueConstraint('something_unique', ['property1', 'property2']);

// Single:
mapping.uniqueConstraint('something_unique', ['property']);
mapping.uniqueConstraint('something_unique', 'property');

// Generated uniqueConstraint name:
mapping.uniqueConstraint('property');
mapping.uniqueConstraint(['property1', 'property2']);
```
{% endmethod %}

### Field options
|    Options     |   Type  |
|:---------------|:-------:|
| cascades       | array   |
| comment        | string  |
| defaultTo      | any     |
| enumeration    | array   |
| generatedValue | string  |
| joinColumn     | object  |
| joinTable      | object  |
| name           | string  |
| nullable       | boolean |
| precision      | number  |
| primary        | boolean |
| relationship   | object  |
| scale          | number  |
| size           | number  |
| textType       | string  |
| type           | string  |
| unsigned       | boolean |
| [key: string]  | any     |

### Join column options
|     Options          |   Type  |
|:---------------------|:-------:|
| indexName            | string  |
| name                 | string  |
| nullable             | boolean |
| onDelete             | string  |
| onUpdate             | string  |
| referencedColumnName | string  |
| size                 | number  |
| type                 | string  |
| unique               | boolean |

### Join table options
|    Options         | Type   |
|:-------------------|:------:|
| inverseJoinColumns | array  |
| joinColumns        | array  |
| name               | string |

### Relationship options
|   Options    |       Type        |
|:-------------|:-----------------:|
| inversedBy   | string            |
| mappedBy     | string            |
| targetEntity | string, {new ()}  |
| type         | string            |
