import {ArrayCollection} from '../../../../src/ArrayCollection';
import {Mapping} from '../../../../src/Mapping';
import {Publisher} from './publisher';

export class Book {

  public id: Number;

  public publisher: ArrayCollection<Publisher>;

  public name: string;

  static setMapping(mapping: Mapping<Book>) {
    mapping.field('id', {type: 'integer'}).primary('id').generatedValue('id', 'autoIncrement');
    mapping.field('name', {type: 'string', size: 24});

    mapping
      .manyToOne('publisher', {targetEntity: 'Publisher', inversedBy: 'books'})
      .joinColumn('publisher', {nullable: false});

  }
}
