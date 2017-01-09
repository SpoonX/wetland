# Edge cases
When straying away from best-practises you might find yourself struggling to understand what's happening.
This document is an attempt to help you catch these edge-cases.

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
