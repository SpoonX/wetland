"use strict";
const Criteria_1 = require('./Criteria');
class QueryBuilder {
    /**
     * Construct a new QueryBuilder.
     *
     * @param {Scope}   entityManager
     * @param {Query}   query
     * @param {Mapping} mapping
     * @param {string}  alias
     */
    constructor(entityManager, query, mapping, alias) {
        /**
         * @type {string[]}
         */
        this.functions = ['sum', 'count', 'max', 'min', 'avg'];
        this.query = query;
        this.alias = alias;
        this.mappings = { [alias]: mapping };
        this.statement = query.getStatement();
        this.criteria = new Criteria_1.Criteria(this.statement, mapping, this.mappings);
        this.entityManager = entityManager;
        query.setMappings(this.mappings).setAlias(alias);
    }
    /**
     * Get the Query.
     *
     * @returns {Query}
     */
    getQuery() {
        return this.query;
    }
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
    select(alias) {
        if (Array.isArray(alias)) {
            alias.forEach(value => {
                this.select(value);
            });
            return this;
        }
        if (typeof alias === 'string') {
            if (alias.indexOf('.') > -1) {
                this.statement.select(this.criteria.mapToColumn(alias));
            }
            else {
                this.statement.select(this.mappings[alias].getColumns(alias));
            }
        }
        else if (typeof alias === 'object') {
            Object.getOwnPropertyNames(alias).forEach(selectFunction => {
                if (this.functions.indexOf(selectFunction) === -1) {
                    throw new Error(`Unknown function "${selectFunction}" specified.`);
                }
                this.statement[selectFunction](this.criteria.mapToColumn(alias[selectFunction]));
            });
        }
        else {
            throw new Error('Unexpected value for .select()');
        }
        return this;
    }
    /**
     * Signal an insert.
     *
     * @param {{}}     values
     * @param {string} [returning]
     *
     * @returns {QueryBuilder}
     */
    insert(values, returning) {
        this.statement.insert(this.mapToColumns(values), returning);
        return this;
    }
    /**
     * Signal an update.
     *
     * @param {{}}     values
     * @param {string} [returning]
     *
     * @returns {QueryBuilder}
     */
    update(values, returning) {
        this.statement.update(this.mapToColumns(values), returning);
        return this;
    }
    /**
     * Set the limit.
     *
     * @param {number} limit
     *
     * @returns {QueryBuilder}
     */
    limit(limit) {
        this.statement.limit(limit);
        return this;
    }
    /**
     * Set the offset.
     *
     * @param {number} offset
     *
     * @returns {QueryBuilder}
     */
    offset(offset) {
        this.statement.offset(offset);
        return this;
    }
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
    orderBy(orderBy, direction) {
        if (typeof orderBy === 'string') {
            this.statement.orderBy(this.criteria.mapToColumn(orderBy), direction);
        }
        else if (Array.isArray(orderBy)) {
            orderBy.forEach(order => this.orderBy(order));
        }
        else if (typeof orderBy === 'object') {
            let property = Object.keys(orderBy)[0];
            this.orderBy(property, orderBy[property]);
        }
        return this;
    }
    /**
     * Signal a delete.
     *
     * @returns {QueryBuilder}
     */
    remove() {
        this.statement.del();
        return this;
    }
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
    where(criteria) {
        if (Object.getOwnPropertyNames(criteria).length === 0) {
            return this;
        }
        this.criteria.apply(criteria);
        return this;
    }
    /**
     * Map provided values to columns.
     *
     * @param {{}[]} values
     *
     * @returns {{}[]|{}}
     */
    mapToColumns(values) {
        let mappedValues;
        if (Array.isArray(values)) {
            mappedValues = [];
            values.forEach(value => {
                mappedValues.push(this.mapToColumns(value));
            });
            return mappedValues;
        }
        mappedValues = {};
        Object.getOwnPropertyNames(values).forEach(property => {
            let fieldName = this.criteria.mapToColumn(property);
            if (!fieldName) {
                throw new Error(`No field name found in mapping for ${this.mappings[this.alias].getEntityName()}::${property}.`);
            }
            mappedValues[fieldName] = values[property];
        });
        return mappedValues;
    }
}
exports.QueryBuilder = QueryBuilder;
