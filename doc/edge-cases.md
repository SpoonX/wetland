# Edge cases
When straying away from best-practises you might find yourself struggling to understand what's happening.
This document is an attempt to help you catch these edge-cases.

## Store and database changes

Wetland can be a bit picky if you don't know its inner-working.
One error you can rapidly encounter is this one :

```bash
ER_BAD_TABLE_ERROR: Unknown table 'my_database.table-name'
```

The source of this error is most probably a change in your store settings (e.g: changing database adapter, changing database name...) or database (e.g: recreating your database).
Technically what's happening is that wetland doesn't know that it needs to update the database schema because the way migrations work is by looking at your [snapshots](https://wetland.spoonx.org/snapshots.html) in your `.data` directory, and the last snapshot wetland knows about was before your change.

Solution is simple type clear your `.data` directory : `rm -r .data`.

## Dev migrations
Wetland migrations are pretty powerful, but have some minor limitations.

Dev migrations can't always do what should be done. This includes renaming columns and changing column definitions.

When you change the definition of a column, it gets dropped and created again.
When you change the name of a column, it gets dropped and created again.
When you change the name of a table, any relationships, unique constraints and indexes it has get dropped and recreated.

## .toObject() and references
> **Best-practise:**
> When manipulating the contents returned for JSON stringified entities, always place the toJSON
> method on the target entity. __Never__ manipulate the properties of relations, unless absolutely needed.

For performance reasons, when calling `Entity.toObject()` (for example from within a `.toJSON()` call),
wetland **does not** clone relations.
This means that any changes made to relations on the result of `Entity.toObject()` will be **by reference**.

The reason for this behaviour is that cloning objects requires memory and CPU, and you almost never need it.
For that reason, it's probably best to stick with the best practise.
If you do need to stray from these guidelines, you can use the following work-around.

{% method %}
### Work-around
To work around this issue, you can call `Entity.toObject()` on the relation you wish to manipulate.
If the relation has its own toJSON(), you can call that instead.

{% sample lang="js" %}
```js
const Entity = require('wetland').Entity;

module.exports = class Post extends Entity {
  toJSON() {
    let object  = this.toObject();
    object.user = Entity.toObject(object.user);
    // Or object.user.toJSON() if that exists.
    
    object.user.username += ' (original author)';
    
    return object;
  }
};
```

{% sample lang="ts" %}
```js
import {Entity} from 'wetland';

export class Post extends Entity {
  toJSON() {
    let object  = this.toObject();
    object.user = Entity.toObject(object.user);
    // Or object.user.toJSON() if that exists.
    
    object.user.username += ' (original author)';
    
    return object;
  }
}
```
{% endmethod %}
