import {ArrayCollection} from '../../../../src/ArrayCollection';
import {TransformCategory} from './TransformCategory';
import {TransformUser} from './TransformUser';
import {TransformImage} from './TransformImage';
import {ValueObject} from '../ValueObject';

export class TransformProduct {
  public categories: ArrayCollection<TransformCategory>;
  public id: ValueObject
  public name: ValueObject;

  public image: TransformImage;

  public author: TransformUser;

  static setMapping(mapping) {
    mapping.entity({charset: 'utf8mb4', collate: 'utf8mb4_bin'});

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

    mapping
      .cascade('image', ['persist'])
      .oneToOne('image', {targetEntity: 'TransformImage'})
      .joinColumn('image', {name: 'image_id', referencedColumnName: 'id'});

    mapping
      .manyToOne('author', {targetEntity: TransformUser, inversedBy: 'products'})
      .joinColumn('author', {name: 'author_id', referencedColumnName: 'id'});

    mapping
      .cascade('categories', ['persist'])
      .manyToMany('categories', {targetEntity: TransformCategory, inversedBy: 'products'})
      .joinTable('categories', {
        name              : 'product_custom_join_category',
        joinColumns       : [{referencedColumnName: 'id', name: 'product_id'}],
        inverseJoinColumns: [{referencedColumnName: 'id', name: 'category_id'}]
      });
  }
}
