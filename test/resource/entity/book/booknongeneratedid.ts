import {ArrayCollection} from '../../../../src/ArrayCollection';
import {Mapping} from '../../../../src/Mapping';
import {PublisherNonGeneratedId} from './PublisherNonGeneratedId';

export class BookNonGeneratedId {

  public id: string;

  public publisher: ArrayCollection<PublisherNonGeneratedId>;

  public name: string;

  static setMapping(mapping: Mapping<BookNonGeneratedId>) {
    mapping.forProperty('id').field({type: 'string'}).primary();
    mapping.field('name', {type: 'string', size: 24});

    mapping
      .manyToOne('publisher', {targetEntity: 'PublisherNonGeneratedId', inversedBy: 'books'})
      .joinColumn('publisher', {nullable: false});

  }
}
