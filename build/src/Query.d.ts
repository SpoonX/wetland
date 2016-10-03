/// <reference types="knex" />
/// <reference types="chai" />
import * as knex from 'knex';
import { Hydrator } from './Hydrator';
export declare class Query {
    /**
     * Log all queries when true.
     *
     * @type {boolean}
     */
    private debug;
    /**
     * @type {Hydrator}
     */
    private hydrator;
    /**
     * @type {{}}
     */
    private statement;
    /**
     * Construct a new Query.
     *
     * @param {knex.QueryBuilder} statement
     * @param {Hydrator}          hydrator
     */
    constructor(statement: knex.QueryBuilder, hydrator: Hydrator);
    /**
     * Enable debugging for this query.
     *
     * @returns {Query}
     */
    enableDebugging(): Query;
    /**
     * Execute the query.
     *
     * @returns {Promise<[]>}
     */
    execute(): Promise<Array<Object>>;
    /**
     * Get a single scalar result (for instance for count, sum or max).
     *
     * @returns {Promise<number>}
     */
    getSingleScalarResult(): Promise<number>;
    /**
     * Get the result for the query.
     *
     * @returns {Promise<{}[]>}
     */
    getResult(): Promise<Array<Object>>;
    /**
     * Get the SQL query for current query.
     *
     * @returns {string}
     */
    getSQL(): string;
    /**
     * Get the statement for this query.
     *
     * @returns {knex.QueryBuilder}
     */
    getStatement(): knex.QueryBuilder;
}
