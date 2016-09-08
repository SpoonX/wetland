/// <reference types="chai" />
/// <reference types="knex" />
import { QueryBuilder } from './QueryBuilder';
import * as knex from 'knex';
import { Scope } from './Scope';
export declare class EntityRepository {
    /**
     * @type {Scope}
     */
    private entityManager;
    /**
     * @type {{}}
     */
    private entity;
    /**
     * @type {Mapping}
     */
    private mapping;
    /**
     * Construct a new EntityRepository.
     *
     * @param {Scope} entityManager
     * @param {{}}    entity
     */
    constructor(entityManager: Scope, entity: Object);
    /**
     * Get a new query builder.
     *
     * @param {string}            [alias]
     * @param {knex.QueryBuilder} [statement]
     *
     * @returns {QueryBuilder}
     */
    getQueryBuilder(alias?: string, statement?: knex.QueryBuilder): QueryBuilder;
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
    find(criteria?: {}, orderBy?: any, limit?: number, offset?: number): Promise<Array<Object>>;
    /**
     * Find a single entity.
     *
     * @param {{}|number|string}  criteria
     * @param {number}            [orderBy]
     * @param {number}            [offset]
     *
     * @returns {Promise<Object>}
     */
    findOne(criteria?: {} | number | string, orderBy?: any, offset?: number): Promise<Object>;
}
