/// <reference types="knex" />
import { FieldOptions } from './Mapping';
import * as Knex from 'knex';
import { Scope } from './Scope';
export declare class SchemaBuilder {
    /**
     * @type {Array}
     */
    private creates;
    /**
     * @type {Array}
     */
    private alters;
    /**
     * @type {Scope}
     */
    private entityManager;
    /**
     * @type {boolean}
     */
    private built;
    /**
     * @type {string[]}
     */
    private types;
    /**
     * @param {Scope} entityManager
     */
    constructor(entityManager: Scope);
    /**
     * Get the schema queries.
     *
     * @returns {string}
     */
    getSQL(): string;
    /**
     * Persist the schema to the database.
     *
     * @returns {Promise<any[]>}
     */
    apply(): Promise<any[]>;
    /**
     * Create the schema.
     *
     * @returns {SchemaBuilder}
     */
    create(): this;
    /**
     * Process an entity to create the schema.
     *
     * @param {EntityCtor} entity
     */
    private processEntity(entity);
    /**
     * Add a builder.
     *
     * @param {EntityCtor}  entity
     * @param {string}      tableName
     * @param {Function}    builder
     * @param {boolean}     [alter]
     */
    private addBuilder(entity, tableName, builder, alter?);
    /**
     * Compose provided fields.
     *
     * @param {Knex.TableBuilder} tableBuilder
     * @param {{}}                fields
     *
     * @returns {SchemaBuilder}
     */
    private composeFields(tableBuilder, fields);
    /**
     * Process the relations on mapping.
     *
     * @param {Mapping} mapping
     *
     * @returns {SchemaBuilder}
     */
    private processRelations(mapping);
    /**
     * Apply cascades to provided table builder.
     *
     * @param {string[]}           cascades
     * @param {Knex.ColumnBuilder} foreign
     */
    private applyCascades(cascades, foreign);
    /**
     * Compose the indexes for mapping.
     *
     * @param {Knex.TableBuilder} indexBuilder
     * @param {Mapping}           mapping
     *
     * @returns {SchemaBuilder}
     */
    private composeIndexes(indexBuilder, mapping);
    /**
     * Compose a field.
     *
     * @param {Knex.TableBuilder} tableBuilder
     * @param {FieldOptions}      field
     */
    private composeField(tableBuilder, field);
    /**
     * Define a column type.
     *
     * @param {Knex.TableBuilder} table
     * @param {FieldOptions}      field
     *
     * @returns {ColumnBuilder}
     */
    integer(table: Knex.TableBuilder, field: FieldOptions): Knex.ColumnBuilder;
    /**
     * Define a column type.
     *
     * @param {Knex.TableBuilder} table
     * @param {FieldOptions}      field
     *
     * @returns {ColumnBuilder}
     */
    bigInteger(table: Knex.TableBuilder, field: FieldOptions): Knex.ColumnBuilder;
    /**
     * Define a column type.
     *
     * @param {Knex.TableBuilder} table
     * @param {FieldOptions}      field
     *
     * @returns {ColumnBuilder}
     */
    text(table: Knex.TableBuilder, field: FieldOptions): Knex.ColumnBuilder;
    /**
     * Define a column type.
     *
     * @param {Knex.TableBuilder} table
     * @param {FieldOptions}      field
     *
     * @returns {ColumnBuilder}
     */
    string(table: Knex.TableBuilder, field: FieldOptions): Knex.ColumnBuilder;
    /**
     * Define a column type.
     *
     * @param {Knex.TableBuilder} table
     * @param {FieldOptions}      field
     *
     * @returns {ColumnBuilder}
     */
    float(table: Knex.TableBuilder, field: FieldOptions): Knex.ColumnBuilder;
    /**
     * Define a column type.
     *
     * @param {Knex.TableBuilder} table
     * @param {FieldOptions}      field
     *
     * @returns {ColumnBuilder}
     */
    decimal(table: Knex.TableBuilder, field: FieldOptions): Knex.ColumnBuilder;
    /**
     * Define a column type.
     *
     * @param {Knex.TableBuilder} table
     * @param {FieldOptions}      field
     *
     * @returns {ColumnBuilder}
     */
    boolean(table: Knex.TableBuilder, field: FieldOptions): Knex.ColumnBuilder;
    /**
     * Define a column type.
     *
     * @param {Knex.TableBuilder} table
     * @param {FieldOptions}      field
     *
     * @returns {ColumnBuilder}
     */
    date(table: Knex.TableBuilder, field: FieldOptions): Knex.ColumnBuilder;
    /**
     * Define a column type.
     *
     * @param {Knex.TableBuilder} table
     * @param {FieldOptions}      field
     *
     * @returns {ColumnBuilder}
     */
    dateTime(table: Knex.TableBuilder, field: FieldOptions): Knex.ColumnBuilder;
    /**
     * Define a column type.
     *
     * @param {Knex.TableBuilder} table
     * @param {FieldOptions}      field
     *
     * @returns {ColumnBuilder}
     */
    datetime(table: Knex.TableBuilder, field: FieldOptions): Knex.ColumnBuilder;
    /**
     * Define a column type.
     *
     * @param {Knex.TableBuilder} table
     * @param {FieldOptions}      field
     *
     * @returns {ColumnBuilder}
     */
    time(table: Knex.TableBuilder, field: FieldOptions): Knex.ColumnBuilder;
    /**
     * Define a column type.
     *
     * @param {Knex.TableBuilder} table
     * @param {FieldOptions}      field
     *
     * @returns {ColumnBuilder}
     */
    timestamp(table: Knex.TableBuilder, field: FieldOptions): Knex.ColumnBuilder;
    /**
     * Define a column type.
     *
     * @param {Knex.TableBuilder} table
     * @param {FieldOptions}      field
     *
     * @returns {ColumnBuilder}
     */
    binary(table: Knex.TableBuilder, field: FieldOptions): Knex.ColumnBuilder;
    /**
     * Define a column type.
     *
     * @param {Knex.TableBuilder} table
     * @param {FieldOptions}      field
     *
     * @returns {ColumnBuilder}
     */
    json(table: Knex.TableBuilder, field: FieldOptions): Knex.ColumnBuilder;
    /**
     * Define a column type.
     *
     * @param {Knex.TableBuilder} table
     * @param {FieldOptions}      field
     *
     * @returns {ColumnBuilder}
     */
    jsonb(table: Knex.TableBuilder, field: FieldOptions): Knex.ColumnBuilder;
    /**
     * Define a column type.
     *
     * @param {Knex.TableBuilder} table
     * @param {FieldOptions}      field
     *
     * @returns {ColumnBuilder}
     */
    uuid(table: Knex.TableBuilder, field: FieldOptions): Knex.ColumnBuilder;
    /**
     * Define a column type.
     *
     * @param {Knex.TableBuilder} table
     * @param {FieldOptions}      field
     *
     * @returns {ColumnBuilder}
     */
    enumeration(table: Knex.TableBuilder, field: FieldOptions): Knex.ColumnBuilder;
}
