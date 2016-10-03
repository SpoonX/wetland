/// <reference types="knex" />
/// <reference types="chai" />
import { QueryBuilder } from './QueryBuilder';
import * as knex from 'knex';
import { Scope } from './Scope';
import { EntityCtor } from './EntityInterface';
export declare class EntityRepository<T> {
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
    constructor(entityManager: Scope, entity: EntityCtor<T>);
    /**
     * Get a new query builder.
     *
     * @param {string}            [alias]
     * @param {knex.QueryBuilder} [statement]
     *
     * @returns {QueryBuilder}
     */
    getQueryBuilder(alias?: string, statement?: knex.QueryBuilder): QueryBuilder<T>;
    /**
     * Find entities based on provided criteria.
     *
     * @param {{}}          criteria
     * @param {FindOptions} [options]
     *
     * @returns {Promise<Array>}
     */
    find(criteria: Object | null, options?: FindOptions): Promise<Array<T>>;
    /**
     * Find a single entity.
     *
     * @param {{}|number|string}  criteria
     * @param {FindOptions}       [options]
     *
     * @returns {Promise<Object>}
     */
    findOne(criteria?: {} | number | string, options?: FindOptions): Promise<T>;
}
export interface FindOptions {
    orderBy?: any;
    alias?: string;
    limit?: number;
    offset?: number;
    debug?: boolean;
    join?: {} | Array<string | {}>;
}
