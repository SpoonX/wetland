import { User } from './User';
import { List } from './List';
import { Mapping } from '../../../../src/Mapping';

export class Todo {
  static setMapping(mapping: Mapping<Todo>) {
    mapping.forProperty('id').primary().increments();

    mapping.manyToOne('list', { targetEntity: List, inversedBy: 'todos' });
    mapping.field('task', { type: 'string' });
    mapping.field('done', { type: 'boolean', nullable: true });
    mapping.oneToOne('creator', { targetEntity: User });
  }
}
