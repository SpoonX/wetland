import { Mapping } from '../../../../src/Mapping';
import { ArrayCollection } from '../../../../src/ArrayCollection';
import { Tracker } from './Tracker';

export class User {
  public id: number;

  public name: string;

  public trackers: ArrayCollection<Tracker> = new ArrayCollection();

  public static setMapping(mapping: Mapping<User>) {
    mapping.forProperty('id').primary().increments();
    mapping.field('name', { type: 'string' });
    mapping.forProperty('trackers').cascade([ 'persist' ]).manyToMany({ targetEntity: Tracker, mappedBy: 'observers' });
  }
}
