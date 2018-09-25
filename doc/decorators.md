# Decorator

Decorators are a way to decorate your entities so that you don't need to use setMapping ES6 syntax.

Eventually it looks like this :

```js
@entity()
class User {

  @increments()
  @primary()
  id;

  @field({type: 'string'})
  username;

  @field({type: 'string'})
  password;
}
```

## Warnings

Entities only work using typescript or babel, you will need to enable the related flags. At the time of writing babel imposes user to set default value to each properties of the class so that those properties are writable. The entity just presented will look like this :

```js
@entity()
class User {

  @increments()
  @primary()
  id = null;

  @field({type: 'string'})
  username = null;

  @field({type: 'string'})
  password = null;
}
```

## The decorators

### Class decorators

#### @autoFields

Adds auto fields to your entity (id, createdAt, updatedAt).

```js
@autoFields()
class Foo {}
```

#### @autoUpdatedAt

Adds an updatedAt field to your entity.

**Note:** this only sets the initial value, and doesn't maintain the value between updates. Use the beforeUpdate hook for that.

```js
@autoUpdatedAt()
class Foo {}
```

#### @autoCreatedAt

Adds an createdAt field to your entity.

**Note:** this sets the initial value.

```js
@autoCreatedAt()
class Foo {}
```

#### @autoPK

Adds an auto incremented primary key with the name `id` to your entity.

```js
@autoPK()
class Foo {}
```

#### @entity

Declares a class as an entity.

- Default name and repository

```js
@entity()
class Foo {}
 ```

 - Custom name and repository

```js
@entity({repository: MyRepository, name: 'custom'})
class Foo {}
```

#### @index

Create an index on one of the field of the entity.

- Compound

```js
@index('idx_something', ['property1', 'property2'])
class Foo {}
```

- Single

```js
@index('idx_something', ['property'])
@index('idx_something', 'property')
class Foo {}
```

- Generated index name "idx_property"

```js
@index('property')
@index(['property1', 'property2'])
class Foo {}
```

#### @uniqueConstraint

Creates a unique constraint on one of the field of the entity.

 - Compound:

```js
@uniqueConstraint('something_unique', ['property1', 'property2'])
class Foo {}
```

- Single:

```js
@uniqueConstraint('something_unique', ['property'])
@uniqueConstraint('something_unique', 'property')
class Foo {}
```

- Generated uniqueConstraint name:

```js
@uniqueConstraint('property')
@uniqueConstraint(['property1', 'property2'])
class Foo {}
```

### Properties decorators

#### @field

Creates a field of a certain type with specific options.

- Default (property) name

```js
@entity()
class Foo {
  @field({type:'string', length: 255})
  username;
}
```

- Custom name

```js
@entity()
class Foo {
  @field('password_hash', {type: 'string', length: 255})
  password;
}
```

#### @primary

Mark a property as primary.

```js
@entity()
class Foo {
  @primary()
  id;
}
```


#### @generatedValue

Add a generated value directive for the property.

```js
@entity()
class Foo {
  @generatedValue('autoIncrement')
  id;
}
```

#### @increments

Make the property auto increment.

```js
@entity()
class Foo {
  @increments()
  id;
}
```

#### @oneToOne

Creates a one to one relationship with another entity which will be populated using the decorated property. The decorated property will be populated with a ([0, 1]) target entity.

```js
@entity()
class Foo {
  @oneToOne({targetEntity: 'Bar', mappedBy: 'foo'})
  bar;
}
```

#### @oneToMany

Creates a one to many relationship. The decorated property will be populated with many (>= 0) target entities.

```js
@entity()
class Foo {
  @oneToMany({targetEntity: 'Bar', inversedBy: 'foo'})
  bars = [];
}
```

#### @manyToOne

Create a many to one relationship. The decorated property will be populated with a ([0, 1]) target entity.

```js
@entity()
class Foo {
  @manyToOne({targetEntity: 'Bar', mapped: 'foo'})
  bar;
}
```

#### @manyToMany

Create a many to many relationship. The decorated property will be populated with many (>= 0) target entities.

```js
@entity()
class Foo {
  @manyToMany({targetEntity: 'Bar', inversedBy: 'foo'})
  bars = [];
}
```


