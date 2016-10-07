import {Mapping, FieldOptions} from './Mapping';
import {EntityInterface, EntityCtor} from './EntityInterface';
import * as Knex from 'knex';
import {Scope} from './Scope';
import {Store} from './Store';

export class SchemaBuilder {

  /**
   * @type {Array}
   */
  private creates: Array<Knex.SchemaBuilder> = [];

  /**
   * @type {Array}
   */
  private alters: Array<Knex.SchemaBuilder> = [];

  /**
   * @type {Scope}
   */
  private entityManager: Scope;

  /**
   * @type {boolean}
   */
  private built: boolean = false;

  /**
   * @type {string[]}
   */
  private types = [
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

  /**
   * @param {Scope} entityManager
   */
  public constructor(entityManager: Scope) {
    this.entityManager = entityManager;
  }

  /**
   * Get the schema queries.
   *
   * @returns {string}
   */
  public getSQL(): string {
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
  public apply() {
    let createQueries = [];

    this.creates.forEach(create => {
      createQueries.push(create.then());
    });

    return Promise.all(createQueries).then(() => {
      let alterQueries = [];

      this.alters.forEach(alter => {
        alterQueries.push(alter.then());
      });

      return Promise.all(alterQueries);
    });
  }

  /**
   * Create the schema.
   *
   * @returns {SchemaBuilder}
   */
  public create(): this {
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
  private processEntity(entity: EntityCtor<EntityInterface>) {
    let mapping   = Mapping.forEntity(entity);
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
  private addBuilder(entity: EntityCtor<EntityInterface>, tableName: string, builder: (tableBuilder: Knex.CreateTableBuilder) => any, alter: boolean = false) {
    let schemaBuilder = this.entityManager.getStore(entity).getConnection(Store.ROLE_MASTER).schema;

    if (alter) {
      this.alters.push(schemaBuilder.table(tableName, builder) as Knex.SchemaBuilder);
    } else {
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
  private composeFields(tableBuilder: Knex.TableBuilder, fields: {[key: string]: FieldOptions}): this {
    Object.getOwnPropertyNames(fields).forEach(property => {
      this.composeField(tableBuilder, fields[property])
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
  private processRelations(mapping: Mapping<EntityInterface>): this {
    let entity      = mapping.getTarget();
    let relations   = mapping.getRelations();
    let foreignKeys = [];
    let joinColumns = [];

    if (!relations) {
      return;
    }

    Object.getOwnPropertyNames(relations).forEach(property => {
      let relation      = relations[property];
      let targetMapping = Mapping.forEntity(this.entityManager.resolveEntityReference(relation.targetEntity));

      if ((relation.type === Mapping.RELATION_MANY_TO_ONE) || (relation.type === Mapping.RELATION_ONE_TO_ONE && !relation.mappedBy)) {
        let column = mapping.getJoinColumn(property);

        joinColumns.push({
          name    : column.name,
          type    : 'integer',
          unsigned: true,
          nullable: true
        });

        return foreignKeys.push({
          owning    : property,
          foreign   : column.name,
          references: column.referencedColumnName,
          inTable   : targetMapping.getTableName()
        });
      }

      // Nothing to do for other side.
      if (relation.type === Mapping.RELATION_ONE_TO_MANY || !relation.inversedBy) {
        return;
      }

      // This is many to many.
      let foreignColumns          = [];
      let referenceColumns        = [];
      let foreignColumnsInverse   = [];
      let referenceColumnsInverse = [];
      let joinTableIndexes        = [];
      let joinTableFields         = {
        id: {
          name          : 'id',
          primary       : true,
          type          : 'integer',
          generatedValue: 'autoIncrement'
        }
      };

      let joinTable;

      if (relation.inversedBy) {
        joinTable = mapping.getJoinTable(property, this.entityManager);
      } else {
        joinTable = targetMapping.getJoinTable(relation.mappedBy, this.entityManager);
      }

      joinTable.joinColumns.forEach(joinColumn => {
        joinTableFields[joinColumn.name] = {
          name    : joinColumn.name,
          type    : joinColumn.type || 'integer',
          size    : joinColumn.size,
          unsigned: true,
          nullable: true
        };

        joinTableIndexes.push({columns: joinColumn.name, name: joinColumn.indexName || `idx_${joinColumn.name}`});
        foreignColumns.push(joinColumn.referencedColumnName);
        referenceColumns.push(joinColumn.name);
      });

      joinTable.inverseJoinColumns.forEach(inverse => {
        joinTableFields[inverse.name] = {
          name    : inverse.name,
          type    : inverse.type || 'integer',
          size    : inverse.size,
          unsigned: true,
          nullable: true
        };

        joinTableIndexes.push({columns: inverse.name, name: inverse.indexName || `idx_${inverse.name}`});
        foreignColumnsInverse.push(inverse.name);
        referenceColumnsInverse.push(inverse.referencedColumnName);
      });

      this.addBuilder(entity, joinTable.name, table => {
        this.composeFields(table, joinTableFields);
      });

      this.addBuilder(entity, joinTable.name, table => {
        joinTableIndexes.forEach(index => {
          table.index(index.columns, index.name);
        });
      }, true);

      // @todo both foreign keys go on the join table. You moron.
      this.addBuilder(entity, joinTable.name, table => {
        let foreign  = table.foreign(foreignColumnsInverse).references(referenceColumnsInverse).inTable(targetMapping.getTableName());
        let cascades = mapping.getField(property).cascades;

        if (!cascades) {
          return;
        }

        cascades.forEach(cascade => {
          if (cascade === Mapping.CASCADE_PERSIST) {
            return;
          }

          if (cascade === Mapping.CASCADE_UPDATE) {
            foreign.onUpdate('cascade');
          } else if (cascade === Mapping.CASCADE_DELETE) {
            foreign.onDelete('cascade');
          }
        });
      }, true);

      foreignKeys.push({
        foreign   : foreignColumns,
        references: referenceColumns,
        inTable   : joinTable.name,
        owning    : property
      });
    });

    this.addBuilder(entity, mapping.getTableName(), table => {
      joinColumns.forEach(joinColumn => {
        this.composeField(table, joinColumn);
      });

      foreignKeys.forEach(foreignKey => {
        let foreign  = table.foreign(foreignKey.foreign).references(foreignKey.references).inTable(foreignKey.inTable);
        let cascades = mapping.getField(foreignKey.owning).cascades;

        if (!cascades) {
          return;
        }

        cascades.forEach(cascade => {
          if (cascade === Mapping.CASCADE_PERSIST) {
            return;
          }

          if (cascade === Mapping.CASCADE_UPDATE) {
            foreign.onUpdate('cascade');
          } else if (cascade === Mapping.CASCADE_DELETE) {
            foreign.onDelete('cascade');
          }
        });
      });
    }, true);

    return this;
  }

  private applyCascades() {
    let cascades = mapping.getField(foreignKey.owning).cascades;

    if (!cascades) {
      return;
    }

    cascades.forEach(cascade => {
      if (cascade === Mapping.CASCADE_PERSIST) {
        return;
      }

      if (cascade === Mapping.CASCADE_UPDATE) {
        foreign.onUpdate('cascade');
      } else if (cascade === Mapping.CASCADE_DELETE) {
        foreign.onDelete('cascade');
      }
    });
  }

  /**
   * Compose the indexes for mapping.
   *
   * @param {Knex.TableBuilder} indexBuilder
   * @param {Mapping}           mapping
   *
   * @returns {SchemaBuilder}
   */
  private composeIndexes(indexBuilder: Knex.TableBuilder, mapping: Mapping<EntityInterface>): this {
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
  private composeField(tableBuilder: Knex.TableBuilder, field: FieldOptions) {
    let column;

    if (field.generatedValue) {
      if (field.generatedValue === 'autoIncrement') {
        column = tableBuilder.increments(field.name);
      } else {
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

      column = this[field.type](tableBuilder, field) as Knex.ColumnBuilder;
    }

    if (field.unsigned) {
      column.unsigned();
    }

    if (field.comment) {
      column.comment(field.comment);
    }

    if (field.nullable) {
      column.nullable();
    } else {
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
  public integer(table: Knex.TableBuilder, field: FieldOptions): Knex.ColumnBuilder {
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
  public bigInteger(table: Knex.TableBuilder, field: FieldOptions): Knex.ColumnBuilder {
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
  public text(table: Knex.TableBuilder, field: FieldOptions): Knex.ColumnBuilder {
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
  public string(table: Knex.TableBuilder, field: FieldOptions): Knex.ColumnBuilder {
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
  public float(table: Knex.TableBuilder, field: FieldOptions): Knex.ColumnBuilder {
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
  public decimal(table: Knex.TableBuilder, field: FieldOptions): Knex.ColumnBuilder {
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
  public boolean(table: Knex.TableBuilder, field: FieldOptions): Knex.ColumnBuilder {
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
  public date(table: Knex.TableBuilder, field: FieldOptions): Knex.ColumnBuilder {
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
  public dateTime(table: Knex.TableBuilder, field: FieldOptions): Knex.ColumnBuilder {
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
  public datetime(table: Knex.TableBuilder, field: FieldOptions): Knex.ColumnBuilder {
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
  public time(table: Knex.TableBuilder, field: FieldOptions): Knex.ColumnBuilder {
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
  public timestamp(table: Knex.TableBuilder, field: FieldOptions): Knex.ColumnBuilder {
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
  public binary(table: Knex.TableBuilder, field: FieldOptions): Knex.ColumnBuilder {
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
  public json(table: Knex.TableBuilder, field: FieldOptions): Knex.ColumnBuilder {
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
  public jsonb(table: Knex.TableBuilder, field: FieldOptions): Knex.ColumnBuilder {
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
  public uuid(table: Knex.TableBuilder, field: FieldOptions): Knex.ColumnBuilder {
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
  public enumeration(table: Knex.TableBuilder, field: FieldOptions): Knex.ColumnBuilder {
    return table.enu(field.name, field.enumeration);
  }
}
