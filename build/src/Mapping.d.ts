/// <reference types="chai" />
import { Homefront } from 'homefront';
import { EntityRepository } from './EntityRepository';
import { EntityManager } from './EntityManager';
import { Scope } from './Scope';
import { EntityCtor, EntityInterface } from './EntityInterface';
export declare class Mapping<T> {
    /**
     * @type {string}
     */
    static RELATION_ONE_TO_MANY: string;
    /**
     * @type {string}
     */
    static RELATION_MANY_TO_MANY: string;
    /**
     * @type {string}
     */
    static RELATION_MANY_TO_ONE: string;
    /**
     * @type {string}
     */
    static RELATION_ONE_TO_ONE: string;
    /**
     * @type {string}
     */
    static CASCADE_PERSIST: string;
    /**
     * @type {string}
     */
    static CASCADE_UPDATE: string;
    /**
     * @type {string}
     */
    static CASCADE_DELETE: string;
    /**
     * The mapping data.
     *
     * @type {Homefront}
     */
    mapping: Homefront;
    /**
     * Entity this mapping is for.
     *
     * @type {EntityCtor}
     */
    private target;
    /**
     * Get the mapping for a specific entity.
     *
     * @param {EntityCtor} target
     *
     * @return {Mapping}
     */
    static forEntity<T>(target: EntityCtor<T> | T): Mapping<T>;
    /**
     * Create a new mapping.
     *
     * @param {EntityCtor} entity
     */
    constructor(entity: EntityCtor<T>);
    /**
     * Get the target this mapping is for.
     *
     * @returns {EntityCtor}
     */
    getTarget(): EntityCtor<T>;
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
    field(property: string, options: FieldOptions): this;
    /**
     * Get the repository class for this mapping's entity.
     *
     * @returns {EntityRepository}
     */
    getRepository(): new (...args: any[]) => EntityRepository<T>;
    /**
     * Get the column name for a property.
     *
     * @param {string} property
     *
     * @returns {string|null}
     */
    getColumnName(property: any): string | null;
    /**
     * Get the options for provided `property` (field).
     *
     * @param {string} property
     *
     * @returns {FieldOptions}
     */
    getField(property: string): FieldOptions;
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
     * Map an entity. Examples:
     *
     *  mapping.entity();
     *  mapping.entity({repository: MyRepository, name: 'custom'});
     *
     * @param {{}} [options]
     *
     * @return {Mapping}
     */
    entity(options?: Object): this;
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
    index(indexName: string | Array<string>, fields?: string | Array<string>): this;
    /**
     * Get the indexes.
     *
     * @returns {{}[]}
     */
    getIndexes(): Array<{
        name: string;
        fields: Array<string>;
    }>;
    /**
     * Map a property to be the primary key. Example:
     *
     *  mapping.id('id');
     *
     * @param {string} property
     *
     * @return {Mapping}
     */
    primary(property: string): this;
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
     * Get the fields for mapped entity.
     *
     * @returns {FieldOptions[]}
     */
    getFields(): {
        [key: string]: FieldOptions;
    };
    /**
     * Get the name of the entity.
     *
     * @returns {string}
     */
    getEntityName(): string;
    /**
     * Get the name of the table.
     *
     * @returns {string}
     */
    getTableName(): string;
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
    generatedValue(property: string, type: string): this;
    /**
     * Convenience method to set auto increment.
     *
     * @param {string} property
     *
     * @returns {Mapping}
     */
    increments(property: string): this;
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
    /**
     * Get the unique constraints.
     *
     * @returns {{}[]}
     */
    getUniqueConstraints(): Array<{
        name: string;
        fields: Array<string>;
    }>;
    /**
     * Set cascade values.
     *
     * @param {string}    property
     * @param {string[]}  cascades
     *
     * @returns {Mapping}
     */
    cascade(property: string, cascades: Array<string>): this;
    /**
     * Add a relation to the mapping.
     *
     * @param {string}       property
     * @param {Relationship} options
     *
     * @returns {Mapping}
     */
    addRelation(property: string, options: Relationship): this;
    /**
     * Does property exist as relation.
     *
     * @param {string} property
     *
     * @returns {boolean}
     */
    isRelation(property: string): boolean;
    /**
     * Get the relations for mapped entity.
     *
     * @returns {{}}
     */
    getRelations(): {
        [key: string]: Relationship;
    };
    /**
     * Map a relationship.
     *
     * @param {string}        property
     * @param {Relationship}  options
     *
     * @returns {Mapping}
     */
    oneToOne(property: string, options: Relationship): this;
    /**
     * Map a relationship.
     *
     * @param {string}        property
     * @param {Relationship}  options
     *
     * @returns {Mapping}
     */
    oneToMany(property: string, options: Relationship): this;
    /**
     * Map a relationship.
     *
     * @param {string}        property
     * @param {Relationship}  options
     *
     * @returns {Mapping}
     */
    manyToOne(property: string, options: Relationship): this;
    /**
     * Map a relationship.
     *
     * @param {string}        property
     * @param {Relationship}  options
     *
     * @returns {Mapping}
     */
    manyToMany(property: string, options: Relationship): this;
    /**
     * Register a join table.
     *
     * @param {string}    property
     * @param {JoinTable} options
     *
     * @returns {Mapping}
     */
    joinTable(property: string, options: JoinTable): this;
    /**
     * Get all join tables.
     *
     * @returns {JoinTable[]}
     */
    getJoinTables(): Array<JoinTable>;
    /**
     * Register a join column.
     *
     * @param {string}    property
     * @param {JoinTable} options
     *
     * @returns {Mapping}
     */
    joinColumn(property: string, options: JoinColumn): this;
    /**
     * Get the join column for the relationship mapped via property.
     *
     * @param {string} property
     *
     * @returns {JoinColumn}
     */
    getJoinColumn(property: string): JoinColumn;
    /**
     * Get the join table for the relationship mapped via property.
     *
     * @param {string}              property
     * @param {EntityManager|Scope} entityManager
     *
     * @returns {JoinTable}
     */
    getJoinTable(property: string, entityManager?: EntityManager | Scope): JoinTable;
    /**
     * Extend the options of a field. This allows us to allow a unspecified order in defining mappings.
     *
     * @param {string} property
     * @param {{}}     additional
     *
     * @returns {Mapping}
     */
    extendField(property: string, additional: Object): this;
    forProperty(property: string): Field;
}
/**
 * Convenience class for chaining field definitions.
 */
export declare class Field {
    /**
     * @type {string}
     */
    private property;
    /**
     * @type {Mapping}
     */
    private mapping;
    /**
     * Construct convenience class to map property.
     *
     * @param {string}  property
     * @param {Mapping} mapping
     */
    constructor(property: string, mapping: Mapping<EntityInterface>);
    /**
     * Map a field to this property. Examples:
     *
     *  mapping.field({type: 'string', length: 255});
     *  mapping.field({type: 'string', name: 'passwd'});
     *
     * @param {FieldOptions} options
     *
     * @return {Field}
     */
    field(options: FieldOptions): this;
    /**
     * Map to be the primary key.
     *
     * @return {Field}
     */
    primary(): this;
    /**
     * Map generatedValues. Examples:
     *
     *  // Auto increment
     *  mapping.generatedValue('autoIncrement');
     *
     * @param {string} type
     *
     * @return {Field}
     */
    generatedValue(type: string): this;
    /**
     * Set cascade values.
     *
     * @param {string[]}  cascades
     *
     * @returns {Field}
     */
    cascade(cascades: Array<string>): this;
    /**
     * Convenience method for auto incrementing values.
     *
     * @returns {Field}
     */
    increments(): this;
    /**
     * Map a relationship.
     *
     * @param {Relationship} options
     *
     * @returns {Field}
     */
    oneToOne(options: Relationship): this;
    /**
     * Map a relationship.
     *
     * @param {Relationship} options
     *
     * @returns {Field}
     */
    oneToMany(options: Relationship): this;
    /**
     * Map a relationship.
     *
     * @param {Relationship} options
     *
     * @returns {Field}
     */
    manyToOne(options: Relationship): this;
    /**
     * Map a relationship.
     *
     * @param {Relationship} options
     *
     * @returns {Field}
     */
    manyToMany(options: Relationship): this;
    /**
     * Register a join table.
     *
     * @param {JoinTable} options
     *
     * @returns {Field}
     */
    joinTable(options: JoinTable): this;
    /**
     * Register a join column.
     *
     * @param {JoinTable} options
     *
     * @returns {Field}
     */
    joinColumn(options: JoinColumn): this;
}
export interface FieldOptions {
    type: string;
    primary?: boolean;
    textType?: string;
    precision?: number;
    enumeration?: Array<any>;
    generatedValue?: string;
    scale?: number;
    nullable?: boolean;
    defaultsTo?: any;
    unsigned?: boolean;
    comment?: string;
    size?: number;
    name?: string;
    cascades?: Array<string>;
    relationship?: Relationship;
    joinColumn?: JoinColumn;
    joinTable?: JoinTable;
    [key: string]: any;
}
export interface JoinTable {
    name: string;
    joinColumns?: Array<JoinColumn>;
    inverseJoinColumns?: Array<JoinColumn>;
}
export interface JoinColumn {
    referencedColumnName: string;
    name: string;
    type?: string;
    size?: number;
    indexName?: string;
    unique?: boolean;
    nullable?: boolean;
}
export interface Relationship {
    targetEntity: string | {
        new ();
    };
    type?: string;
    inversedBy?: string;
    mappedBy?: string;
}
