/// <reference types="chai" />
import { EntityInterface, ProxyInterface } from './EntityInterface';
export declare class IdentityMap {
    /**
     * Map entities to objects.
     *
     * @type {WeakMap<Function, Object>}
     */
    private map;
    /**
     * Get the PK map for entity.
     *
     * @param {Function | EntityInterface} entity
     *
     * @returns {Object}
     */
    getMapForEntity(entity: Function | EntityInterface): Object;
    /**
     * Register an entity with the map.
     *
     * @param {EntityInterface} entity
     * @param {ProxyInterface}  proxy
     *
     * @returns {IdentityMap}
     */
    register(entity: EntityInterface, proxy: ProxyInterface): IdentityMap;
    /**
     * Fetch an entity from the map.
     *
     * @param {EntityInterface|Function} entity
     * @param {*}                        primaryKey
     *
     * @returns {EntityInterface|null}
     */
    fetch(entity: EntityInterface | Function, primaryKey: any): EntityInterface | ProxyInterface | null;
}
