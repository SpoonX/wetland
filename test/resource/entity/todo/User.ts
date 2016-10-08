import {Mapping} from '../../../../src/Mapping';

export class User {
  public name: string;

  static setMapping(mapping: Mapping<User>) {
    mapping.forProperty('id').primary().increments();
    mapping.field('name', {type: 'string', size: 24});
  }
}
