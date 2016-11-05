import {ArrayCollection} from '../../../../src/ArrayCollection';
import {Category} from './category';
import {User} from './user';
import {Image} from './image';

export class Product {
  public categories: ArrayCollection<Category>;

  public name: string;

  public image: Image;

  public author: User;

  static setMapping(mapping) {
    mapping.field('id', {type: 'integer'}).primary('id').generatedValue('id', 'autoIncrement');
    mapping.field('name', {type: 'string', size: 24});

    mapping
      .cascade('image', ['persist'])
      .oneToOne('image', {targetEntity: 'Image'})
      .joinColumn('image', {name: 'image_id', referencedColumnName: 'id'});

    mapping
      .manyToOne('author', {targetEntity: User, inversedBy: 'products'})
      .joinColumn('author', {name: 'author_id', referencedColumnName: 'id'});

    mapping
      .cascade('categories', ['persist'])
      .manyToMany('categories', {targetEntity: Category, inversedBy: 'products'})
      .joinTable('categories', {
        name              : 'product_custom_join_category',
        joinColumns       : [{referencedColumnName: 'id', name: 'product_id'}],
        inverseJoinColumns: [{referencedColumnName: 'id', name: 'category_id'}]
      });
  }
}
