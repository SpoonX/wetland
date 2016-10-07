"use strict";
const Mapping_1 = require('./Mapping');
const Store_1 = require('./Store');
class SchemaBuilder {
    /**
     * @param {Scope} entityManager
     */
    constructor(entityManager) {
        /**
         * @type {Array}
         */
        this.creates = [];
        /**
         * @type {Array}
         */
        this.alters = [];
        /**
         * @type {boolean}
         */
        this.built = false;
        /**
         * @type {string[]}
         */
        this.types = [
            'integer',
            'bigInteger',
            'text',
            'string',
            'float',
            'decimal',
            'boolean',
            'date',
            'dateTime',
            'datetime',
            'time',
            'timestamp',
            'binary',
            'json',
            'jsonb',
            'uuid',
        ];
        this.entityManager = entityManager;
    }
    /**
     * Get the schema queries.
     *
     * @returns {string}
     */
    getSQL() {
        let queries = [];
        this.creates.forEach(create => {
            let query = create.toString();
            if (query) {
                queries.push(create.toString());
            }
        });
        this.alters.forEach(alter => {
            let query = alter.toString();
            if (query) {
                queries.push(alter.toString());
            }
        });
        return queries.join('\n');
    }
    /**
     * Persist the schema to the database.
     *
     * @returns {Promise<any[]>}
     */
    apply() {
        return Promise
            .all(this.creates.map(create => create.then()))
            .then(() => Promise.all(this.alters.map(alter => alter.then())));
    }
    /**
     * Create the schema.
     *
     * @returns {SchemaBuilder}
     */
    create() {
        if (this.built) {
            return this;
        }
        let entities = this.entityManager.getEntities();
        Object.getOwnPropertyNames(entities).forEach(entity => this.processEntity(entities[entity]));
        this.built = true;
        return this;
    }
    /**
     * Process an entity to create the schema.
     *
     * @param {EntityCtor} entity
     */
    processEntity(entity) {
        let mapping = Mapping_1.Mapping.forEntity(entity);
        let tableName = mapping.getTableName();
        this.addBuilder(entity, tableName, table => {
            this.composeFields(table, mapping.getFields());
        });
        this.addBuilder(entity, tableName, table => {
            this.composeIndexes(table, mapping);
        }, true);
        this.processRelations(mapping);
    }
    /**
     * Add a builder.
     *
     * @param {EntityCtor}  entity
     * @param {string}      tableName
     * @param {Function}    builder
     * @param {boolean}     [alter]
     */
    addBuilder(entity, tableName, builder, alter = false) {
        let schemaBuilder = this.entityManager.getStore(entity).getConnection(Store_1.Store.ROLE_MASTER).schema;
        if (alter) {
            this.alters.push(schemaBuilder.table(tableName, builder));
        }
        else {
            this.creates.push(schemaBuilder.createTable(tableName, builder));
        }
    }
    /**
     * Compose provided fields.
     *
     * @param {Knex.TableBuilder} tableBuilder
     * @param {{}}                fields
     *
     * @returns {SchemaBuilder}
     */
    composeFields(tableBuilder, fields) {
        Object.getOwnPropertyNames(fields).forEach(property => {
            this.composeField(tableBuilder, fields[property]);
        });
        return this;
    }
    /**
     * Process the relations on mapping.
     *
     * @param {Mapping} mapping
     *
     * @returns {SchemaBuilder}
     */
    processRelations(mapping) {
        let entity = mapping.getTarget();
        let relations = mapping.getRelations();
        let joinColumns = [];
        if (!relations) {
            return;
        }
        Object.getOwnPropertyNames(relations).forEach(property => {
            let relation = relations[property];
            let targetMapping = Mapping_1.Mapping.forEntity(this.entityManager.resolveEntityReference(relation.targetEntity));
            if ((relation.type === Mapping_1.Mapping.RELATION_MANY_TO_ONE) || (relation.type === Mapping_1.Mapping.RELATION_ONE_TO_ONE && !relation.mappedBy)) {
                let column = mapping.getJoinColumn(property);
                joinColumns.push({
                    name: column.name,
                    type: 'integer',
                    unsigned: true
                });
                return;
            }
            // Nothing to do for other side.
            if (relation.type === Mapping_1.Mapping.RELATION_ONE_TO_MANY || !relation.inversedBy) {
                return;
            }
            // This is many to many.
            let referenceColumns = [];
            let referenceColumnsInverse = [];
            let joinTableFields = {
                id: {
                    name: 'id',
                    primary: true,
                    type: 'integer',
                    generatedValue: 'autoIncrement'
                }
            };
            let joinTable;
            if (relation.inversedBy) {
                joinTable = mapping.getJoinTable(property, this.entityManager);
            }
            else {
                joinTable = targetMapping.getJoinTable(relation.mappedBy, this.entityManager);
            }
            joinTable.joinColumns.forEach(joinColumn => {
                joinTableFields[joinColumn.name] = {
                    name: joinColumn.name,
                    type: joinColumn.type || 'integer',
                    size: joinColumn.size,
                    unsigned: true
                };
                referenceColumns.push(joinColumn.name);
            });
            joinTable.inverseJoinColumns.forEach(inverse => {
                joinTableFields[inverse.name] = {
                    name: inverse.name,
                    type: inverse.type || 'integer',
                    size: inverse.size,
                    unsigned: true
                };
                referenceColumnsInverse.push(inverse.referencedColumnName);
            });
            this.addBuilder(entity, joinTable.name, table => {
                this.composeFields(table, joinTableFields);
            });
        });
        this.addBuilder(entity, mapping.getTableName(), table => {
            joinColumns.forEach(joinColumn => {
                this.composeField(table, joinColumn);
            });
        }, true);
        return this;
    }
    /**
     * Compose the indexes for mapping.
     *
     * @param {Knex.TableBuilder} indexBuilder
     * @param {Mapping}           mapping
     *
     * @returns {SchemaBuilder}
     */
    composeIndexes(indexBuilder, mapping) {
        mapping.getIndexes().forEach(index => {
            indexBuilder.index(index.fields.map(field => mapping.getColumnName(field)), index.name);
        });
        mapping.getUniqueConstraints().forEach(constraint => {
            indexBuilder.unique(constraint.fields.map(field => mapping.getColumnName(field)), constraint.name);
        });
        return this;
    }
    /**
     * Compose a field.
     *
     * @param {Knex.TableBuilder} tableBuilder
     * @param {FieldOptions}      field
     */
    composeField(tableBuilder, field) {
        let column;
        if (field.generatedValue) {
            if (field.generatedValue === 'autoIncrement') {
                column = tableBuilder.increments(field.name);
            }
            else {
                throw new Error(`Unknown strategy '${field.generatedValue}' supplied for generatedValue.`);
            }
        }
        if (!column) {
            if (!field.type) {
                return;
            }
            if (this.types.indexOf(field.type) === -1) {
                throw new Error(`Unknown field type '${field.type}' supplied.`);
            }
            column = this[field.type](tableBuilder, field);
        }
        if (field.unsigned) {
            column.unsigned();
        }
        if (field.comment) {
            column.comment(field.comment);
        }
        if (field.nullable) {
            column.nullable();
        }
        else {
            column.notNullable();
        }
        if (field.primary) {
            column.primary();
        }
    }
    /**
     * Define a column type.
     *
     * @param {Knex.TableBuilder} table
     * @param {FieldOptions}      field
     *
     * @returns {ColumnBuilder}
     */
    integer(table, field) {
        return table.integer(field.name);
    }
    /**
     * Define a column type.
     *
     * @param {Knex.TableBuilder} table
     * @param {FieldOptions}      field
     *
     * @returns {ColumnBuilder}
     */
    bigInteger(table, field) {
        return table.bigInteger(field.name);
    }
    /**
     * Define a column type.
     *
     * @param {Knex.TableBuilder} table
     * @param {FieldOptions}      field
     *
     * @returns {ColumnBuilder}
     */
    text(table, field) {
        return table.text(field.name, field.textType || 'text');
    }
    /**
     * Define a column type.
     *
     * @param {Knex.TableBuilder} table
     * @param {FieldOptions}      field
     *
     * @returns {ColumnBuilder}
     */
    string(table, field) {
        return table.string(field.name, field.size || 255);
    }
    /**
     * Define a column type.
     *
     * @param {Knex.TableBuilder} table
     * @param {FieldOptions}      field
     *
     * @returns {ColumnBuilder}
     */
    float(table, field) {
        return table.float(field.name, field.precision || 8, field.scale || 2);
    }
    /**
     * Define a column type.
     *
     * @param {Knex.TableBuilder} table
     * @param {FieldOptions}      field
     *
     * @returns {ColumnBuilder}
     */
    decimal(table, field) {
        return table.decimal(field.name, field.precision || 8, field.scale || 2);
    }
    /**
     * Define a column type.
     *
     * @param {Knex.TableBuilder} table
     * @param {FieldOptions}      field
     *
     * @returns {ColumnBuilder}
     */
    boolean(table, field) {
        return table.boolean(field.name);
    }
    /**
     * Define a column type.
     *
     * @param {Knex.TableBuilder} table
     * @param {FieldOptions}      field
     *
     * @returns {ColumnBuilder}
     */
    date(table, field) {
        return table.date(field.name);
    }
    /**
     * Define a column type.
     *
     * @param {Knex.TableBuilder} table
     * @param {FieldOptions}      field
     *
     * @returns {ColumnBuilder}
     */
    dateTime(table, field) {
        return table.dateTime(field.name);
    }
    /**
     * Define a column type.
     *
     * @param {Knex.TableBuilder} table
     * @param {FieldOptions}      field
     *
     * @returns {ColumnBuilder}
     */
    datetime(table, field) {
        return table.dateTime(field.name);
    }
    /**
     * Define a column type.
     *
     * @param {Knex.TableBuilder} table
     * @param {FieldOptions}      field
     *
     * @returns {ColumnBuilder}
     */
    time(table, field) {
        return table.time(field.name);
    }
    /**
     * Define a column type.
     *
     * @param {Knex.TableBuilder} table
     * @param {FieldOptions}      field
     *
     * @returns {ColumnBuilder}
     */
    timestamp(table, field) {
        return table.timestamp(field.name);
    }
    /**
     * Define a column type.
     *
     * @param {Knex.TableBuilder} table
     * @param {FieldOptions}      field
     *
     * @returns {ColumnBuilder}
     */
    binary(table, field) {
        return table.binary(field.name);
    }
    /**
     * Define a column type.
     *
     * @param {Knex.TableBuilder} table
     * @param {FieldOptions}      field
     *
     * @returns {ColumnBuilder}
     */
    json(table, field) {
        return table.json(field.name);
    }
    /**
     * Define a column type.
     *
     * @param {Knex.TableBuilder} table
     * @param {FieldOptions}      field
     *
     * @returns {ColumnBuilder}
     */
    jsonb(table, field) {
        return table.jsonb(field.name);
    }
    /**
     * Define a column type.
     *
     * @param {Knex.TableBuilder} table
     * @param {FieldOptions}      field
     *
     * @returns {ColumnBuilder}
     */
    uuid(table, field) {
        return table.uuid(field.name);
    }
    /**
     * Define a column type.
     *
     * @param {Knex.TableBuilder} table
     * @param {FieldOptions}      field
     *
     * @returns {ColumnBuilder}
     */
    enumeration(table, field) {
        return table.enu(field.name, field.enumeration);
    }
}
exports.SchemaBuilder = SchemaBuilder;
