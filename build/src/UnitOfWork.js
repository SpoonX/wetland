"use strict";
const ArrayCollection_1 = require('./ArrayCollection');
const Store_1 = require('./Store');
const Mapping_1 = require('./Mapping');
const MetaData_1 = require('./MetaData');
/**
 * Maintains a list of objects affected by a business transaction and -
 *  coordinates the writing out of changes and the resolution of concurrency problems.
 *
 * @export
 * @class UnitOfWork
 */
class UnitOfWork {
    /**
     * Create a new UnitOfWork.
     *
     * @param {Scope} entityManager
     */
    constructor(entityManager) {
        this.entityManager = entityManager;
        this.rollback();
    }
    /**
     * Register an object as "new".
     *
     * @param {Object} newObject
     *
     * @returns {UnitOfWork} Fluent interface
     */
    registerNew(newObject) {
        this.deletedObjects.remove(newObject);
        this.dirtyObjects.remove(newObject);
        this.newObjects.add(newObject);
        return this;
    }
    /**
     * Register an object as "dirty".
     *
     * @param {Object}   dirtyObject
     * @param {String[]} property
     *
     * @returns {UnitOfWork} Fluent interface
     */
    registerDirty(dirtyObject, ...property) {
        this.newObjects.remove(dirtyObject);
        this.deletedObjects.remove(dirtyObject);
        this.dirtyObjects.add(dirtyObject);
        MetaData_1.MetaData.forInstance(dirtyObject).fetchOrPut(`entityState.dirty`, []).push(...property);
        return this;
    }
    /**
     * Register an object as "deleted".
     *
     * @param {Object} deletedObject
     *
     * @returns {UnitOfWork} Fluent interface
     */
    registerDeleted(deletedObject) {
        this.dirtyObjects.remove(deletedObject);
        this.newObjects.remove(deletedObject);
        this.deletedObjects.add(deletedObject);
        return this;
    }
    /**
     * Register an object as "clean".
     *
     * @param {Object} cleanObject
     *
     * @returns {UnitOfWork} Fluent interface
     */
    registerClean(cleanObject) {
        this.dirtyObjects.remove(cleanObject);
        this.deletedObjects.remove(cleanObject);
        this.newObjects.remove(cleanObject);
        return this;
    }
    /**
     * Get the state of an object registered with this unit of work.
     * NOTE: Defaults to clean.
     *
     * @param {Object} targetObject
     *
     * @returns {String} The state of the target object.
     */
    getObjectState(targetObject) {
        if (this.dirtyObjects.includes(targetObject)) {
            return UnitOfWork.STATE_DIRTY;
        }
        if (this.newObjects.includes(targetObject)) {
            return UnitOfWork.STATE_NEW;
        }
        if (this.deletedObjects.includes(targetObject)) {
            return UnitOfWork.STATE_DELETED;
        }
        return UnitOfWork.STATE_CLEAN;
    }
    /**
     * Commit the current state.
     *
     * @returns {Promise<UnitOfWork>}
     */
    commit() {
        return this.insertNew()
            .then(() => this.updateDirty())
            .then(() => this.deleteDeleted())
            .then(() => this.commitOrRollback(true))
            .then(() => this.refreshDirty())
            .then(() => this.rollback())
            .catch(() => this.commitOrRollback(false));
    }
    /**
     * Either commit or rollback current transactions.
     *
     * @param {boolean} commit
     * @returns {Promise}
     */
    commitOrRollback(commit = true) {
        let resolves = [];
        Object.getOwnPropertyNames(this.transactions).forEach(store => {
            resolves.push(this.transactions[store].transaction[commit ? 'commit' : 'rollback']());
        });
        return Promise.all(resolves);
    }
    /**
     * Mark all dirty entities as cleaned.
     *
     * @returns {UnitOfWork}
     */
    markDirtyAsCleaned() {
        if (this.dirtyObjects && this.dirtyObjects.length > 0) {
            this.dirtyObjects.forEach(dirty => {
                MetaData_1.MetaData.forInstance(dirty).put(`entityState.dirty`, []);
            });
        }
        this.dirtyObjects = new ArrayCollection_1.ArrayCollection;
        return this;
    }
    /**
     * Refresh all dirty entities.
     *
     * @returns {Promise<any>}
     */
    refreshDirty() {
        return this.entityManager.refresh(...this.dirtyObjects);
    }
    /**
     * Get the transaction for this unit of work, and provided target entity.
     *
     * @param {EntityInterface} target
     *
     * @returns {Promise}
     */
    getTransaction(target) {
        let store = this.entityManager.getStore(target);
        let storeName = store.getName();
        if (this.transactions[storeName]) {
            return Promise.resolve(this.transactions[storeName]);
        }
        return new Promise(resolve => {
            let connection = store.getConnection(Store_1.Store.ROLE_MASTER);
            connection.transaction(transaction => {
                this.transactions[storeName] = { connection: connection, transaction: transaction };
                resolve(this.transactions[storeName]);
            });
        });
    }
    /**
     * Persist provided targets using provided handler.
     *
     * @param {EntityInterface} targets
     * @param {Function}        handler
     *
     * @returns {Promise<any>}
     */
    persist(targets, handler) {
        let statementHandlers = [];
        targets.forEach(target => statementHandlers.push(this.persistTarget(target, handler)));
        return Promise.all(statementHandlers);
    }
    /**
     * Persist specific target.
     *
     * @param {EntityInterface} target
     * @param {Function}        handler
     *
     * @returns {Promise<any>}
     */
    persistTarget(target, handler) {
        return this.getTransaction(target)
            .then(transaction => {
            let tableName = Mapping_1.Mapping.forEntity(target).getEntityName();
            let queryBuilder = this.entityManager.getRepository(target).getQueryBuilder(null, transaction.connection(tableName));
            queryBuilder.getQuery().getStatement().transacting(transaction);
            return handler(queryBuilder, target);
        });
    }
    /**
     * Persist new entities.
     *
     * @returns {Promise<any>}
     */
    insertNew() {
        return this.persist(this.newObjects, (queryBuilder, target) => {
            let mapping = Mapping_1.Mapping.forEntity(target);
            let primaryKey = mapping.getPrimaryKeyField();
            return queryBuilder.insert(target, primaryKey).getQuery().execute().then(result => target[primaryKey] = result[0]);
        });
    }
    /**
     * Update dirty entities.
     *
     * @returns {Promise<any>}
     */
    updateDirty() {
        return this.persist(this.dirtyObjects, (queryBuilder, target) => {
            let dirtyProperties = MetaData_1.MetaData.forInstance(target).fetch(`entityState.dirty`, []);
            let primaryKey = Mapping_1.Mapping.forEntity(target).getPrimaryKeyField();
            let values = target;
            if (dirtyProperties.length > 0) {
                let newValues = {};
                dirtyProperties.forEach(dirtyProperty => {
                    newValues[dirtyProperty] = values[dirtyProperty];
                });
                values = newValues;
            }
            return queryBuilder.update(values).where({ [primaryKey]: target[primaryKey] }).getQuery().execute();
        });
    }
    /**
     * Delete removed entities from the database.
     *
     * @returns {Promise<any>}
     */
    deleteDeleted() {
        return this.persist(this.deletedObjects, (queryBuilder, target) => {
            let primaryKey = Mapping_1.Mapping.forEntity(target).getPrimaryKeyField();
            return queryBuilder.remove().where({ [primaryKey]: target[primaryKey] }).getQuery().execute();
        });
    }
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
    rollback() {
        this.deletedObjects = new ArrayCollection_1.ArrayCollection;
        this.newObjects = new ArrayCollection_1.ArrayCollection;
        this.transactions = {};
        this.markDirtyAsCleaned();
        return this;
    }
}
UnitOfWork.STATE_CLEAN = 'clean';
UnitOfWork.STATE_DIRTY = 'dirty';
UnitOfWork.STATE_NEW = 'new';
UnitOfWork.STATE_DELETED = 'deleted';
exports.UnitOfWork = UnitOfWork;
