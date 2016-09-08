"use strict";
const homefront_1 = require('homefront');
const EntityRepository_1 = require('./EntityRepository');
const MetaData_1 = require('./MetaData');
class Mapping {
    /**
     * Create a new mapping.
     *
     * @param {Function} entity
     */
    constructor(entity) {
        /**
         * The mapping data.
         *
         * @type {Homefront}
         */
        this.mapping = new homefront_1.Homefront;
        this.target = entity;
        // Set up default entity mapping information.
        this.entity();
    }
    /**
     * Get the mapping for a specific entity.
     *
     * @param {Function} entity
     *
     * @return {Mapping}
     */
    static forEntity(entity) {
        entity = MetaData_1.MetaData.getConstructor(entity);
        let metadata = MetaData_1.MetaData.forTarget(entity);
        if (!metadata.fetch('mapping')) {
            metadata.put('mapping', new Mapping(entity));
        }
        return metadata.fetch('mapping');
    }
    /**
     * Map a field to this property. Examples:
     *
     *  mapping.field('username', {type: 'string', length: 255});
     *  mapping.field('password', {type: 'string', name: 'passwd'});
     *
     * @param {string} property
     * @param {{}}     options
     *
     * @return {Mapping}
     */
    field(property, options) {
        homefront_1.Homefront.merge(this.mapping.fetchOrPut(`fields.${property}`, { name: property }), options);
        this.mapColumn(this.getColumnName(property), property);
        return this;
    }
    /**
     * Get the column name for a property.
     *
     * @param {string} property
     *
     * @returns {string|null}
     */
    getColumnName(property) {
        return this.mapping.fetch(`fields.${property}.name`, null);
    }
    /**
     * Get the property name for a column name
     *
     * @param {string} column
     *
     * @returns {string|null}
     */
    getPropertyName(column) {
        return this.mapping.fetch(`columns.${column}`, null);
    }
    /**
     * Map a column to a property.
     *
     * @param {string} column
     * @param {string} property
     *
     * @returns {Mapping}
     */
    mapColumn(column, property) {
        this.mapping.put(`columns.${column}`, property);
        return this;
    }
    /**
     * Get the columns for this mapping. Optionally prepend it with an alias.
     *
     * @param {string} [alias]
     *
     * @returns {Array}
     */
    getColumns(alias = null) {
        let fields = this.mapping.fetch('fields');
        return Object.getOwnPropertyNames(fields).map(field => {
            return (alias ? alias + '.' : '') + fields[field].name;
        });
    }
    /**
     * Map an entity. Examples:
     *
     *  mapping.entity();
     *  mapping.entity({repository: MyRepository, name: 'custom'});
     *
     * @param {{}} [options]
     *
     * @return {Mapping}
     */
    entity(options = {}) {
        let defaultMapping = {
            repository: EntityRepository_1.EntityRepository,
            name: this.target.name.toLowerCase(),
            store: null
        };
        homefront_1.Homefront.merge(this.mapping.fetchOrPut(`entity`, defaultMapping), options);
        return this;
    }
    /**
     * Map an index. Examples:
     *
     *  - Compound
     *    mapping.index('idx_something', ['property1', 'property2']);
     *
     *  - Single
     *    mapping.index('idx_something', ['property']);
     *    mapping.index('idx_something', 'property');
     *
     *  - Generated index name "idx_property"
     *    mapping.index('property');
     *    mapping.index(['property1', 'property2']);
     *
     * @param {Array|string} indexName
     * @param {Array|string} [fields]
     *
     * @return {Mapping}
     */
    index(indexName, fields) {
        if (!fields) {
            fields = (Array.isArray(indexName) ? indexName : [indexName]);
            indexName = 'idx_' + fields.join('_').toLowerCase();
        }
        fields = Array.isArray(fields) ? fields : [fields];
        let indexes = this.mapping.fetchOrPut(`indexes`, []);
        indexes.push({ name: indexName, fields });
        return this;
    }
    /**
     * Map a property to be the primary key. Example:
     *
     *  mapping.id('id');
     *
     * @param {string} property
     *
     * @return {Mapping}
     */
    id(property) {
        this.mapping.put('primary', property);
        homefront_1.Homefront.merge(this.mapping.fetchOrPut(`fields.${property}`, {}), { primary: true });
        return this;
    }
    /**
     * Get the column name for the primary key.
     *
     * @returns {string|null}
     */
    getPrimaryKeyField() {
        let primaryKey = this.getPrimaryKey();
        if (!primaryKey) {
            return null;
        }
        return this.getFieldName(primaryKey);
    }
    /**
     * Get the property that has been assigned as the primary key.
     *
     * @returns {string}
     */
    getPrimaryKey() {
        return this.mapping.fetch('primary', null);
    }
    /**
     * Get the column name for given property.
     *
     * @param {string} property
     * @param {string} [defaultValue]
     *
     * @returns {string}
     */
    getFieldName(property, defaultValue = null) {
        return this.mapping.fetch(`fields.${property}.name`, defaultValue);
    }
    /**
     * Get the name of the entity.
     *
     * @returns {string}
     */
    getEntityName() {
        return this.mapping.fetch('entity.name');
    }
    /**
     * Get the name of the store mapped to this entity.
     *
     * @returns {string}
     */
    getStoreName() {
        return this.mapping.fetch('entity.store');
    }
    /**
     * Map generatedValues. Examples:
     *
     *  // Auto increment
     *  mapping.generatedValue('id', 'autoIncrement');
     *
     * @param {string} property
     * @param {string} type
     *
     * @return {Mapping}
     */
    generatedValue(property, type) {
        homefront_1.Homefront.merge(this.mapping.fetchOrPut(`fields.${property}`, {}), { generatedValue: type });
        return this;
    }
    /**
     * Map a unique constraint.
     *
     *  - Compound:
     *    mapping.uniqueConstraint('something_unique', ['property1', 'property2']);
     *
     *  - Single:
     *    mapping.uniqueConstraint('something_unique', ['property']);
     *    mapping.uniqueConstraint('something_unique', 'property');
     *
     *  - Generated uniqueConstraint name:
     *    mapping.uniqueConstraint('property');
     *    mapping.uniqueConstraint(['property1', 'property2']);
     *
     * @param {Array|string} constraintName
     * @param {Array|string} [fields]
     *
     * @return {Mapping}
     */
    uniqueConstraint(constraintName, fields) {
        if (!fields) {
            fields = (Array.isArray(constraintName) ? constraintName : [constraintName]);
            constraintName = fields.join('_').toLowerCase() + '_unique';
        }
        fields = (Array.isArray(fields) ? fields : [fields]);
        let indexes = this.mapping.fetchOrPut(`uniqueConstraints`, []);
        indexes.push({ name: constraintName, fields });
        return this;
    }
}
exports.Mapping = Mapping;
