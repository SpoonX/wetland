export class NoAutoIncrement {
  public name: string;

  public dateOfBirth: Date;

  public static setMapping(mapping) {
    mapping.field('id', {type: 'integer'}).primary('id');
    mapping.field('foo', {type: 'string'})
  }
}
