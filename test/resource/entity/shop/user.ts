import { Profile } from './Profile';
import { Mapping } from '../../../../src/Mapping';

export class User {
  public name: string;

  public profile: Profile;

  static setMapping(mapping: Mapping<User>) {
    mapping.uniqueConstraint('lonely_name', 'name');

    mapping.forProperty('id').primary().generatedValue('autoIncrement');

    mapping.field('name', { type: 'string', size: 24, name: 'custom' });

    mapping
      .oneToMany('products', { targetEntity: 'Product', mappedBy: 'author' })
      .cascade('products', [ 'persist' ]);

    mapping.oneToMany('tags', { targetEntity: 'Tag', mappedBy: 'creator' });

    mapping.cascade('profile', [ 'persist', 'delete' ]).oneToOne('profile', { targetEntity: 'Profile' });
  }
}
