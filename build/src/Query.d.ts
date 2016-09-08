/// <reference types="knex" />
/// <reference types="chai" />
import { Mapping } from './Mapping';
import { Scope } from './Scope';
import * as knex from 'knex';
export declare class Query {
    /**
     * @type {{}}}
     */
    private mappings;
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
     * Construct a new Query.
     *
     * @param {knex.QueryBuilder} statement
     * @param {Scope}             entityManager
     */
    constructor(statement: knex.QueryBuilder, entityManager: Scope);
    /**
     * Get the statement (knex instance).
     *
     * @returns {knex.QueryBuilder}
     */
    getStatement(): knex.QueryBuilder;
    /**
     * Set mappings.
     *
     * @param {{}} mappings
     *
     * @returns {Query} Fluent interface
     */
    setMappings(mappings: {
        [key: string]: Mapping;
    }): Query;
    /**
     * Set the alias for the host.
     *
     * @param {string} alias
     *
     * @returns {Query}
     */
    setAlias(alias: string): Query;
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
     * Hydrate provided rows to entities.
     *
     * @param {{}[]}   rows
     * @param {string} alias
     *
     * @returns {{}[]}
     */
    private hydrateEntities(rows, alias);
    /**
     * Hydrate an entity.
     *
     * @param {{}}     row
     * @param {string} alias
     *
     * @returns {{}}
     */
    private hydrateEntity(row, alias);
    /**
     * Get the SQL query for current query.
     *
     * @returns {string}
     */
    getSQL(): string;
}
