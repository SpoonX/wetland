import {ArrayCollection} from '../../../../src/ArrayCollection';
import {TransformTag} from './TransformTag';
import {Mapping} from '../../../../src/Mapping';
import {ValueObject} from '../ValueObject';

export class TransformCategory {
  public id: ValueObject;

  public name: ValueObject;

  public tags: ArrayCollection<TransformTag>;

  static setMapping(mapping: Mapping<TransformCategory>) {
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

    mapping.manyToMany('products', {targetEntity: 'TransformProduct', mappedBy: 'categories'});

    mapping.forProperty('tags')
      .cascade(['persist'])
      .manyToMany({targetEntity: 'TransformTag', inversedBy: 'categories'});
  }
}
