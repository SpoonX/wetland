/// <reference types="knex" />
/// <reference types="chai" />
import * as knex from 'knex';
import { Query } from './Query';
import { Mapping } from './Mapping';
import { Scope } from './Scope';
export declare class QueryBuilder<T> {
    /**
     * @type {Query}
     */
    private query;
    /**
     * @type {boolean}
     */
    private prepared;
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
     * @type {Array}
     */
    private selects;
    /**
     * @type {Array}
     */
    private orderBys;
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
     * @type {string[]}
     */
    private singleJoinTypes;
    /**
     * @type {Hydrator}
     */
    private hydrator;
    /**
     * @type {{}}
     */
    private aliased;
    /**
     * Construct a new QueryBuilder.
     *
     * @param {Scope}             entityManager
     * @param {knex.QueryBuilder} statement
     * @param {Mapping}           mapping
     * @param {string}            alias
     */
    constructor(entityManager: Scope, statement: knex.QueryBuilder, mapping: Mapping<T>, alias: string);
    /**
     * Create an alias.
     *
     * @param {string} target
     *
     * @returns {string}
     */
    createAlias(target: string): string;
    /**
     * Perform a join.
     *
     * @param {string} joinMethod
     * @param {string} column
     * @param {string} targetAlias
     *
     * @returns {QueryBuilder}
     */
    join(joinMethod: string, column: string, targetAlias: string): this;
    /**
     * Perform a join.
     *
     * @param {string} column
     * @param {string} targetAlias
     *
     * @returns {QueryBuilder}
     */
    leftJoin(column: string, targetAlias: string): this;
    /**
     * Perform a join.
     *
     * @param {string} column
     * @param {string} targetAlias
     *
     * @returns {QueryBuilder}
     */
    innerJoin(column: string, targetAlias: string): this;
    /**
     * Perform a join.
     *
     * @param {string} column
     * @param {string} targetAlias
     *
     * @returns {QueryBuilder}
     */
    leftOuterJoin(column: string, targetAlias: string): this;
    /**
     * Perform a join.
     *
     * @param {string} column
     * @param {string} targetAlias
     *
     * @returns {QueryBuilder}
     */
    rightJoin(column: string, targetAlias: string): this;
    /**
     * Perform a join.
     *
     * @param {string} column
     * @param {string} targetAlias
     *
     * @returns {QueryBuilder}
     */
    rightOuterJoin(column: string, targetAlias: string): this;
    /**
     * Perform a join.
     *
     * @param {string} column
     * @param {string} targetAlias
     *
     * @returns {QueryBuilder}
     */
    outerJoin(column: string, targetAlias: string): this;
    /**
     * Perform a join.
     *
     * @param {string} column
     * @param {string} targetAlias
     *
     * @returns {QueryBuilder}
     */
    fullOuterJoin(column: string, targetAlias: string): this;
    /**
     * Perform a join.
     *
     * @param {string} column
     * @param {string} targetAlias
     *
     * @returns {QueryBuilder}
     */
    crossJoin(column: string, targetAlias: string): this;
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
    }): this;
    /**
     * Make sure all changes have been applied to the query.
     *
     * @returns {QueryBuilder}
     */
    prepare(): this;
    /**
     * Apply the staged selects to the query.
     *
     * @returns {QueryBuilder}
     */
    private applySelects();
    /**
     * Apply a select to the query.
     *
     * @param {[]} propertyAlias
     *
     * @returns {QueryBuilder}
     */
    private applySelect(propertyAlias);
    /**
     * Apply a regular select (no functions).
     *
     * @param {string} propertyAlias
     *
     * @returns {QueryBuilder}
     */
    private applyRegularSelect(propertyAlias);
    /**
     * Signal an insert.
     *
     * @param {{}}     values
     * @param {string} [returning]
     *
     * @returns {QueryBuilder}
     */
    insert(values: any, returning?: string): this;
    /**
     * Signal an update.
     *
     * @param {{}}     values
     * @param {string} [returning]
     *
     * @returns {QueryBuilder}
     */
    update(values: any, returning?: any): this;
    /**
     * Set the limit.
     *
     * @param {number} limit
     *
     * @returns {QueryBuilder}
     */
    limit(limit: any): this;
    /**
     * Set the offset.
     *
     * @param {number} offset
     *
     * @returns {QueryBuilder}
     */
    offset(offset: any): this;
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
    orderBy(orderBy: string | Array<string> | Object, direction?: any): this;
    /**
     * Apply order by to the query.
     *
     * @param {string|string[]|{}} orderBy
     * @param {string}             [direction]
     *
     * @returns {QueryBuilder}
     */
    private applyOrderBy(orderBy, direction?);
    /**
     * Apply order-by statements to the query.
     *
     * @returns {QueryBuilder}
     */
    private applyOrderBys();
    /**
     * Signal a delete.
     *
     * @returns {QueryBuilder}
     */
    remove(): this;
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
    where(criteria: Object): this;
    /**
     * Enable debugging for the query.
     *
     * @returns {QueryBuilder}
     */
    debug(): this;
    /**
     * Map provided values to columns.
     *
     * @param {{}[]} values
     *
     * @returns {{}[]|{}}
     */
    private mapToColumns(values);
}
