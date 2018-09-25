import { Mapping } from './Mapping';
import { EntityInterface, ProxyInterface } from './EntityInterface';

export class IdentityMap {
  /**
   * Map entities to objects.
   *
   * @type {WeakMap<Function, Object>}
   */
  private map: WeakMap<Function, Object> = new WeakMap;

  /**
   * Get the PK map for entity.
   *
   * @param {Function | EntityInterface} entity
   *
   * @returns {Object}
   */
  public getMapForEntity(entity: Function | EntityInterface): Object {
    let entityReference = (typeof entity === 'function' ? entity : entity.constructor) as Function;
    let map             = this.map.get(entityReference);

    if (!map) {
      this.map.set(entityReference, {});
    }

    return this.map.get(entityReference);
  }

  /**
   * Register an entity with the map.
   *
   * @param {EntityInterface} entity
   * @param {ProxyInterface}  proxy
   *
   * @returns {IdentityMap}
   */
  public register(entity: EntityInterface, proxy: ProxyInterface): IdentityMap {
    this.getMapForEntity(entity)[entity[Mapping.forEntity(entity).getPrimaryKey()]] = proxy;

    return this;
  }

  /**
   * Fetch an entity from the map.
   *
   * @param {EntityInterface|Function} entity
   * @param {*}                        primaryKey
   *
   * @returns {EntityInterface|null}
   */
  public fetch(entity: EntityInterface | Function, primaryKey: any): EntityInterface | ProxyInterface | null {
    return this.getMapForEntity(entity)[primaryKey] || null;
  }
}
