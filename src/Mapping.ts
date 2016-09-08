import {Homefront} from 'homefront';
import {EntityRepository} from './EntityRepository';
import {MetaData} from './MetaData';

export class Mapping {

  /**
   * The mapping data.
   *
   * @type {Homefront}
   */
  public mapping: Homefront = new Homefront;

  /**
   * Entity this mapping is for.
   *
   * @type {Function}
   */
  private target: Function;

  /**
   * Get the mapping for a specific entity.
   *
   * @param {Function} entity
   *
   * @return {Mapping}
   */
  public static forEntity(entity: Function | Object): Mapping {
    entity       = MetaData.getConstructor(entity);
    let metadata = MetaData.forTarget(entity);

    if (!metadata.fetch('mapping')) {
      metadata.put('mapping', new Mapping(entity as Function));
    }

    return metadata.fetch('mapping');
  }

  /**
   * Create a new mapping.
   *
   * @param {Function} entity
   */
  public constructor(entity: Function) {
    this.target = entity;

    // Set up default entity mapping information.
    this.entity();
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
  public field(property: string, options: {type: string, size?: number, [key: string]: any}): Mapping {
    Homefront.merge(this.mapping.fetchOrPut(`fields.${property}`, {name: property}), options);

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
  public getColumnName(property):string | null {
    return this.mapping.fetch(`fields.${property}.name`, null);
  }

  /**
   * Get the property name for a column name
   *
   * @param {string} column
   *
   * @returns {string|null}
   */
  public getPropertyName(column):string | null {
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
  private mapColumn(column, property): Mapping {
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
  public getColumns(alias: string = null): Array<string> {
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
  public entity(options: Object = {}): Mapping {
    let defaultMapping = {
      repository: EntityRepository,
      name      : this.target.name.toLowerCase(),
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
  public index(indexName: string | Array<string>, fields?: string | Array<string>): Mapping {
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
  public id(property: string): Mapping {
    this.mapping.put('primary', property);

    Homefront.merge(this.mapping.fetchOrPut(`fields.${property}`, {}), {primary: true});

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
  public getFieldName(property:string , defaultValue: any = null): string {
    return this.mapping.fetch(`fields.${property}.name`, defaultValue);
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
  public generatedValue(property: string, type: string): Mapping {
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
}

interface Entity {
  repository?: typeof EntityRepository,
  name?: string,
  store?: string | null,
  [key: string]: any
}
