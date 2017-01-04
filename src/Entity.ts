import {Mapping} from './Mapping';

export class Entity {
  private mapping: Mapping<this>;

  private fieldNames: Array<string>;

  constructor() {
    this.mapping = Mapping.forEntity(this);
  }

  getFieldNames(): Array<string> {
    if (!this.fieldNames) {
      this.fieldNames = this.mapping.getFieldNames();
    }

    return this.fieldNames;
  }

  public static toObject(source: Object, mapping?: Mapping<{new ()}>, fieldNames?): Object {
    return (fieldNames || mapping.getFieldNames()).reduce((asObject, fieldName) => {
      asObject[fieldName] = source[fieldName];

      return asObject;
    }, {});
  }

  public toObject(): Object {
    return Entity.toObject(this, null, this.getFieldNames());
  }
}
