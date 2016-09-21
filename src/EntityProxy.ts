import {UnitOfWork} from './UnitOfWork';
import {EntityInterface} from './EntityInterface';

export class EntityProxy {
  /**
   * Patch provided entity with a proxy to track changes.
   *
   * @param {EntityInterface} entity
   * @param {UnitOfWork}      unitOfWork
   *
   * @returns {Object}
   */
  public static patch(entity: EntityInterface, unitOfWork: UnitOfWork): Object {
    return new Proxy<Object>(entity, <Object> {
      set: (target: Object, property: string, value: any) => {

        // Allow for skipping dirty check.
        if (typeof value === 'object' && '_skipDirty' in value) {
          return target[property] = value._skipDirty;
        }

        unitOfWork.registerDirty(target, property);

        return target[property] = value;
      }
    });
  }
}
