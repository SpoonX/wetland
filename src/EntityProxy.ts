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
        unitOfWork.registerDirty(target, property);

        target[property] = value;
      }
    });
  }
}
