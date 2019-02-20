import { Mapping } from './Mapping';

export class Entity {
  public static toObject<T>(source: T): Partial<T> | Partial<T>[] {
    if (Array.isArray(source)) {
      return source.map(target => Entity.toObject(target)) as Partial<T>[];
    }

    const mapping = Mapping.forEntity(source);

    if (!mapping) {
      return source;
    }

    const object = mapping.getFieldNames().reduce((asObject, fieldName) => {
      asObject[fieldName] = source[fieldName];

      return asObject;
    }, {});

    const relations = mapping.getRelations();

    if (relations) {
      Reflect.ownKeys(relations).forEach(fieldName => {
        if (typeof source[fieldName] !== 'undefined') {
          object[fieldName] = source[fieldName];
        }
      });
    }

    return object;
  }

  public toObject(): Partial<this> {
    return Entity.toObject(this) as Partial<this>;
  }
}
