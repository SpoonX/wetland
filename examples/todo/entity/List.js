let Todo = require('./Todo');

class List {
  static setMapping(mapping) {
    mapping.forProperty('id').primary().increments();
    mapping.field('name', {type: 'string', size: 24});
    mapping.forProperty('todos')
      .oneToMany({targetEntity: Todo, mappedBy: 'list'})
      .cascade(['persist']);
  }
}

module.exports = List;
