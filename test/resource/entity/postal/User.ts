import {Mapping} from '../../../../src/Mapping';
import {Tracker} from './Tracker';

export class User {
  public static setMapping(mapping: Mapping<User>) {
    mapping.forProperty('id').primary().increments();
    mapping.forProperty('trackers').manyToMany({targetEntity: Tracker, mappedBy: 'observers'});
  }
}
