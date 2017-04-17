export class Media {
  static setMapping(mapping) {
    // Pk
    mapping.forProperty('id').increments().primary();

    // Fields
    mapping.forProperty('url').field({type: 'string'});

    // Relations
    mapping.forProperty('offer')
      .manyToOne({targetEntity: 'Offer', inversedBy: 'pictures'});
  }
}
