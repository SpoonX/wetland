"use strict";
class Todo {
    static setMapping(mapping) {
        mapping.forProperty('id').primary().increments();
        mapping.manyToOne('list_id', { targetEntity: 'List', mappedBy: 'todos' });
        mapping.field('task', { type: 'string' });
        mapping.field('done', { type: 'boolean', nullable: true });
    }
}
exports.Todo = Todo;
