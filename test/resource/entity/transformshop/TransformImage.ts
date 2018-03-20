import {ArrayCollection} from '../../../../src/ArrayCollection';
import {TransformTag} from './TransformTag';
import {ValueObject} from '../ValueObject';

export class TransformImage {
  public id: ValueObject
  public name: ValueObject;

  public tags: ArrayCollection<TransformTag>;

  static setMapping(mapping) {
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

    mapping.field('type', {
      type: 'string',
      size: 24,
      nullable: true,
      transformation: {
        hydrate: (value: string): ValueObject => {
          if (!value) return null
          return ValueObject.fromValue(value)
        },
        dehydrate: (value: ValueObject): string => {
          if (!value) return null
          return value.toValue()
        }
      }
    });

    mapping.field('location', {
      type: 'string',
      size: 24,
      nullable: true,
      transformation: {
        hydrate: (value: string): ValueObject => {
          if (!value) return null
          return ValueObject.fromValue(value)
        },
        dehydrate: (value: ValueObject): string => {
          if (!value) return null
          return value.toValue()
        }
      }
    });

    mapping
      .manyToOne('author', {targetEntity: 'TransformUser', inversedBy: 'products'})
      .joinColumn('author', {name: 'author_id', referencedColumnName: 'id'});

    mapping
      .cascade('tags', ['persist'])
      .manyToMany('tags', {targetEntity: 'TransformTag', inversedBy: 'images'});
  }
}
