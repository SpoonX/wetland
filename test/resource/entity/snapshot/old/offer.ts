export class Offer {
  static setMapping(mapping) {
    // Pk
    mapping.forProperty('id').increments().primary();

    // Fields
    mapping.forProperty('name').field({ type: 'string' });

    // Relations
    mapping.forProperty('pictures')
      .oneToMany({ targetEntity: 'Picture', mappedBy: 'offer' });
  }
}
