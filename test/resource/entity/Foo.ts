export class FooEntity {
  static setMapping(mapping) {
    mapping.field('camelCase', { type: 'integer' });
    mapping.field('PascalCase', { type: 'integer' });
  }
}
