import {Mapping} from '../../../../src/Mapping';
import {ArrayCollection} from '../../../../src/ArrayCollection';
import {User} from './User';

export class Tracker {
  public id: number;

  public status: number;

  public observers: ArrayCollection<User> = new ArrayCollection();

  public static setMapping(mapping: Mapping<Tracker>) {
    mapping.forProperty('id').primary().increments();
    mapping.field('status', {type: 'integer'});
    mapping.forProperty('observers').cascade(['persist']).manyToMany({targetEntity: User, inversedBy: 'trackers'});
  }
}
