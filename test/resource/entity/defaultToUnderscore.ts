export class ToUnderscore {
  static setMapping(mapping) {
    mapping.forProperty('id').primary().increments().field({name: 'underscore_id'});
    mapping.field('camelCaseToUnderscore', {type: 'string'});
    mapping.field('PascalToUnderscore', {type: 'integer'});
    mapping.field('already_underscore', {type: 'boolean'});
    mapping.field('customName', {type: 'string', name: 'myCustomName'});
  }
}
