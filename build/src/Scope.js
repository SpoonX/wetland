"use strict";
const UnitOfWork_1 = require('./UnitOfWork');
const Mapping_1 = require('./Mapping');
const Hydrator_1 = require('./Hydrator');
const EntityProxy_1 = require('./EntityProxy');
class Scope {
    /**
     * Construct a new Scope.
     *
     * @param {EntityManager} manager
     * @param {Wetland}       wetland
     */
    constructor(manager, wetland) {
        this.manager = manager;
        this.wetland = wetland;
        this.unitOfWork = new UnitOfWork_1.UnitOfWork(this);
    }
    /**
     * Proxy method the entityManager getRepository method.
     *
     * @param {Entity} entity
     *
     * @returns {EntityRepository}
     */
    getRepository(entity) {
        let entityReference = this.manager.resolveEntityReference(entity);
        let Repository = Mapping_1.Mapping.forEntity(entityReference).getRepository();
        return new Repository(this, entityReference);
    }
    /**
     * Get the wetland config.
     *
     * @returns {Homefront}
     */
    getConfig() {
        return this.manager.getConfig();
    }
    /**
     * Get a reference to a persisted row without actually loading it.
     *
     * @param {Entity} entity
     * @param {*}      primaryKeyValue
     *
     * @returns {EntityInterface}
     */
    getReference(entity, primaryKeyValue) {
        let ReferenceClass = this.resolveEntityReference(entity);
        let reference = new ReferenceClass;
        let primaryKey = Mapping_1.Mapping.forEntity(ReferenceClass).getPrimaryKey();
        reference[primaryKey] = primaryKeyValue;
        // Not super important, but it's a nice-to-have to prevent mutations on the reference as it is stricter.
        this.unitOfWork.registerClean(reference);
        return reference;
    }
    /**
     * Resolve provided value to an entity reference.
     *
     * @param {EntityInterface|string|{}} hint
     *
     * @returns {EntityInterface|null}
     */
    resolveEntityReference(hint) {
        return this.manager.resolveEntityReference(hint);
    }
    /**
     * Refresh provided entities (sync back from DB).
     *
     * @param {...EntityInterface} entity
     *
     * @returns {Promise<any>}
     */
    refresh(...entity) {
        let refreshes = [];
        let hydrator = new Hydrator_1.Hydrator(this);
        entity.forEach(toRefresh => {
            let entityCtor = this.resolveEntityReference(toRefresh);
            let primaryKeyName = Mapping_1.Mapping.forEntity(entityCtor).getPrimaryKey();
            let primaryKey = toRefresh[primaryKeyName];
            let refresh = this.getRepository(entityCtor).getQueryBuilder()
                .where({ [primaryKeyName]: primaryKey })
                .limit(1)
                .getQuery()
                .execute()
                .then(freshData => hydrator.fromSchema(freshData[0], toRefresh));
            refreshes.push(refresh);
        });
        return Promise.all(refreshes);
    }
    /**
     * Get the reference to an entity constructor by name.
     *
     * @param {string} name
     *
     * @returns {Function}
     */
    getEntity(name) {
        return this.manager.getEntity(name);
    }
    /**
     * Get store for provided entity.
     *
     * @param {EntityInterface} entity
     *
     * @returns {Store}
     */
    getStore(entity) {
        return this.wetland.getStore(this.manager.getMapping(entity).getStoreName());
    }
    /**
     * Get the UnitOfWork.
     *
     * @returns {UnitOfWork}
     */
    getUnitOfWork() {
        return this.unitOfWork;
    }
    /**
     * Get all registered entities.
     *
     * @returns {{}}
     */
    getEntities() {
        return this.manager.getEntities();
    }
    /**
     * Attach an entity (proxy it).
     *
     * @param {EntityInterface} entity
     *
     * @returns {EntityInterface&ProxyInterface}
     */
    attach(entity) {
        return EntityProxy_1.EntityProxy.patchEntity(entity, this);
    }
    /**
     * Detach an entity (remove proxy, and clear from unit of work).
     *
     * @param {ProxyInterface} entity
     *
     * @returns {EntityInterface}
     */
    detach(entity) {
        entity.deactivateProxying();
        this.unitOfWork.clear(entity);
        return entity.getTarget();
    }
    /**
     * Mark provided entity as new.
     *
     * @param {{}[]} entities
     *
     * @returns {Scope}
     */
    persist(...entities) {
        entities.forEach(entity => this.unitOfWork.registerNew(entity));
        return this;
    }
    /**
     * Mark an entity as deleted.
     *
     * @param {{}} entity
     *
     * @returns {Scope}
     */
    remove(entity) {
        this.unitOfWork.registerDeleted(entity);
        return this;
    }
    /**
     * This method is responsible for persisting the unit of work.
     * This means calculating changes to make, as well as the order to do so.
     * One of the things involved in this is making the distinction between stores.
     *
     * @return {Promise}
     */
    flush(skipClean = false) {
        return this.unitOfWork.commit(skipClean);
    }
    /**
     * Clear the unit of work.
     *
     * @returns {Scope}
     */
    clear() {
        this.unitOfWork.clear();
        return this;
    }
}
exports.Scope = Scope;
