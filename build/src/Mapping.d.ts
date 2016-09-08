/// <reference types="chai" />
import { Homefront } from 'homefront';
export declare class Mapping {
    /**
     * The mapping data.
     *
     * @type {Homefront}
     */
    mapping: Homefront;
    /**
     * Entity this mapping is for.
     *
     * @type {Function}
     */
    private target;
    /**
     * Get the mapping for a specific entity.
     *
     * @param {Function} entity
     *
     * @return {Mapping}
     */
    static forEntity(entity: Function | Object): Mapping;
    /**
     * Create a new mapping.
     *
     * @param {Function} entity
     */
    constructor(entity: Function);
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
    field(property: string, options: {
        type: string;
        size?: number;
        [key: string]: any;
    }): Mapping;
    /**
     * Get the column name for a property.
     *
     * @param {string} property
     *
     * @returns {string|null}
     */
    getColumnName(property: any): string | null;
    /**
     * Get the property name for a column name
     *
     * @param {string} column
     *
     * @returns {string|null}
     */
    getPropertyName(column: any): string | null;
    /**
     * Map a column to a property.
     *
     * @param {string} column
     * @param {string} property
     *
     * @returns {Mapping}
     */
    private mapColumn(column, property);
    /**
     * Get the columns for this mapping. Optionally prepend it with an alias.
     *
     * @param {string} [alias]
     *
     * @returns {Array}
     */
    getColumns(alias?: string): Array<string>;
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
    entity(options?: Object): Mapping;
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
    index(indexName: string | Array<string>, fields?: string | Array<string>): Mapping;
    /**
     * Map a property to be the primary key. Example:
     *
     *  mapping.id('id');
     *
     * @param {string} property
     *
     * @return {Mapping}
     */
    id(property: string): Mapping;
    /**
     * Get the column name for the primary key.
     *
     * @returns {string|null}
     */
    getPrimaryKeyField(): string;
    /**
     * Get the property that has been assigned as the primary key.
     *
     * @returns {string}
     */
    getPrimaryKey(): string;
    /**
     * Get the column name for given property.
     *
     * @param {string} property
     * @param {string} [defaultValue]
     *
     * @returns {string}
     */
    getFieldName(property: string, defaultValue?: any): string;
    /**
     * Get the name of the entity.
     *
     * @returns {string}
     */
    getEntityName(): string;
    /**
     * Get the name of the store mapped to this entity.
     *
     * @returns {string}
     */
    getStoreName(): string;
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
    generatedValue(property: string, type: string): Mapping;
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
    uniqueConstraint(constraintName: string | Array<string>, fields?: string | Array<string>): this;
}
