/// <reference types="chai" />
/// <reference types="knex" />
import { UnitOfWork } from './UnitOfWork';
import { EntityManager } from './EntityManager';
import { EntityInterface } from './EntityInterface';
import { EntityRepository } from './EntityRepository';
import { Query } from './Query';
import { Store } from './Store';
import { Wetland } from './Wetland';
import * as knex from 'knex';
export declare class Scope {
    /**
     * @type {UnitOfWork}
     */
    private unitOfWork;
    /**
     * @type {EntityManager}
     */
    private manager;
    /**
     * @type {Wetland}
     */
    private wetland;
    /**
     * Construct a new Scope.
     *
     * @param {EntityManager} manager
     * @param {Wetland}       wetland
     */
    constructor(manager: EntityManager, wetland: Wetland);
    /**
     * Proxy method the entityManager getRepository method.
     *
     * @param {string|Function|Object} entity
     *
     * @returns {EntityRepository}
     */
    getRepository(entity: string | Function | Object): EntityRepository;
    /**
     * Refresh provided entities (sync back from DB).
     *
     * @param {...EntityInterface} entity
     *
     * @returns {Promise<any>}
     */
    refresh(...entity: Array<EntityInterface>): Promise<any>;
    /**
     * Get the reference to an entity constructor by name.
     *
     * @param {string} name
     *
     * @returns {Function}
     */
    getEntity(name: string): Function;
    /**
     * Create a new Query.
     *
     * @param {{}}                entity
     * @param {string}            alias
     * @param {knex.QueryBuilder} statement
     * @param {string}            [role]
     *
     * @returns {Query}
     */
    createQuery(entity: Object, alias: string, statement: knex.QueryBuilder, role?: string): Query;
    /**
     * Get store for provided entity.
     *
     * @param {EntityInterface} entity
     *
     * @returns {Store}
     */
    getStore(entity: EntityInterface): Store;
    /**
     * Get the UnitOfWork.
     *
     * @returns {UnitOfWork}
     */
    getUnitOfWork(): UnitOfWork;
    /**
     * Mark provided entity as new.
     *
     * @param {{}[]} entities
     *
     * @returns {Scope}
     */
    persist(...entities: Array<Object>): Scope;
    /**
     * Mark an entity as deleted.
     *
     * @param {{}} entity
     *
     * @returns {Scope}
     */
    remove(entity: Object): Scope;
    /**
     * This method is responsible for persisting the unit of work.
     * This means calculating changes to make, as well as the order to do so.
     * One of the things involved in this is making the distinction between stores.
     *
     * @return {Promise}
     */
    flush(): Promise<any>;
    /**
     * Clear the unit of work.
     *
     * @returns {Scope}
     */
    clear(): Scope;
}
