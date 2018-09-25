import { Mapping } from '../../../../src/Mapping';
import { Address } from './Address';
import { Order } from './Order';

export class Delivery {
  public static setMapping(mapping: Mapping<Delivery>) {
    mapping.forProperty('id').primary().increments();

    mapping.forProperty('created').field({ type: 'timestamp', defaultTo: mapping.now() });

    mapping.manyToOne('address', { targetEntity: Address, inversedBy: 'deliveries' });

    mapping.forProperty('order')
      .joinColumn({ onDelete: 'cascade' })
      .oneToOne({ targetEntity: Order });
  }
}
