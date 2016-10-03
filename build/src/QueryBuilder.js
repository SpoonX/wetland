"use strict";
const Query_1 = require('./Query');
const Mapping_1 = require('./Mapping');
const Criteria_1 = require('./Criteria');
const Hydrator_1 = require('./Hydrator');
class QueryBuilder {
    /**
     * Construct a new QueryBuilder.
     *
     * @param {Scope}             entityManager
     * @param {knex.QueryBuilder} statement
     * @param {Mapping}           mapping
     * @param {string}            alias
     */
    constructor(entityManager, statement, mapping, alias) {
        /**
         * @type {boolean}
         */
        this.prepared = false;
        /**
         * @type {Array}
         */
        this.selects = [];
        /**
         * @type {Array}
         */
        this.orderBys = [];
        /**
         * @type {string[]}
         */
        this.functions = ['sum', 'count', 'max', 'min', 'avg'];
        /**
         * @type {string[]}
         */
        this.singleJoinTypes = [Mapping_1.Mapping.RELATION_ONE_TO_ONE, Mapping_1.Mapping.RELATION_MANY_TO_ONE];
        /**
         * @type {{}}
         */
        this.aliased = {};
        this.alias = alias;
        this.mappings = { [alias]: mapping };
        this.statement = statement;
        this.criteria = new Criteria_1.Criteria(this.statement, mapping, this.mappings);
        this.entityManager = entityManager;
        this.hydrator = new Hydrator_1.Hydrator(entityManager);
        this.query = new Query_1.Query(statement, this.hydrator);
        this.hydrator.addRecipe(null, alias, this.mappings[alias]);
    }
    /**
     * Create an alias.
     *
     * @param {string} target
     *
     * @returns {string}
     */
    createAlias(target) {
        this.aliased[target] = this.aliased[target] || 0;
        return target + this.aliased[target]++;
    }
    /**
     * Perform a join.
     *
     * @param {string} joinMethod
     * @param {string} column
     * @param {string} targetAlias
     *
     * @returns {QueryBuilder}
     */
    join(joinMethod, column, targetAlias) {
        column = column.indexOf('.') > -1 ? column : `${this.alias}.${column}`;
        let [alias, property] = column.split('.');
        let owningMapping = this.mappings[alias];
        let join = owningMapping.getField(property).relationship;
        this.mappings[targetAlias] = Mapping_1.Mapping.forEntity(this.entityManager.resolveEntityReference(join.targetEntity));
        let targetMapping = this.mappings[targetAlias];
        let joinType = this.singleJoinTypes.indexOf(join.type) > -1 ? 'single' : 'collection';
        let joinColumn = owningMapping.getJoinColumn(property);
        let owning = alias;
        let other = targetAlias;
        this.hydrator.addRecipe(alias, targetAlias, targetMapping, joinType, property);
        if (join.type === Mapping_1.Mapping.RELATION_MANY_TO_MANY) {
            let joinTable;
            if (join.inversedBy) {
                joinTable = owningMapping.getJoinTable(property, this.entityManager);
            }
            else {
                joinTable = targetMapping.getJoinTable(join.mappedBy, this.entityManager);
            }
            let joinTableAlias = this.createAlias(joinTable.name);
            // Join from owning to join-table.
            this.statement[joinMethod](`${joinTable.name} as ${joinTableAlias}`, statement => {
                joinTable.joinColumns.forEach(joinColumn => {
                    statement.on(`${owning}.${joinColumn.referencedColumnName}`, '=', `${joinTableAlias}.${joinColumn.name}`);
                });
            });
            // Join from join-table to other.
            this.statement[joinMethod](`${targetMapping.getTableName()} as ${other}`, statement => {
                joinTable.inverseJoinColumns.forEach(inverseJoinColumn => {
                    statement.on(`${joinTableAlias}.${inverseJoinColumn.name}`, '=', `${other}.${inverseJoinColumn.referencedColumnName}`);
                });
            });
            return this;
        }
        if (join.mappedBy) {
            joinColumn = targetMapping.getJoinColumn(join.mappedBy);
            owning = other;
            other = alias;
        }
        this.statement[joinMethod](`${targetMapping.getTableName()} as ${targetAlias}`, `${owning}.${joinColumn.name}`, `${other}.${joinColumn.referencedColumnName}`);
        return this;
    }
    /**
     * Perform a join.
     *
     * @param {string} column
     * @param {string} targetAlias
     *
     * @returns {QueryBuilder}
     */
    leftJoin(column, targetAlias) {
        return this.join('leftJoin', column, targetAlias);
    }
    /**
     * Perform a join.
     *
     * @param {string} column
     * @param {string} targetAlias
     *
     * @returns {QueryBuilder}
     */
    innerJoin(column, targetAlias) {
        return this.join('innerJoin', column, targetAlias);
    }
    /**
     * Perform a join.
     *
     * @param {string} column
     * @param {string} targetAlias
     *
     * @returns {QueryBuilder}
     */
    leftOuterJoin(column, targetAlias) {
        return this.join('leftOuterJoin', column, targetAlias);
    }
    /**
     * Perform a join.
     *
     * @param {string} column
     * @param {string} targetAlias
     *
     * @returns {QueryBuilder}
     */
    rightJoin(column, targetAlias) {
        return this.join('rightJoin', column, targetAlias);
    }
    /**
     * Perform a join.
     *
     * @param {string} column
     * @param {string} targetAlias
     *
     * @returns {QueryBuilder}
     */
    rightOuterJoin(column, targetAlias) {
        return this.join('rightOuterJoin', column, targetAlias);
    }
    /**
     * Perform a join.
     *
     * @param {string} column
     * @param {string} targetAlias
     *
     * @returns {QueryBuilder}
     */
    outerJoin(column, targetAlias) {
        return this.join('outerJoin', column, targetAlias);
    }
    /**
     * Perform a join.
     *
     * @param {string} column
     * @param {string} targetAlias
     *
     * @returns {QueryBuilder}
     */
    fullOuterJoin(column, targetAlias) {
        return this.join('fullOuterJoin', column, targetAlias);
    }
    /**
     * Perform a join.
     *
     * @param {string} column
     * @param {string} targetAlias
     *
     * @returns {QueryBuilder}
     */
    crossJoin(column, targetAlias) {
        return this.join('crossJoin', column, targetAlias);
    }
    /**
     * Get the Query.
     *
     * @returns {Query}
     */
    getQuery() {
        this.prepare();
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
        this.selects.push(alias);
        this.prepared = false;
        return this;
    }
    /**
     * Make sure all changes have been applied to the query.
     *
     * @returns {QueryBuilder}
     */
    prepare() {
        if (this.prepared) {
            return this;
        }
        this.criteria.applyStaged();
        this.applySelects();
        this.applyOrderBys();
        this.prepared = true;
        return this;
    }
    /**
     * Apply the staged selects to the query.
     *
     * @returns {QueryBuilder}
     */
    applySelects() {
        this.selects.forEach(select => this.applySelect(select));
        this.selects = [];
        return this;
    }
    /**
     * Apply a select to the query.
     *
     * @param {[]} propertyAlias
     *
     * @returns {QueryBuilder}
     */
    applySelect(propertyAlias) {
        if (Array.isArray(propertyAlias)) {
            propertyAlias.forEach(value => this.applySelect(value));
            return this;
        }
        if (typeof propertyAlias === 'string') {
            return this.applyRegularSelect(propertyAlias);
        }
        if (typeof propertyAlias !== 'object') {
            throw new Error(`Unexpected value "${propertyAlias}" of type "${typeof propertyAlias}" for .select()`);
        }
        // Support select functions. Don't add to hydrator, as they aren't part of the entities.
        Object.getOwnPropertyNames(propertyAlias).forEach(selectFunction => {
            if (this.functions.indexOf(selectFunction) === -1) {
                throw new Error(`Unknown function "${selectFunction}" specified.`);
            }
            this.statement[selectFunction](this.criteria.mapToColumn(propertyAlias[selectFunction]));
        });
        return this;
    }
    /**
     * Apply a regular select (no functions).
     *
     * @param {string} propertyAlias
     *
     * @returns {QueryBuilder}
     */
    applyRegularSelect(propertyAlias) {
        let alias = this.alias;
        // Set default propertyAlias for context-entity properties.
        if (propertyAlias.indexOf('.') === -1 && !this.mappings[propertyAlias]) {
            propertyAlias = `${alias}.${propertyAlias}`;
        }
        let aliasRecipe = this.hydrator.getRecipe(alias);
        let selectAliases = [];
        let hydrateColumns = {};
        if (propertyAlias.indexOf('.') > -1) {
            let parts = propertyAlias.split('.');
            let property = parts[1];
            let column = this.criteria.mapToColumn(propertyAlias);
            hydrateColumns[column] = property;
            alias = parts[0];
            let primaryKeyAlias = `${aliasRecipe.primaryKey.alias} as ${aliasRecipe.primaryKey.alias}`;
            if (selectAliases.indexOf(primaryKeyAlias) === -1) {
                selectAliases.push(primaryKeyAlias);
            }
            selectAliases.push(`${column} as ${column}`);
        }
        else {
            let fields = this.mappings[propertyAlias].getFields();
            alias = propertyAlias;
            Object.getOwnPropertyNames(fields).forEach(field => {
                if (!fields[field].relationship) {
                    let fieldAlias = (propertyAlias ? propertyAlias + '.' : '') + fields[field].name;
                    hydrateColumns[fieldAlias] = field;
                    selectAliases.push(`${fieldAlias} as ${fieldAlias}`);
                }
            });
        }
        this.statement.select(selectAliases);
        this.hydrator.getRecipe(alias).hydrate = true;
        this.hydrator.addColumns(alias, hydrateColumns);
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
        this.orderBys.push({ orderBy, direction });
        return this;
    }
    /**
     * Apply order by to the query.
     *
     * @param {string|string[]|{}} orderBy
     * @param {string}             [direction]
     *
     * @returns {QueryBuilder}
     */
    applyOrderBy(orderBy, direction) {
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
     * Apply order-by statements to the query.
     *
     * @returns {QueryBuilder}
     */
    applyOrderBys() {
        this.orderBys.forEach(orderBy => this.applyOrderBy(orderBy.orderBy, orderBy.direction));
        this.orderBys = [];
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
        this.criteria.stage(criteria);
        this.prepared = false;
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
            let value = values[property];
            let fieldName;
            if (property.indexOf('.') > -1) {
                let parts = property.split('.');
                if (this.mappings[parts[0]].isRelation(parts[1]) && typeof value === 'object') {
                    return;
                }
                parts[1] = this.mappings[parts[0]].getFieldName(parts[1], parts[1]);
                fieldName = parts.join('.');
            }
            else {
                if (this.mappings[this.alias].isRelation(property) && typeof value === 'object') {
                    return;
                }
                fieldName = this.mappings[this.alias].getFieldName(property, property);
            }
            if (!fieldName) {
                throw new Error(`No field name found in mapping for ${this.mappings[this.alias].getEntityName()}::${property}.`);
            }
            mappedValues[fieldName] = value;
        });
        return mappedValues;
    }
}
exports.QueryBuilder = QueryBuilder;
