"use strict";
const UnitOfWork_1 = require('./UnitOfWork');
const Mapping_1 = require('./Mapping');
const Query_1 = require('./Query');
const Store_1 = require('./Store');
const EntityHydrator_1 = require('./EntityHydrator');
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
     * @param {string|Function|Object} entity
     *
     * @returns {EntityRepository}
     */
    getRepository(entity) {
        let entityReference = this.manager.resolveEntityReference(entity);
        let entityMapping = Mapping_1.Mapping.forEntity(entityReference).mapping;
        let Repository = entityMapping.fetch('entity.repository');
        return new Repository(this, entityReference);
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
        entity.forEach(toRefresh => {
            let primaryKeyName = Mapping_1.Mapping.forEntity(toRefresh).getPrimaryKey();
            let primaryKey = toRefresh[primaryKeyName];
            let refresh = this.getRepository(toRefresh).getQueryBuilder()
                .where({ [primaryKeyName]: primaryKey })
                .limit(1)
                .getQuery()
                .execute()
                .then(freshData => {
                EntityHydrator_1.EntityHydrator.fromSchema(freshData[0], toRefresh);
            });
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
     * Create a new Query.
     *
     * @param {{}}                entity
     * @param {string}            alias
     * @param {knex.QueryBuilder} statement
     * @param {string}            [role]
     *
     * @returns {Query}
     */
    createQuery(entity, alias, statement, role) {
        if (!statement) {
            let connection = this.getStore(entity).getConnection(role || Store_1.Store.ROLE_SLAVE);
            statement = connection(`${Mapping_1.Mapping.forEntity(entity).getEntityName()} as ${alias}`);
        }
        return new Query_1.Query(statement, this);
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
    flush() {
        return this.unitOfWork.commit();
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
