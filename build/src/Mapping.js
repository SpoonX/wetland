"use strict";
const homefront_1 = require('homefront');
const EntityRepository_1 = require('./EntityRepository');
const MetaData_1 = require('./MetaData');
class Mapping {
    /**
     * Create a new mapping.
     *
     * @param {EntityCtor} entity
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
     * @param {EntityCtor} target
     *
     * @return {Mapping}
     */
    static forEntity(target) {
        let entity = MetaData_1.MetaData.getConstructor(target);
        let metadata = MetaData_1.MetaData.forTarget(entity);
        if (!metadata.fetch('mapping')) {
            metadata.put('mapping', new Mapping(entity));
        }
        return metadata.fetch('mapping');
    }
    /**
     * Get the target this mapping is for.
     *
     * @returns {EntityCtor}
     */
    getTarget() {
        return this.target;
    }
    /**
     * Map a field to this property. Examples:
     *
     *  mapping.field('username', {type: 'string', length: 255});
     *  mapping.field('password', {type: 'string', name: 'passwd'});
     *
     * @param {string}       property
     * @param {FieldOptions} options
     *
     * @return {Mapping}
     */
    field(property, options) {
        homefront_1.Homefront.merge(this.mapping.fetchOrPut(`fields.${property}`, { name: property }), options);
        this.mapColumn(this.getColumnName(property), property);
        return this;
    }
    /**
     * Get the repository class for this mapping's entity.
     *
     * @returns {EntityRepository}
     */
    getRepository() {
        return this.mapping.fetch('entity.repository');
    }
    /**
     * Get the column name for a property.
     *
     * @param {string} property
     *
     * @returns {string|null}
     */
    getColumnName(property) {
        return this.getField(property).name;
    }
    /**
     * Get the options for provided `property` (field).
     *
     * @param {string} property
     *
     * @returns {FieldOptions}
     */
    getField(property) {
        let field = this.mapping.fetch(`fields.${property}`);
        if (!field) {
            throw new Error(`Unknown field "${property}" supplied.`);
        }
        return field;
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
            name: this.target.name,
            tableName: this.target.name.toLowerCase(),
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
        this.extendField(property, { primary: true });
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
     * Get the fields for mapped entity.
     *
     * @returns {FieldOptions[]}
     */
    getFields() {
        return this.mapping.fetch('fields', null);
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
     * Get the name of the table.
     *
     * @returns {string}
     */
    getTableName() {
        return this.mapping.fetch('entity.tableName');
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
    /**
     * Set cascade values.
     *
     * @param {string}    property
     * @param {string[]}  cascades
     *
     * @returns {Mapping}
     */
    cascade(property, cascades) {
        return this.extendField(property, { cascades: cascades });
    }
    /**
     * Add a relation to the mapping.
     *
     * @param {string}       property
     * @param {Relationship} options
     *
     * @returns {Mapping}
     */
    addRelation(property, options) {
        this.extendField(property, { relationship: options });
        homefront_1.Homefront.merge(this.mapping.fetchOrPut('relations', {}), { [property]: options });
        return this;
    }
    /**
     * Does property exist as relation.
     *
     * @param {string} property
     *
     * @returns {boolean}
     */
    isRelation(property) {
        return !!this.mapping.fetch(`relations.${property}`);
    }
    /**
     * Get the relations for mapped entity.
     *
     * @returns {{}}
     */
    getRelations() {
        return this.mapping.fetch('relations');
    }
    /**
     * Map a relationship.
     *
     * @param {string}        property
     * @param {Relationship}  options
     *
     * @returns {Mapping}
     */
    oneToOne(property, options) {
        return this.addRelation(property, {
            type: Mapping.RELATION_ONE_TO_ONE,
            targetEntity: options.targetEntity,
            inversedBy: options.inversedBy,
            mappedBy: options.mappedBy
        });
    }
    /**
     * Map a relationship.
     *
     * @param {string}        property
     * @param {Relationship}  options
     *
     * @returns {Mapping}
     */
    oneToMany(property, options) {
        return this.addRelation(property, {
            targetEntity: options.targetEntity,
            type: Mapping.RELATION_ONE_TO_MANY,
            mappedBy: options.mappedBy
        });
    }
    /**
     * Map a relationship.
     *
     * @param {string}        property
     * @param {Relationship}  options
     *
     * @returns {Mapping}
     */
    manyToOne(property, options) {
        return this.addRelation(property, {
            targetEntity: options.targetEntity,
            type: Mapping.RELATION_MANY_TO_ONE,
            inversedBy: options.inversedBy
        });
    }
    /**
     * Map a relationship.
     *
     * @param {string}        property
     * @param {Relationship}  options
     *
     * @returns {Mapping}
     */
    manyToMany(property, options) {
        return this.addRelation(property, {
            targetEntity: options.targetEntity,
            type: Mapping.RELATION_MANY_TO_MANY,
            inversedBy: options.inversedBy,
            mappedBy: options.mappedBy
        });
    }
    /**
     * Register a join table.
     *
     * @param {string}    property
     * @param {JoinTable} options
     *
     * @returns {Mapping}
     */
    joinTable(property, options) {
        this.extendField(property, { joinTable: options });
        return this;
    }
    /**
     * Register a join column.
     *
     * @param {string}    property
     * @param {JoinTable} options
     *
     * @returns {Mapping}
     */
    joinColumn(property, options) {
        this.extendField(property, { joinColumn: options });
        return this;
    }
    /**
     * Get the join column for the relationship mapped via property.
     *
     * @param {string} property
     *
     * @returns {JoinColumn}
     */
    getJoinColumn(property) {
        let field = this.getField(property);
        if (!field.joinColumn) {
            field.joinColumn = {
                name: `${property}_id`,
                referencedColumnName: 'id',
                unique: false,
                nullable: true
            };
        }
        return field.joinColumn;
    }
    /**
     * Get the join table for the relationship mapped via property.
     *
     * @param {string}              property
     * @param {EntityManager|Scope} entityManager
     *
     * @returns {JoinTable}
     */
    getJoinTable(property, entityManager) {
        let field = this.getField(property);
        if (!field.joinTable) {
            if (!entityManager) {
                return null;
            }
            let relationMapping = Mapping.forEntity(entityManager.resolveEntityReference(field.relationship.targetEntity));
            let ownTableName = this.getTableName();
            let withTableName = relationMapping.getTableName();
            let ownPrimary = this.getPrimaryKeyField();
            let withPrimary = relationMapping.getPrimaryKeyField();
            field.joinTable = {
                name: `${ownTableName}_${withTableName}`,
                joinColumns: [{ referencedColumnName: ownPrimary, name: `${ownTableName}_id` }],
                inverseJoinColumns: [{ referencedColumnName: withPrimary, name: `${withTableName}_id` }]
            };
        }
        return field.joinTable;
    }
    /**
     * Extend the options of a field. This allows us to allow a unspecified order in defining mappings.
     *
     * @param {string} property
     * @param {{}}     additional
     *
     * @returns {Mapping}
     */
    extendField(property, additional) {
        homefront_1.Homefront.merge(this.mapping.fetchOrPut(`fields.${property}`, {}), additional);
        return this;
    }
}
/**
 * @type {string}
 */
Mapping.RELATION_ONE_TO_MANY = 'oneToMany';
/**
 * @type {string}
 */
Mapping.RELATION_MANY_TO_MANY = 'manyToMany';
/**
 * @type {string}
 */
Mapping.RELATION_MANY_TO_ONE = 'manyToOne';
/**
 * @type {string}
 */
Mapping.RELATION_ONE_TO_ONE = 'oneToOne';
/**
 * @type {string}
 */
Mapping.CASCADE_PERSIST = 'persist';
exports.Mapping = Mapping;
