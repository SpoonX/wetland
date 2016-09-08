"use strict";
const Mapping_1 = require('./Mapping');
const QueryBuilder_1 = require('./QueryBuilder');
class EntityRepository {
    /**
     * Construct a new EntityRepository.
     *
     * @param {Scope} entityManager
     * @param {{}}    entity
     */
    constructor(entityManager, entity) {
        this.entityManager = entityManager;
        this.entity = entity;
        this.mapping = Mapping_1.Mapping.forEntity(entity);
    }
    /**
     * Get a new query builder.
     *
     * @param {string}            [alias]
     * @param {knex.QueryBuilder} [statement]
     *
     * @returns {QueryBuilder}
     */
    getQueryBuilder(alias, statement) {
        alias = alias || this.mapping.getEntityName();
        let query = this.entityManager.createQuery(this.entity, alias, statement);
        return new QueryBuilder_1.QueryBuilder(this.entityManager, query, this.mapping, alias);
    }
    /**
     * Find entities based on provided criteria.
     *
     * @param criteria  {{}}
     * @param {*}       [orderBy]
     * @param {number}  [limit]
     * @param {number}  [offset]
     *
     * @returns {Promise<Array>}
     */
    find(criteria = {}, orderBy, limit, offset) {
        let queryBuilder = this.getQueryBuilder().where(criteria);
        if (orderBy) {
            queryBuilder.orderBy(orderBy);
        }
        if (limit) {
            queryBuilder.limit(limit);
        }
        if (offset) {
            queryBuilder.offset(offset);
        }
        return queryBuilder.getQuery().getResult();
    }
    /**
     * Find a single entity.
     *
     * @param {{}|number|string}  criteria
     * @param {number}            [orderBy]
     * @param {number}            [offset]
     *
     * @returns {Promise<Object>}
     */
    findOne(criteria = {}, orderBy, offset) {
        if (typeof criteria === 'number' || typeof criteria === 'string') {
            criteria = { [this.mapping.getPrimaryKeyField()]: criteria };
        }
        return this.find(criteria, orderBy, 1, offset).then(result => result[0]);
    }
}
exports.EntityRepository = EntityRepository;
