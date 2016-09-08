"use strict";
const EntityManager_1 = require('./EntityManager');
const Store_1 = require('./Store');
const homefront_1 = require('homefront');
class Wetland {
    /**
     * Construct a new wetland instance.
     *
     * @param {{}} config
     */
    constructor(config) {
        /**
         * @type {EntityManager}
         */
        this.manager = new EntityManager_1.EntityManager(this);
        /**
         * @type {Homefront}
         */
        this.config = new homefront_1.Homefront;
        /**
         * @type {{}}
         */
        this.stores = {};
        this.config.merge(config);
        let stores = this.config.fetch('stores');
        let entities = this.config.fetch('entities');
        if (stores) {
            this.registerStores(stores);
        }
        if (entities) {
            this.registerEntities(entities);
        }
    }
    /**
     * Get the wetland config.
     *
     * @returns {Homefront}
     */
    getConfig() {
        return this.config;
    }
    /**
     * Register an entity with the entity manager.
     *
     * @param {EntityInterface} entity
     *
     * @returns {Wetland}
     */
    registerEntity(entity) {
        this.manager.registerEntity(entity);
        return this;
    }
    /**
     * Register multiple entities with the entity manager.
     *
     * @param {EntityInterface[]} entities
     *
     * @returns {Wetland}
     */
    registerEntities(entities) {
        this.manager.registerEntities(entities);
        return this;
    }
    /**
     * Register stores with wetland.
     *
     * @param {Object} stores
     *
     * @returns {Wetland}
     */
    registerStores(stores) {
        for (let store in stores) {
            this.registerStore(store, stores[store]);
        }
        return this;
    }
    /**
     * Register a store with wetland.
     *
     * @param {string} store
     * @param {{}}     config
     *
     * @returns {Wetland}
     */
    registerStore(store, config) {
        this.stores[store] = new Store_1.Store(store, config);
        // The first registered store is the default store.
        this.config.fetchOrPut('defaultStore', store);
        return this;
    }
    /**
     * Get a store by name.
     *
     * @param {string} storeName
     *
     * @returns {Store}
     */
    getStore(storeName) {
        storeName = storeName || this.config.fetch('defaultStore');
        if (!storeName) {
            throw new Error('No store name supplied, and no default store found.');
        }
        let store = this.stores[storeName];
        if (!store) {
            throw new Error(`No store called "${storeName}" found.`);
        }
        return store;
    }
    /**
     * Get a scoped entityManager. Example:
     *
     *  let wet = new Wetland();
     *  wet.getManager();
     *
     * @returns {Scope}
     */
    getManager() {
        return this.manager.createScope();
    }
}
exports.Wetland = Wetland;
