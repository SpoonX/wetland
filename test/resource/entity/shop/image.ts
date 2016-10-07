import {ArrayCollection} from '../../../../src/ArrayCollection';
import {Tag} from './tag';

export class Image {
  public name: string;

  public tags: ArrayCollection<Tag>;

  static setMapping(mapping) {
    mapping.field('id', {type: 'integer'}).primary('id').generatedValue('id', 'autoIncrement');
    mapping.field('name', {type: 'string', size: 24});
    mapping.field('type', {type: 'string', size: 24, nullable: true});
    mapping.field('location', {type: 'string', size: 24, nullable: true});

    mapping
      .manyToOne('author', {targetEntity: 'User', inversedBy: 'products'})
      .joinColumn('author', {name: 'author_id', referencedColumnName: 'id'});

    mapping
      .cascade('tags', ['persist'])
      .manyToMany('tags', {targetEntity: 'Tag', inversedBy: 'images'});
  }
}
