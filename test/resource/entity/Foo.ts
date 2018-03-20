export class FooEntity {
  static setMapping(mapping) {
    mapping.field('id', {
      type: 'string',
      primary: true
    })
    mapping.field('camelCase', {type: 'integer'});
    mapping.field('PascalCase', {type: 'integer'});
  }
}
