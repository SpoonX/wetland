import { Mapping } from '../../../../src/Mapping';
import { Delivery } from './Delivery';

export class Address {
  public static setMapping(mapping: Mapping<Address>) {
    mapping.forProperty('id').primary().increments();

    mapping.field('street', { type: 'string' });
    mapping.field('houseNumber', { type: 'integer', name: 'house_number' });
    mapping.field('postcode', { type: 'string' });
    mapping.field('country', { type: 'string' });

    mapping.oneToMany('deliveries', { targetEntity: Delivery, mappedBy: 'address' });
  }
}
