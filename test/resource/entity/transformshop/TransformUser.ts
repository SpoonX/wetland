import {TransformProfile} from './TransformProfile';
import {Mapping} from '../../../../src/Mapping';
import {ValueObject} from '../ValueObject'

export class TransformUser {
  public id: ValueObject
  public name: ValueObject;
  public profile: TransformProfile;

  static setMapping(mapping: Mapping<TransformUser>) {
    mapping.uniqueConstraint('lonely_name', 'name');
    mapping.field('id', {
      type: 'string',
      primary: true,
      transformation: {
        hydrate: (value: string): ValueObject => {
          return ValueObject.fromValue(value)
        },
        dehydrate: (value: ValueObject): string => {
          return value.toValue()
        }
      }
    })
    mapping.field('name', {
      type: 'string',
      size: 24,
      name: 'custom',
      transformation: {
        hydrate: (value: string): ValueObject => {
          return ValueObject.fromValue(value)
        },
        dehydrate: (value: ValueObject): string => {
          return value.toValue()
        }
      }
    });

    mapping
      .oneToMany('products', {targetEntity: 'TransformProduct', mappedBy: 'author'})
      .cascade('products', ['persist']);

    mapping.oneToMany('tags', {targetEntity: 'TransformTag', mappedBy: 'creator'});

    mapping.cascade('profile', ['persist', 'delete']).oneToOne('profile', {targetEntity: 'TransformProfile'});
  }
}
