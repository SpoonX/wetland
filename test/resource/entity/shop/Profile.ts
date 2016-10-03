export class Profile {
  public slogan: string;

  static setMapping(mapping) {
    mapping.field('id', {type: 'integer'}).id('id').generatedValue('id', 'autoIncrement');
    mapping.field('slogan', {type: 'string', size: 24});
  }
}
