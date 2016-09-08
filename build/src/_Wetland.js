"use strict";
const EntityManager_1 = require('./EntityManager');
const QueryBuilder_1 = require('./QueryBuilder');
const Mapping_1 = require('./Mapping');
const Knex = require('knex');
class Wetland {
    constructor() {
        this.defaultStore = null;
        this.knexInstances = {};
        this.stores = {};
        this.adapters = {};
        this.mapping = Mapping_1.Mapping;
        this.manager = new EntityManager_1.EntityManager(this);
    }
    /**
     * Register a knex instance for given store.
     *
     * @param {string} storeName
     *
     * @returns {Knex}
     */
    registerKnexInstance(storeName) {
        let store = this.stores[storeName];
        if (!store) {
            throw Error(`Can't register knex instance of store unregistered.`);
        }
        let knexConfig = {};
        knexConfig.client = store.adapter;
        knexConfig.connection = store.options;
        return this.knexInstances[storeName] = Knex(knexConfig);
    }
    /**
     * Get get knex instance for given store. Example:
     *
     *  let wet = new Wetland();
     *  wet.registerStores({
     *    umplaumpla: {
     *      // whatever
     *    }
     *  });
     *  wet.getKnexInstance('umpaumpla');
     *
     * @param {string} storeName
     *
     * @returns {Knex}
     */
    getKnexInstance(storeName) {
        let knexInstance = this.knexInstances[storeName];
        if (!knexInstance) {
            knexInstance = this.registerKnexInstance(storeName);
        }
        return knexInstance;
    }
    /**
     * Register multiple stores. Example:
     *
     *  let wet = new Wetland();
     *  wet.registerStores({
     *    umplaumpla: {
     *      adapter: 'mysql',
     *      options: {
     *        username: 'root',
     *        password: '',
     *        database: 'sandbox'
     *      }
     *    }
     *  });
     *
     * @param {Object} stores
     */
    registerStores(stores) {
        this.stores = stores;
    }
    /**
     * Set default store. Example:
     *
     *  let wet = new Wetland();
     *  wet.registerStores({
     *    umplaumpla: {
     *      adapter: 'mysql',
     *      options: {
     *        username: 'root',
     *        password: '',
     *        database: 'sandbox'
     *      }
     *    }
     *  });
     *  wet.setDefaultStore('umpaumpla');
     *
     * @param storeName
     */
    setDefaultStore(storeName) {
        this.defaultStore = storeName;
    }
    /**
     * Get a query builder for specified store. Example:
     *
     *  let wet = new Wetland();
     *  wet.registerStores({
     *    umplaumpla: {
     *      // whatever
     *    }
     *  });
     *  wet.getQueryBuilder('umplaumpla');
     *
     * @param {string} storeName
     *
     * @returns {QueryBuilder}
     */
    getQueryBuilder(storeName) {
        if (!storeName) {
            storeName = this.defaultStore;
        }
        return new QueryBuilder_1.QueryBuilder(this.getManager(), this.getKnexInstance(storeName));
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
