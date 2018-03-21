import {ArrayCollection} from '../../../../src/ArrayCollection';
import {Mapping} from '../../../../src/Mapping';
import {BookNonGeneratedId} from './booknongeneratedid';

export class PublisherNonGeneratedId {
  public id: string;

  public name: string;

  public books: ArrayCollection<BookNonGeneratedId>;

  static setMapping(mapping: Mapping<PublisherNonGeneratedId>) {
    mapping.forProperty('id')
      .field({type: 'string'})
      .primary();

    mapping.field('name', {type: 'string', size: 24});

    mapping.oneToMany('books', {targetEntity: 'BookNonGeneratedId', mappedBy: 'publisher'});
  }
}
