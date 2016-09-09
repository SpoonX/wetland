/// <reference types="chai" />
import { Scope } from './Scope';
/**
 * Maintains a list of objects affected by a business transaction and -
 *  coordinates the writing out of changes and the resolution of concurrency problems.
 *
 * @export
 * @class UnitOfWork
 */
export declare class UnitOfWork {
    static STATE_CLEAN: string;
    static STATE_DIRTY: string;
    static STATE_NEW: string;
    static STATE_DELETED: string;
    /**
     * Holds a list of objects that have been marked as being "dirty".
     *
     * @type {ArrayCollection}
     */
    private dirtyObjects;
    /**
     * Holds a list of objects that have been marked as being "new".
     *
     * @type {ArrayCollection}
     */
    private newObjects;
    /**
     * Holds a list of objects that have been marked as being "deleted".
     *
     * @type {ArrayCollection}
     */
    private deletedObjects;
    /**
     * @type {Scope}
     */
    private entityManager;
    /**
     * @type {{}|null}
     */
    private transactions;
    /**
     * Create a new UnitOfWork.
     *
     * @param {Scope} entityManager
     */
    constructor(entityManager: Scope);
    /**
     * Register an object as "new".
     *
     * @param {Object} newObject
     *
     * @returns {UnitOfWork} Fluent interface
     */
    registerNew(newObject: Object): UnitOfWork;
    /**
     * Register an object as "dirty".
     *
     * @param {Object}   dirtyObject
     * @param {String[]} property
     *
     * @returns {UnitOfWork} Fluent interface
     */
    registerDirty(dirtyObject: Object, ...property: Array<string>): UnitOfWork;
    /**
     * Register an object as "deleted".
     *
     * @param {Object} deletedObject
     *
     * @returns {UnitOfWork} Fluent interface
     */
    registerDeleted(deletedObject: Object): UnitOfWork;
    /**
     * Register an object as "clean".
     *
     * @param {Object} cleanObject
     *
     * @returns {UnitOfWork} Fluent interface
     */
    registerClean(cleanObject: Object): UnitOfWork;
    /**
     * Get the state of an object registered with this unit of work.
     * NOTE: Defaults to clean.
     *
     * @param {Object} targetObject
     *
     * @returns {String} The state of the target object.
     */
    getObjectState(targetObject: Object): string;
    /**
     * Commit the current state.
     *
     * @returns {Promise<UnitOfWork>}
     */
    commit(): Promise<any>;
    /**
     * Either commit or rollback current transactions.
     *
     * @param {boolean} commit
     * @returns {Promise}
     */
    private commitOrRollback(commit?);
    /**
     * Mark all dirty entities as cleaned.
     *
     * @returns {UnitOfWork}
     */
    private markDirtyAsCleaned();
    /**
     * Refresh all dirty entities.
     *
     * @returns {Promise<any>}
     */
    private refreshDirty();
    /**
     * Get the transaction for this unit of work, and provided target entity.
     *
     * @param {EntityInterface} target
     *
     * @returns {Promise}
     */
    private getTransaction(target);
    /**
     * Persist provided targets using provided handler.
     *
     * @param {EntityInterface} targets
     * @param {Function}        handler
     *
     * @returns {Promise<any>}
     */
    private persist(targets, handler);
    /**
     * Persist specific target.
     *
     * @param {EntityInterface} target
     * @param {Function}        handler
     *
     * @returns {Promise<any>}
     */
    private persistTarget(target, handler);
    /**
     * Persist new entities.
     *
     * @returns {Promise<any>}
     */
    private insertNew();
    /**
     * Update dirty entities.
     *
     * @returns {Promise<any>}
     */
    private updateDirty();
    /**
     * Delete removed entities from the database.
     *
     * @returns {Promise<any>}
     */
    private deleteDeleted();
    /**
     * Roll back all affected objects.
     *
     * - Revert changes in dirty entities.
     * - Un-persist new entities.
     * - Unstage deleted entities.
     * - Refresh persisted entities.
     *
     * @returns {UnitOfWork}
     */
    clear(): UnitOfWork;
}
