import { Mapping } from '../../../../src/Mapping';
import { User } from './User';

export class Tracker {
  public static setMapping(mapping: Mapping<Tracker>) {
    mapping.forProperty('id').primary().increments();
    mapping.field('status', { type: 'integer' });
    mapping.forProperty('observers').manyToMany({ targetEntity: User, inversedBy: 'trackers' });
  }
}
