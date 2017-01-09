import {Mapping} from './Mapping';

export class Entity {
  public static toObject(source: {toJSON?: Function} & Object): Object {
    if (Array.isArray(source)) {
      return source.map(target => Entity.toObject(target));
    }

    let mapping = Mapping.forEntity(source);

    if (!mapping) {
      return source;
    }

    let object = mapping.getFieldNames().reduce((asObject, fieldName) => {
      asObject[fieldName] = source[fieldName];

      return asObject;
    }, {}) as Object;

    Reflect.ownKeys(mapping.getRelations()).forEach(fieldName => {
      if (typeof source[fieldName] !== 'undefined') {
        object[fieldName] = source[fieldName];
      }
    });

    return object;
  }

  public toObject(): Object {
    return Entity.toObject(this);
  }
}
