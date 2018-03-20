import {TransformUser} from './TransformUser';
import {Mapping} from '../../../../src/Mapping';
import {ValueObject} from '../ValueObject';

export class TransformTag {
  public id: ValueObject;

  public name: ValueObject;

  public creator: TransformUser;

  static setMapping(mapping: Mapping<TransformTag>) {
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
      transformation: {
        hydrate: (value: string): ValueObject => {
          return ValueObject.fromValue(value)
        },
        dehydrate: (value: ValueObject): string => {
          return value.toValue()
        }
      }
    });

    mapping.manyToMany('images', {targetEntity: 'TransformImage', mappedBy: 'tags'});

    mapping.manyToMany('categories', {targetEntity: 'TransformCategory', mappedBy: 'tags'});

    mapping
      .cascade('creator', ['persist'])
      .manyToOne('creator', {targetEntity: 'TransformUser', inversedBy: 'tags'});
  }
}
