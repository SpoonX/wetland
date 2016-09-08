/// <reference types="knex" />
/// <reference types="chai" />
import { Mapping } from './Mapping';
import * as knex from 'knex';
/**
 * Parse and apply criteria to statement.
 */
export declare class Criteria {
    /**
     * Available operators and the handlers.
     *
     * @type {{}}
     */
    private operators;
    /**
     * Maps operators to knex methods.
     *
     * @type {{}}
     */
    private operatorKnexMethod;
    /**
     * Mapping for the host entity.
     *
     * @type {Mapping}
     */
    private hostMapping;
    /**
     * Mappings for entities (joins).
     *
     * @type {{}}
     */
    private mappings;
    /**
     * Statement to apply criteria to.
     *
     * {knex.QueryBuilder}
     */
    private statement;
    /**
     * Construct a new Criteria parser.
     * @constructor
     *
     * @param {knex.QueryBuilder} statement
     * @param {Mapping}           hostMapping
     * @param {{}}                [mappings]
     */
    constructor(statement: knex.QueryBuilder, hostMapping: Mapping, mappings?: {
        [key: string]: Mapping;
    });
    /**
     * Apply provided criteria to the statement.
     *
     * @param {{}}                criteria
     * @param {knex.QueryBuilder} [statement]
     * @param {string}            [parentKey]
     * @param {string}            [parentKnexMethodName]
     */
    apply(criteria: Object, statement?: knex.QueryBuilder, parentKey?: string, parentKnexMethodName?: string): void;
    /**
     * Map a property to a column name.
     *
     * @param {string} property
     *
     * @returns {string}
     */
    mapToColumn(property: string): string;
    /**
     * Query a specific knex method.
     *
     * @param {knex.QueryBuilder} statement
     * @param {string}            key
     * @param {*}                 value
     * @param {string}            knexMethodName
     */
    private queryByMethod(statement, key, value, knexMethodName);
}
