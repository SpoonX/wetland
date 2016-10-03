"use strict";
const Mapping_1 = require('./Mapping');
const QueryBuilder_1 = require('./QueryBuilder');
const Store_1 = require('./Store');
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
        alias = alias || this.mapping.getTableName();
        if (!statement) {
            let connection = this.entityManager.getStore(this.entity).getConnection(Store_1.Store.ROLE_SLAVE);
            statement = connection(`${Mapping_1.Mapping.forEntity(this.entity).getTableName()} as ${alias}`);
        }
        return new QueryBuilder_1.QueryBuilder(this.entityManager, statement, this.mapping, alias);
    }
    /**
     * Find entities based on provided criteria.
     *
     * @param {{}}          criteria
     * @param {FindOptions} [options]
     *
     * @returns {Promise<Array>}
     */
    find(criteria, options = {}) {
        options.alias = options.alias || this.mapping.getTableName();
        let queryBuilder = this.getQueryBuilder(options.alias).select(options.alias);
        if (criteria) {
            queryBuilder.where(criteria);
        }
        if (options.debug) {
            queryBuilder.debug();
        }
        if (options.orderBy) {
            queryBuilder.orderBy(options.orderBy);
        }
        if (options.limit) {
            queryBuilder.limit(options.limit);
        }
        if (options.offset) {
            queryBuilder.offset(options.offset);
        }
        if (options.join && Array.isArray(options.join)) {
            options.join.forEach(join => {
                let column = join;
                let alias = join;
                if (typeof join === 'object') {
                    column = Object.keys(join)[0];
                    alias = join[column];
                }
                else if (join.indexOf('.') > -1) {
                    alias = join.split('.')[1];
                }
                queryBuilder.leftJoin(column, alias).select(alias);
            });
        }
        if (options.join && !Array.isArray(options.join)) {
            Object.getOwnPropertyNames(options.join).forEach(column => {
                queryBuilder.leftJoin(column, options.join[column]).select(options.join[column]);
            });
        }
        return queryBuilder.getQuery().getResult();
    }
    /**
     * Find a single entity.
     *
     * @param {{}|number|string}  criteria
     * @param {FindOptions}       [options]
     *
     * @returns {Promise<Object>}
     */
    findOne(criteria = {}, options = {}) {
        options.alias = options.alias || this.mapping.getTableName();
        if (typeof criteria === 'number' || typeof criteria === 'string') {
            criteria = { [options.alias + '.' + this.mapping.getPrimaryKeyField()]: criteria };
        }
        options.limit = 1;
        return this.find(criteria, options).then(result => result[0]);
    }
}
exports.EntityRepository = EntityRepository;
