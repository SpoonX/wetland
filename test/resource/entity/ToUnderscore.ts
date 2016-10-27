export class ToUnderscore {
  static setMapping(mapping) {
    mapping.forProperty('id').primary().increments().field({name: 'underscore_id'});
    mapping.field('camelCaseToUnderscore', {type: 'string', size: 20});
    mapping.field('PascalToUnderscore', {type: 'integer'});
    mapping.field('already_underscore', {type: 'boolean'});
    mapping.field('customName', {type: 'string', name: 'customColumnName'});
    mapping.field('camelCaseAnd_underscore', {type: 'boolean'});
  }
}
