import { ArrayCollection } from '../../../../src/ArrayCollection';
import { Mapping } from '../../../../src/Mapping';
import { Book } from './book';

export class Publisher {
  public id: number;

  public name: string;

  public books: ArrayCollection<Book>;

  static setMapping(mapping: Mapping<Publisher>) {
    mapping.forProperty('id')
      .field({ type: 'integer' })
      .generatedValue('autoIncrement')
      .primary();

    mapping.field('name', { type: 'string', size: 24 });

    mapping.oneToMany('books', { targetEntity: 'Book', mappedBy: 'publisher' });
  }
}
