/// <reference types="chai" />
import { Store, PoolConfig, ReplicationConfig, SingleConfig } from './Store';
import { Homefront } from 'homefront';
import { Scope } from './Scope';
import { EntityInterface } from './EntityInterface';
export declare class Wetland {
    /**
     * @type {EntityManager}
     */
    private manager;
    /**
     * @type {Homefront}
     */
    private config;
    /**
     * @type {{}}
     */
    private stores;
    /**
     * Construct a new wetland instance.
     *
     * @param {{}} config
     */
    constructor(config: Object);
    /**
     * Get the wetland config.
     *
     * @returns {Homefront}
     */
    getConfig(): Homefront;
    /**
     * Register an entity with the entity manager.
     *
     * @param {EntityInterface} entity
     *
     * @returns {Wetland}
     */
    registerEntity(entity: EntityInterface): Wetland;
    /**
     * Register multiple entities with the entity manager.
     *
     * @param {EntityInterface[]} entities
     *
     * @returns {Wetland}
     */
    registerEntities(entities: Array<Function>): Wetland;
    /**
     * Register stores with wetland.
     *
     * @param {Object} stores
     *
     * @returns {Wetland}
     */
    registerStores(stores: Object): Wetland;
    /**
     * Register a store with wetland.
     *
     * @param {string} store
     * @param {{}}     config
     *
     * @returns {Wetland}
     */
    registerStore(store: string, config: PoolConfig | ReplicationConfig | SingleConfig): Wetland;
    /**
     * Get a store by name.
     *
     * @param {string} storeName
     *
     * @returns {Store}
     */
    getStore(storeName?: string): Store;
    /**
     * Get a scoped entityManager. Example:
     *
     *  let wet = new Wetland();
     *  wet.getManager();
     *
     * @returns {Scope}
     */
    getManager(): Scope;
}
