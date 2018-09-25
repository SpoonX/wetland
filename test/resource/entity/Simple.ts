export class Simple {
  public name: string;

  public dateOfBirth: Date;

  public static setMapping(mapping) {
    mapping.field('dateOfBirth', { type: 'datetime' });
  }
}
