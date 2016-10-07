import {ArrayCollection} from '../../../../src/ArrayCollection';
import {Tag} from './tag';
import {Mapping} from '../../../../src/Mapping';

export class Category {
  public id: number;

  public name: string;

  public tags: ArrayCollection<Tag>;

  static setMapping(mapping: Mapping<Category>) {
    mapping.forProperty('id')
      .field({type: 'integer'})
      .generatedValue('autoIncrement')
      .primary();

    mapping.field('name', {type: 'string', size: 24});

    mapping.manyToMany('products', {targetEntity: 'Product', mappedBy: 'categories'});

    mapping.forProperty('tags')
      .cascade(['persist'])
      .manyToMany({targetEntity: 'Tag', inversedBy: 'categories'});
  }
}
