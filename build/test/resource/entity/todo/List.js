"use strict";
const Todo_1 = require('./Todo');
class List {
    static setMapping(mapping) {
        mapping.forProperty('id').primary().increments();
        mapping.field('name', { type: 'string' });
        mapping.field('done', { type: 'boolean', nullable: true });
        mapping.forProperty('todos')
            .oneToMany({ targetEntity: Todo_1.Todo, mappedBy: 'list' })
            .cascade(['persist', 'remove']);
    }
}
exports.List = List;
