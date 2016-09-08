import {Mapping} from './Mapping';
import {EntityInterface} from './EntityInterface';

export class EntityHydrator {

  /**
   * Hydrate a database result into an entity.
   *
   * @param {Object} values
   * @param {{new ()}| Function} EntityClass
   *
   * @returns {EntityInterface}
   */
  public static fromSchema(values: Object, EntityClass: EntityInterface | Function | {new ()}): EntityInterface {
    let mapping = Mapping.forEntity(EntityClass);
    let entity  = typeof EntityClass === 'function' ? new (EntityClass as {new ()}) : EntityClass;

    Object.getOwnPropertyNames(values).forEach(column => {
      let property = mapping.getPropertyName(column);

      if (!property) {
        return;
      }

      entity[property] = values[column];
    });

    return entity;
  }
}
