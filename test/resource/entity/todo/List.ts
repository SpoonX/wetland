import { Todo } from './Todo';

export class List {
  static setMapping(mapping) {
    mapping.forProperty('id').primary().increments();

    mapping.field('name', { type: 'string' });
    mapping.field('done', { type: 'boolean', nullable: true });

    mapping.forProperty('todos')
      .oneToMany({ targetEntity: Todo, mappedBy: 'list' })
      .cascade([ 'persist', 'remove' ]);
  }
}
