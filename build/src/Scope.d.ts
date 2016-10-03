/// <reference types="chai" />
import { UnitOfWork } from './UnitOfWork';
import { EntityManager } from './EntityManager';
import { EntityInterface, ProxyInterface, EntityCtor } from './EntityInterface';
import { EntityRepository } from './EntityRepository';
import { Store } from './Store';
import { Wetland } from './Wetland';
import { Homefront } from 'homefront';
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
     * @param {Entity} entity
     *
     * @returns {EntityRepository}
     */
    getRepository<T>(entity: EntityCtor<T>): EntityRepository<T>;
    /**
     * Get the wetland config.
     *
     * @returns {Homefront}
     */
    getConfig(): Homefront;
    /**
     * Get a reference to a persisted row without actually loading it.
     *
     * @param {Entity} entity
     * @param {*}      primaryKeyValue
     *
     * @returns {EntityInterface}
     */
    getReference(entity: Entity, primaryKeyValue: any): EntityInterface;
    /**
     * Resolve provided value to an entity reference.
     *
     * @param {EntityInterface|string|{}} hint
     *
     * @returns {EntityInterface|null}
     */
    resolveEntityReference(hint: Entity): {
        new ();
    };
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
     * Attach an entity (proxy it).
     *
     * @param {EntityInterface} entity
     *
     * @returns {EntityInterface&ProxyInterface}
     */
    attach(entity: EntityInterface): ProxyInterface;
    /**
     * Detach an entity (remove proxy, and clear from unit of work).
     *
     * @param {ProxyInterface} entity
     *
     * @returns {EntityInterface}
     */
    detach(entity: ProxyInterface): EntityInterface;
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
    flush(skipClean?: boolean): Promise<any>;
    /**
     * Clear the unit of work.
     *
     * @returns {Scope}
     */
    clear(): Scope;
}
export declare type Entity = string | {
    new ();
} | EntityInterface;
