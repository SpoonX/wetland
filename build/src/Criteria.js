"use strict";
/**
 * Parse and apply criteria to statement.
 */
class Criteria {
    /**
     * Construct a new Criteria parser.
     * @constructor
     *
     * @param {knex.QueryBuilder} statement
     * @param {Mapping}           hostMapping
     * @param {{}}                [mappings]
     */
    constructor(statement, hostMapping, mappings) {
        /**
         * Available operators and the handlers.
         *
         * @type {{}}
         */
        this.operators = {
            '<': { operator: '<', value: value => value },
            'lt': { operator: '<', value: value => value },
            'lessThan': { operator: '<', value: value => value },
            '<=': { operator: '<=', value: value => value },
            'lte': { operator: '<=', value: value => value },
            'lessThanOrEqual': { operator: '<=', value: value => value },
            '>': { operator: '>', value: value => value },
            'gt': { operator: '>', value: value => value },
            'greaterThan': { operator: '>', value: value => value },
            '>=': { operator: '>=', value: value => value },
            'greaterThanOrEqual': { operator: '>=', value: value => value },
            'gte': { operator: '>=', value: value => value },
            '!': { operator: '!', value: value => value },
            'not': { operator: '!', value: value => value },
            'like': { operator: 'like', value: value => value },
            'contains': { operator: 'like', value: value => `%${value}%` },
            'startsWith': { operator: 'like', value: value => `${value}%` },
            'endsWith': { operator: 'like', value: value => `%${value}` }
        };
        /**
         * Maps operators to knex methods.
         *
         * @type {{}}
         */
        this.operatorKnexMethod = { and: 'where', or: 'orWhere' };
        this.statement = statement;
        this.mappings = mappings || {};
        this.hostMapping = hostMapping;
    }
    /**
     * Apply provided criteria to the statement.
     *
     * @param {{}}                criteria
     * @param {knex.QueryBuilder} [statement]
     * @param {string}            [parentKey]
     * @param {string}            [parentKnexMethodName]
     */
    apply(criteria, statement, parentKey, parentKnexMethodName) {
        statement = statement || this.statement;
        Object.keys(criteria).forEach(key => {
            let value = criteria[key];
            if (!(value === null || typeof value !== 'object') && value.constructor === Object) {
                return this.apply(value, statement, key);
            }
            if (this.operatorKnexMethod[key]) {
                return this.queryByMethod(statement, key, value, this.operatorKnexMethod[key]);
            }
            let operator = '=';
            if (this.operators[key]) {
                value = this.operators[key].value(value);
                operator = this.operators[key].operator;
            }
            if (Array.isArray(value) && operator === '=') {
                operator = 'in';
            }
            key = this.mapToColumn(parentKey || key);
            return statement[parentKnexMethodName || 'where'](key, operator, value);
        });
    }
    /**
     * Map a property to a column name.
     *
     * @param {string} property
     *
     * @returns {string}
     */
    mapToColumn(property) {
        if (property.indexOf('.') > -1) {
            let parts = property.split('.');
            parts[1] = this.mappings[parts[0]].getFieldName(parts[1], parts[1]);
            return parts.join('.');
        }
        return this.hostMapping.getFieldName(property, property);
    }
    /**
     * Query a specific knex method.
     *
     * @param {knex.QueryBuilder} statement
     * @param {string}            key
     * @param {*}                 value
     * @param {string}            knexMethodName
     */
    queryByMethod(statement, key, value, knexMethodName) {
        if (!Array.isArray(value)) {
            throw new Error(`${key} expect an array value`);
        }
        statement.where(subStatement => {
            value.forEach(item => this.apply(item, subStatement, null, knexMethodName));
        });
    }
}
exports.Criteria = Criteria;
