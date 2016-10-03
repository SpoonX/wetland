"use strict";
const Mapping_1 = require('./Mapping');
class IdentityMap {
    constructor() {
        /**
         * Map entities to objects.
         *
         * @type {WeakMap<Function, Object>}
         */
        this.map = new WeakMap;
    }
    /**
     * Get the PK map for entity.
     *
     * @param {Function | EntityInterface} entity
     *
     * @returns {Object}
     */
    getMapForEntity(entity) {
        let entityReference = (typeof entity === 'function' ? entity : entity.constructor);
        let map = this.map.get(entityReference);
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
    register(entity, proxy) {
        this.getMapForEntity(entity)[entity[Mapping_1.Mapping.forEntity(entity).getPrimaryKey()]] = proxy;
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
    fetch(entity, primaryKey) {
        return this.getMapForEntity(entity)[primaryKey] || null;
    }
}
exports.IdentityMap = IdentityMap;
