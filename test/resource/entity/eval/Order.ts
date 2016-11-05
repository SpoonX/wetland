import {Mapping} from '../../../../src/Mapping';

export class Order {
  public static setMapping(mapping: Mapping<Order>) {
    mapping.forProperty('id').primary().increments();
    mapping.field('name', {type: 'string'});
  }
}
