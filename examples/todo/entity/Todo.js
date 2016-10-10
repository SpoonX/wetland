let List = require('./List');

class Todo {
  static setMapping(mapping) {
    mapping.forProperty('id').primary().increments();
    mapping.field('task', {type: 'string'});
    mapping.field('done', {type: 'boolean', defaultTo: false});
    mapping.forProperty('list')
      .manyToOne({targetEntity: 'List', inversedBy: 'todos'})
      .joinColumn({onDelete: 'cascade'});
  }
}

module.exports = Todo;
