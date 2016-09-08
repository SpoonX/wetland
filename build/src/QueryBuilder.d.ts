/// <reference types="chai" />
import { Query } from './Query';
import { Mapping } from './Mapping';
import { Scope } from './Scope';
export declare class QueryBuilder {
    /**
     * @type {Query}
     */
    private query;
    /**
     * @type {string}
     */
    private alias;
    /**
     * @type {Scope}
     */
    private entityManager;
    /**
     * @type {{}}
     */
    private statement;
    /**
     * @type {Mapping}
     */
    private mapping;
    /**
     * @type {Criteria}
     */
    private criteria;
    /**
     * @type {{}}
     */
    private mappings;
    /**
     * @type {string[]}
     */
    private functions;
    /**
     * Construct a new QueryBuilder.
     *
     * @param {Scope}   entityManager
     * @param {Query}   query
     * @param {Mapping} mapping
     * @param {string}  alias
     */
    constructor(entityManager: Scope, query: Query, mapping: Mapping, alias: string);
    /**
     * Get the Query.
     *
     * @returns {Query}
     */
    getQuery(): Query;
    /**
     * Columns to select. Chainable, and allows an array of arguments typed below.
     *
     *  .select('f');           // select f.*
     *  .select('f.name')       // select f.name
     *  .select({sum: 'field'}) // select sum(field)
     *
     * @param {string[]|string|{}} alias
     *
     * @returns {QueryBuilder}
     */
    select(alias: Array<string> | string | {
        [key: string]: string;
    }): QueryBuilder;
    /**
     * Signal an insert.
     *
     * @param {{}}     values
     * @param {string} [returning]
     *
     * @returns {QueryBuilder}
     */
    insert(values: any, returning?: string): QueryBuilder;
    /**
     * Signal an update.
     *
     * @param {{}}     values
     * @param {string} [returning]
     *
     * @returns {QueryBuilder}
     */
    update(values: any, returning?: any): QueryBuilder;
    /**
     * Set the limit.
     *
     * @param {number} limit
     *
     * @returns {QueryBuilder}
     */
    limit(limit: any): QueryBuilder;
    /**
     * Set the offset.
     *
     * @param {number} offset
     *
     * @returns {QueryBuilder}
     */
    offset(offset: any): QueryBuilder;
    /**
     * Set the order by.
     *
     *  .orderBy('name')
     *  .orderBy('name', 'desc')
     *  .orderBy({name: 'desc'})
     *  .orderBy(['name', {age: 'asc'}])
     *
     * @param {string|string[]|{}} orderBy
     * @param {string}             [direction]
     *
     * @returns {QueryBuilder}
     */
    orderBy(orderBy: string | Array<string> | Object, direction?: any): QueryBuilder;
    /**
     * Signal a delete.
     *
     * @returns {QueryBuilder}
     */
    remove(): QueryBuilder;
    /**
     * Sets the where clause.
     *
     *  .where({name: 'Wesley'})
     *  .where({name: ['Wesley', 'Roberto']}
     *  .where({name: 'Wesley', company: 'SpoonX', age: {gt: '25'}})
     *
     * @param {{}} criteria
     *
     * @returns {QueryBuilder}
     */
    where(criteria: Object): QueryBuilder;
    /**
     * Map provided values to columns.
     *
     * @param {{}[]} values
     *
     * @returns {{}[]|{}}
     */
    private mapToColumns(values);
}
