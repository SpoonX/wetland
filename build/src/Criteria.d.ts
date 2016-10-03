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
     * Criteria staged to apply.
     *
     * @type {Array}
     */
    private staged;
    /**
     * Construct a new Criteria parser.
     * @constructor
     *
     * @param {knex.QueryBuilder} statement
     * @param {Mapping}           hostMapping
     * @param {{}}                [mappings]
     */
    constructor(statement: knex.QueryBuilder, hostMapping: Mapping<any>, mappings?: {
        [key: string]: Mapping<any>;
    });
    /**
     * Stage criteria to be applied later.
     *
     * @param {{}} criteria
     *
     * @returns {Criteria}
     */
    stage(criteria: Object): Criteria;
    /**
     * Apply staged criteria.
     *
     * @returns {Criteria}
     */
    applyStaged(): Criteria;
    /**
     * Apply provided criteria to the statement.
     *
     * @param {{}}                criteria
     * @param {knex.QueryBuilder} [statement]
     * @param {string}            [parentKey]
     * @param {string}            [parentKnexMethodName]
     *
     * @return Criteria
     */
    apply(criteria: Object, statement?: knex.QueryBuilder, parentKey?: string, parentKnexMethodName?: string): Criteria;
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
