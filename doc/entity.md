# Entity

An entity is the way you describe objects you want to work with in wetland, wetland will create the sql schema for you.

## Entity example :

Here's a user with an id in autoincrement mode, a username and a password.

```js
const {Entity} = require('wetland');

class User extends Entity {
  constructor() {
    super(...arguments);

    // Default values for username and password
    this.username = null;
    this.password = null;
  }

  static setMapping(mapping) {
    // Primary key
    mapping.forProperty('id').increments().primary();

    // Fields
    mapping.field('username', {type: 'string'});
    mapping.field('password', {type: 'string'});
  }
}
```

## Lifecycle callbacks

You may want to do some stuff after or before a CREATE, UPDATE OR DELETE action on an entity, this is the way to do it.

```js
class AnyEntity extends Entity {
  
  beforeCreate(entityManager) {
    // Will be executed before creation of the entity in the database.
  }
  
  afterCreate (entityManager) {
    // Will be executed after creation of the entity in the database.
  }
  
  beforeUpdate (newValues, entityManager) {
    // Will be executed before update of the entity.
  }

  afterUpdate(entityManager) {
    // Will be executed after update of the entity
  }

  beforeRemove (entityManager) {
    // Will be executed before removal of the entity
  }

  afterRemove?(entityManager) {
    // Will be executed after removal of the entity
  }
}
```

### An example with validation and encryption

In this example we create a validation schema with [Joi](https://github.com/hapijs/joi) and apply it before any CREATE action.
If given data is validated the given password encrypted using (bcrypt)[https://en.wikipedia.org/wiki/Bcrypt].

```js
const bcrypt   = require('bcrypt');
const Joi      = require('joi');
const {Entity} = require('wetland');

const validationSchema = Joi.object().keys({
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(8).max(100).required()
});

module.exports = class User extends Entity {

  constructor() {
    super(...arguments);

    // Default values for username and password
    this.username = null;
    this.password = null;
  }

  static setMapping(mapping) {
    // Primary key
    mapping.forProperty('id').increments().primary();

    // Fields
    mapping.field('username', {type: 'string'});
    mapping.field('password', {type: 'string'});
  }

  beforeCreate() {
    return Joi.validate(this, validationSchema, (error) => {

      if (error) {
        return Promise.reject(error); // Rejecting causes the entity not to be created.
      }

      return bcrypt.hash(this.password, 15)
        .then(hash => {
          this.password = hash; // Only the hash is stored that way, this is the way you want to do it.
        });
    });
  }

};

```


