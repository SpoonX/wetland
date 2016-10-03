import {Homefront} from 'homefront';
import {EntityRepository} from './EntityRepository';
import {MetaData} from './MetaData';
import {EntityManager} from './EntityManager';
import {Scope} from './Scope';
import {EntityCtor} from './EntityInterface';

export class Mapping<T> {

  /**
   * @type {string}
   */
  public static RELATION_ONE_TO_MANY = 'oneToMany';

  /**
   * @type {string}
   */
  public static RELATION_MANY_TO_MANY = 'manyToMany';

  /**
   * @type {string}
   */
  public static RELATION_MANY_TO_ONE = 'manyToOne';

  /**
   * @type {string}
   */
  public static RELATION_ONE_TO_ONE = 'oneToOne';

  /**
   * @type {string}
   */
  public static CASCADE_PERSIST = 'persist';

  /**
   * The mapping data.
   *
   * @type {Homefront}
   */
  public mapping: Homefront = new Homefront;

  /**
   * Entity this mapping is for.
   *
   * @type {EntityCtor}
   */
  private target: EntityCtor<T>;

  /**
   * Get the mapping for a specific entity.
   *
   * @param {EntityCtor} target
   *
   * @return {Mapping}
   */
  public static forEntity<T>(target: EntityCtor<T> | T): Mapping<T> {
    let entity   = MetaData.getConstructor(target) as EntityCtor<T>;
    let metadata = MetaData.forTarget(entity);

    if (!metadata.fetch('mapping')) {
      metadata.put('mapping', new Mapping(entity));
    }

    return metadata.fetch('mapping') as Mapping<T>;
  }

  /**
   * Create a new mapping.
   *
   * @param {EntityCtor} entity
   */
  public constructor(entity: EntityCtor<T>) {
    this.target = entity;

    // Set up default entity mapping information.
    this.entity();
  }

  /**
   * Get the target this mapping is for.
   *
   * @returns {EntityCtor}
   */
  public getTarget(): EntityCtor<T> {
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
  public field(property: string, options: FieldOptions): this {
    Homefront.merge(this.mapping.fetchOrPut(`fields.${property}`, {name: property}), options);

    this.mapColumn(this.getColumnName(property), property);

    return this;
  }

  /**
   * Get the repository class for this mapping's entity.
   *
   * @returns {EntityRepository}
   */
  public getRepository(): new (...args: any[]) => EntityRepository<T> {
    return this.mapping.fetch('entity.repository');
  }

  /**
   * Get the column name for a property.
   *
   * @param {string} property
   *
   * @returns {string|null}
   */
  public getColumnName(property): string | null {
    return this.getField(property).name;
  }

  /**
   * Get the options for provided `property` (field).
   *
   * @param {string} property
   *
   * @returns {FieldOptions}
   */
  public getField(property: string): FieldOptions {
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
  public getPropertyName(column): string | null {
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
  private mapColumn(column, property): this {
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
  public entity(options: Object = {}): this {
    let defaultMapping = {
      repository: EntityRepository,
      name      : this.target.name,
      tableName : this.target.name.toLowerCase(),
      store     : null
    };

    Homefront.merge(this.mapping.fetchOrPut(`entity`, defaultMapping), options);

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
  public index(indexName: string | Array<string>, fields?: string | Array<string>): this {
    if (!fields) {
      fields    = (Array.isArray(indexName) ? indexName : [indexName]) as Array<string>;
      indexName = 'idx_' + (fields as Array<string>).join('_').toLowerCase();
    }

    fields      = Array.isArray(fields) ? fields : ([fields] as Array<string>);
    let indexes = this.mapping.fetchOrPut(`indexes`, []);

    indexes.push({name: indexName, fields});

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
  public id(property: string): this {
    this.mapping.put('primary', property);

    this.extendField(property, {primary: true});

    return this;
  }

  /**
   * Get the column name for the primary key.
   *
   * @returns {string|null}
   */
  public getPrimaryKeyField(): string {
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
  public getPrimaryKey(): string {
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
  public getFieldName(property: string, defaultValue: any = null): string {
    return this.mapping.fetch(`fields.${property}.name`, defaultValue);
  }

  /**
   * Get the fields for mapped entity.
   *
   * @returns {FieldOptions[]}
   */
  public getFields(): Array<FieldOptions> {
    return this.mapping.fetch('fields', null);
  }

  /**
   * Get the name of the entity.
   *
   * @returns {string}
   */
  public getEntityName(): string {
    return this.mapping.fetch('entity.name');
  }

  /**
   * Get the name of the table.
   *
   * @returns {string}
   */
  public getTableName(): string {
    return this.mapping.fetch('entity.tableName');
  }

  /**
   * Get the name of the store mapped to this entity.
   *
   * @returns {string}
   */
  public getStoreName(): string {
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
  public generatedValue(property: string, type: string): this {
    Homefront.merge(this.mapping.fetchOrPut(`fields.${property}`, {}), {generatedValue: type});

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
  public uniqueConstraint(constraintName: string | Array<string>, fields?: string | Array<string>) {
    if (!fields) {
      fields         = (Array.isArray(constraintName) ? constraintName : [constraintName]) as Array<string>;
      constraintName = (fields as Array<string>).join('_').toLowerCase() + '_unique';
    }

    fields      = (Array.isArray(fields) ? fields : [fields]) as Array<string>;
    let indexes = this.mapping.fetchOrPut(`uniqueConstraints`, []);

    indexes.push({name: constraintName, fields});

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
  public cascade(property: string, cascades: Array<string>): this {
    return this.extendField(property, {cascades: cascades});
  }

  /**
   * Add a relation to the mapping.
   *
   * @param {string}       property
   * @param {Relationship} options
   *
   * @returns {Mapping}
   */
  public addRelation(property: string, options: Relationship): this {
    this.extendField(property, {relationship: options});
    Homefront.merge(this.mapping.fetchOrPut('relations', {}), {[property]: options});

    return this;
  }

  /**
   * Does property exist as relation.
   *
   * @param {string} property
   *
   * @returns {boolean}
   */
  public isRelation(property: string): boolean {
    return !!this.mapping.fetch(`relations.${property}`);
  }

  /**
   * Get the relations for mapped entity.
   *
   * @returns {{}}
   */
  public getRelations(): {[key: string]: Relationship} {
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
  public oneToOne(property: string, options: Relationship): this {
    return this.addRelation(property, {
      type        : Mapping.RELATION_ONE_TO_ONE,
      targetEntity: options.targetEntity,
      inversedBy  : options.inversedBy,
      mappedBy    : options.mappedBy
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
  public oneToMany(property: string, options: Relationship): this {
    return this.addRelation(property, {
      targetEntity: options.targetEntity,
      type        : Mapping.RELATION_ONE_TO_MANY,
      mappedBy    : options.mappedBy
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
  public manyToOne(property: string, options: Relationship): this {
    return this.addRelation(property, {
      targetEntity: options.targetEntity,
      type        : Mapping.RELATION_MANY_TO_ONE,
      inversedBy  : options.inversedBy
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
  public manyToMany(property: string, options: Relationship): this {
    return this.addRelation(property, {
      targetEntity: options.targetEntity,
      type        : Mapping.RELATION_MANY_TO_MANY,
      inversedBy  : options.inversedBy,
      mappedBy    : options.mappedBy
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
  public joinTable(property: string, options: JoinTable): this {
    this.extendField(property, {joinTable: options});

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
  public joinColumn(property: string, options: JoinColumn): this {
    this.extendField(property, {joinColumn: options});

    return this;
  }

  /**
   * Get the join column for the relationship mapped via property.
   *
   * @param {string} property
   *
   * @returns {JoinColumn}
   */
  public getJoinColumn(property: string): JoinColumn {
    let field = this.getField(property);

    if (!field.joinColumn) {
      field.joinColumn = {
        name                : `${property}_id`,
        referencedColumnName: 'id',
        unique              : false,
        nullable            : true
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
  public getJoinTable(property: string, entityManager?: EntityManager| Scope): JoinTable {
    let field = this.getField(property);

    if (!field.joinTable) {
      if (!entityManager) {
        return null;
      }

      let relationMapping = Mapping.forEntity(entityManager.resolveEntityReference(field.relationship.targetEntity));
      let ownTableName    = this.getTableName();
      let withTableName   = relationMapping.getTableName();
      let ownPrimary      = this.getPrimaryKeyField();
      let withPrimary     = relationMapping.getPrimaryKeyField();

      field.joinTable = {
        name              : `${ownTableName}_${withTableName}`,
        joinColumns       : [{referencedColumnName: ownPrimary, name: `${ownTableName}_id`}],
        inverseJoinColumns: [{referencedColumnName: withPrimary, name: `${withTableName}_id`}]
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
  public extendField(property: string, additional: Object): this {
    Homefront.merge(this.mapping.fetchOrPut(`fields.${property}`, {}), additional);

    return this;
  }
}

export interface FieldOptions {
  type: string,
  size?: number,
  name?: string,
  cascades?: Array<string>,
  relationship?: Relationship,
  joinColumn?: JoinColumn,
  joinTable?: JoinTable,
  [key: string]: any
}

export interface JoinTable {
  name: string,
  joinColumns?: Array<JoinColumn>,
  inverseJoinColumns?: Array<JoinColumn>
}

export interface JoinColumn {
  referencedColumnName: string,
  name: string,
  unique?: boolean,
  nullable?: boolean
}

export interface Relationship {
  targetEntity: string|{new ()},
  type?: string,
  inversedBy?: string,
  mappedBy?: string
}
