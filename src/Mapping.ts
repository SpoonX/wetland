import { Homefront } from 'homefront';
import { EntityRepository } from './EntityRepository';
import { MetaData } from './MetaData';
import { EntityManager } from './EntityManager';
import { EntityCtor, EntityInterface, ProxyInterface } from './EntityInterface';
import { ArrayCollection } from './ArrayCollection';

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
  private mapping: Homefront = new Homefront;

  /**
   * Entity this mapping is for.
   *
   * @type {EntityCtor}
   */
  private target: EntityCtor<T>;

  /**
   * @type {EntityManager}
   */
  private entityManager: EntityManager;

  /**
   * @type {Array}
   */
  private stagedMappings: Array<{ method: string, parameters: any }> = [];

  /**
   * Create a new mapping.
   *
   * @param {EntityCtor} [entity]
   */
  public constructor(entity?: EntityCtor<T>) {
    if (!entity) {
      return;
    }

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
  public static forEntity<T>(target: EntityCtor<T> | T | ProxyInterface): Mapping<T> {
    if (!target) {
      throw new Error('Trying to get mapping for non-target.');
    }

    target = target['isEntityProxy'] ? (target as ProxyInterface).getTarget() : target;
    const entity = MetaData.getConstructor(target) as EntityCtor<T>;
    const metadata = MetaData.forTarget(entity);

    if (!metadata.fetch('mapping')) {
      metadata.put('mapping', new Mapping(entity));
    }

    return metadata.fetch('mapping') as Mapping<T>;
  }

  /**
   * Raw command for current timestamp.
   *
   * @returns {{}}
   */
  public static now(): { __raw: string } {
    return { __raw: 'CURRENT_TIMESTAMP' };
  }

  /**
   * Restore a serialized mapping.
   *
   * NOTE: Unless provided, there won't be an entity reference.
   *
   * @param {{}} mappingData
   *
   * @returns {Mapping}
   */
  public static restore(mappingData: Object): Mapping<ProxyInterface> {
    const mapping = new Mapping();

    mapping.getMappingData().merge(mappingData);

    return mapping;
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
   * Set the entity manager target was registered to.
   *
   * @param {EntityManager} entityManager
   *
   * @returns {Mapping}
   */
  public setEntityManager(entityManager: EntityManager): this {
    this.entityManager = entityManager;

    this.applyStagedMappings();

    return this;
  }

  /**
   * Raw command for current timestamp.
   *
   * @returns {{}}
   */
  public now(): { __raw: string } {
    return Mapping.now();
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
    const entityManager = this.stageOrGetManager('field', arguments);

    if (!entityManager) {
      return this;
    }

    const toUnderscore = entityManager.getConfig().fetch('mapping.defaultNamesToUnderscore');
    const propertyName = toUnderscore ? this.nameToUnderscore(property) : property;
    const field = this.mapping.fetchOrPut(`fields.${property}`, {});

    if (field.name) {
      this.mapping.remove(`columns.${this.getColumnName(property)}`);
    } else {
      field.name = propertyName;
    }

    Homefront.merge(field, options);

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
   * @param {string}  property
   * @param {boolean} [tolerant] Don't throw an error, but return null
   *
   * @returns {FieldOptions}
   */
  public getField(property: string, tolerant: boolean = false): FieldOptions {
    const field = this.mapping.fetch(`fields.${property}`);

    if (!field) {
      if (tolerant) {
        return null;
      }

      throw new Error(`Unknown field "${property}" supplied on entity "${this.getEntityName()}".`);
    }

    return field;
  }

  /**
   * @returns {Homefront}
   */
  public getMappingData(): Homefront {
    return this.mapping;
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
   * Get the field names (property names) from the mapping.
   *
   * @param {boolean} includeRelations
   */
  public getFieldNames(includeRelations: boolean = false): Array<string> {
    const fields = this.getFields();

    return Reflect.ownKeys(fields).reduce((fieldNames, fieldName: string) => {
      if (!fields[fieldName].relationship || includeRelations) {
        fieldNames.push(fieldName);
      }

      return fieldNames;
    }, []);
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
    const entityManager = this.stageOrGetManager('entity', arguments);

    if (!entityManager) {
      return;
    }

    const toUnderscore = entityManager.getConfig().fetch('mapping.defaultNamesToUnderscore');
    const tableName = toUnderscore ? this.nameToUnderscore(this.target.name) : this.target.name.toLowerCase();

    const defaultMapping = {
      repository: EntityRepository,
      name: this.target.name,
      tableName: tableName,
      store: null,
    };

    Homefront.merge(this.mapping.fetchOrPut(`entity`, defaultMapping), options);

    return this;
  }

  /**
   * Convenience method, returning an array of column names mapped from provided properties.
   *
   * @param {string|string[]} properties
   *
   * @returns {string[]}
   */
  public getColumnNames(properties: Array<string>): Array<string> {
    if (!Array.isArray(properties)) {
      properties = [ (properties as string) ];
    }

    return properties.map(column => this.getColumnName(column));
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
    const unprocessed = this.mapping.fetchOrPut(`unprocessed_indexes`, []);

    unprocessed.push({ indexName, fields });

    return this;
  }

  /**
   * Get the indexes.
   *
   * @returns {{}}
   */
  public getIndexes(): { [key: string]: Array<string> } {
    this.processIndexes();

    return this.mapping.fetch('index', {});
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
    const unprocessed = this.mapping.fetchOrPut(`unprocessed_uniques`, []);

    unprocessed.push({ constraintName, fields });

    return this;
  }

  /**
   * Get the unique constraints.
   *
   * @returns {{}}
   */
  public getUniqueConstraints(): { [key: string]: Array<string> } {
    this.processUniqueConstraints();

    return this.mapping.fetch('unique', {});
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
  public primary(property: string): this {
    this.mapping.put('primary', property);

    this.extendField(property, { primary: true });

    return this;
  }

  /**
   * Convenience method that automatically sets a PK id.
   *
   * @returns {Mapping}
   */
  public autoPK(): this {
    return this.increments('id').primary('id');
  }

  /**
   * Convenience method that automatically sets a createdAt.
   *
   * @returns {Mapping}
   */
  public autoCreatedAt(): this {
    return this.field('createdAt', { type: 'datetime', defaultTo: this.now() });
  }

  /**
   * Convenience method that automatically sets an updatedAt.
   *
   * @returns {Mapping}
   */
  public autoUpdatedAt(): this {
    return this.field('updatedAt', { type: 'datetime', defaultTo: this.now() });
  }

  /**
   * Convenience method that automatically sets a PK, updatedAt and createdAt.
   *
   * @returns {Mapping}
   */
  public autoFields(): this {
    return this.autoPK().autoCreatedAt().autoUpdatedAt();
  }

  /**
   * Get the column name for the primary key.
   *
   * @returns {string|null}
   */
  public getPrimaryKeyField(): string {
    const primaryKey = this.getPrimaryKey();

    if (!primaryKey) {
      return null;
    }

    return this.getFieldName(primaryKey, primaryKey);
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
  public getFields(): { [key: string]: FieldOptions } {
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
    this.extendField(property, { generatedValue: type });

    return this;
  }

  /**
   * Convenience method to set auto increment.
   *
   * @param {string} property
   *
   * @returns {Mapping}
   */
  public increments(property: string): this {
    return this.generatedValue(property, 'autoIncrement');
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
  public addRelation(property: string, options: Relationship): this {
    if (!options.targetEntity) {
      throw new Error('Required property "targetEntity" not found in options.');
    }

    this.setDefaultCascades(property);

    this.extendField(property, { relationship: options });
    Homefront.merge(this.mapping.fetchOrPut('relations', {}), { [property]: options });

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
   * Get the type for a property.
   *
   * @param {string}property
   *
   * @returns {string}
   */
  public getType(property: string): string {
    return this.mapping.fetch(`fields.${property}.type`, 'string');
  }

  /**
   * Get the relations for mapped entity.
   *
   * @returns {{}}
   */
  public getRelations(): { [key: string]: Relationship } {
    return this.mapping.fetch('relations');
  }

  /**
   * Get the relations for mapped entity.
   *
   * @returns {Relationship}
   */
  public getRelation(property: string): Relationship {
    return this.mapping.fetch(`relations.${property}`);
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
    this.addRelation(property, {
      type: Mapping.RELATION_ONE_TO_ONE,
      targetEntity: options.targetEntity,
      inversedBy: options.inversedBy,
      mappedBy: options.mappedBy,
    });

    if (!options.mappedBy) {
      this.ensureJoinColumn(property);
    }

    return this;
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
      type: Mapping.RELATION_ONE_TO_MANY,
      mappedBy: options.mappedBy,
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
    this.addRelation(property, {
      targetEntity: options.targetEntity,
      type: Mapping.RELATION_MANY_TO_ONE,
      inversedBy: options.inversedBy,
    });

    this.ensureJoinColumn(property);

    return this;
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
      type: Mapping.RELATION_MANY_TO_MANY,
      inversedBy: options.inversedBy,
      mappedBy: options.mappedBy,
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
  public joinColumn(property: string, options: JoinColumn): this {
    return this.ensureJoinColumn(property, options);
  }

  /**
   * Get the join column for the relationship mapped via property.
   *
   * @param {string}    property
   * @param {JoinTable} [options]
   *
   * @returns {Mapping}
   */
  public ensureJoinColumn(property: string, options?: JoinColumn): this {
    const field = this.mapping.fetchOrPut(`fields.${property}`, { joinColumn: {} });
    field.joinColumn = Homefront.merge({
      name: `${property}_id`,
      referencedColumnName: 'id',
      unique: false,
      nullable: true,
    }, options || field.joinColumn);

    return this;
  }

  /**
   * Get join table.
   *
   * @param {string} property
   *
   * @returns {JoinTable}
   */
  public getJoinTable(property: string): JoinTable {
    if (!this.entityManager) {
      throw new Error('EntityManager is required on the mapping. Make sure you registered the entity.');
    }

    const field = this.mapping.fetchOrPut(`fields.${property}`, { joinTable: { name: '' } }) as FieldOptions;

    if (field.joinTable && field.joinTable.complete) {
      return field.joinTable;
    }

    const relationMapping = Mapping.forEntity(this.entityManager.resolveEntityReference(field.relationship.targetEntity));
    const ownTableName = this.getTableName();
    const withTableName = relationMapping.getTableName();
    const ownPrimary = this.getPrimaryKeyField();
    const withPrimary = relationMapping.getPrimaryKeyField();
    field.joinTable = Homefront.merge({
      complete: true,
      name: `${ownTableName}_${withTableName}`,
      joinColumns: [ {
        referencedColumnName: ownPrimary,
        name: `${ownTableName}_id`,
        type: 'integer',
      } ],
      inverseJoinColumns: [ {
        referencedColumnName: withPrimary,
        name: `${withTableName}_id`,
        type: 'integer',
      } ],
    }, field.joinTable) as JoinTable;

    return field.joinTable;
  }

  /**
   * Get join column.
   *
   * @param {string} property
   *
   * @returns {JoinColumn}
   */
  public getJoinColumn(property: string): JoinColumn {
    return this.getField(property).joinColumn;
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
    const field = this.mapping.fetchOrPut(`fields.${property}`, {});
    const needsName = !field.name;

    if (needsName) {
      field.name = property;
    }

    Homefront.merge(field, additional);

    if (needsName) {
      this.mapColumn(this.getColumnName(property) || property, property);
    }

    return this;
  }

  /**
   * Get a Field scope mapping.
   *
   * @param {string} property
   *
   * @returns {Field}
   */
  public forProperty(property: string) {
    return new Field(property, this);
  }

  /**
   * Complete the mapping.
   *
   * @returns {Mapping}
   */
  public completeMapping(): this {
    const relations = this.getRelations();
    const manager = this.entityManager;

    for (const property in relations) {
      const relation = relations[property];

      this.setDefaultCascades(property);

      // Make sure joinTable is complete.
      if (relation.type === Mapping.RELATION_MANY_TO_MANY && relation.inversedBy) {
        this.getJoinTable(property);
      }

      if (!relation.mappedBy) {
        this.ensureJoinColumn(property);
      }

      // Make sure refs are strings
      if (typeof relation.targetEntity !== 'string') {
        const reference = manager.resolveEntityReference(relation.targetEntity);
        relation.targetEntity = Mapping.forEntity(reference).getEntityName();
      }
    }

    this.processIndexes();
    this.processUniqueConstraints();

    return this;
  }

  /**
   * Returns the mapping in complete mode. Doesn't include the repository.
   *
   * @returns {{}}
   */
  public serializable(): Object {
    return this.completeMapping().mapping.expand();
  }

  /**
   * Apply staged mappings.
   *
   * @returns {Mapping}
   */
  private applyStagedMappings(): this {
    this.stagedMappings.forEach(stagedMapping => {
      this[stagedMapping.method](...stagedMapping.parameters);
    });

    this.stagedMappings = [];

    return this;
  }

  /**
   * Stage given method, or get the entity manager based on the presence of the entity manager.
   *
   * @param {string} method     The method to call.
   * @param {*}      parameters The arguments to call the method with.
   *
   * @returns {EntityManager}
   */
  private stageOrGetManager(method: string, parameters: any): EntityManager {
    if (!this.entityManager) {
      this.stagedMappings.push({ method, parameters });

      return;
    }

    return this.entityManager;
  }

  /**
   * Replace name case to underscore.
   *
   * @param {string} property
   *
   * @returns {string}
   */
  private nameToUnderscore(property: string): string {
    const name = property[0].toLowerCase() + property.slice(1);

    return name.replace(/[A-Z]/g, '_$&').replace('__', '_').toLowerCase();
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
   * Process unprocessed indexes.
   *
   * @returns {Mapping}
   */
  private processIndexes(): this {
    const unprocessed = this.mapping.fetch(`unprocessed_indexes`);

    if (!unprocessed) {
      return;
    }

    unprocessed.forEach(index => {
      let indexName = index.indexName;
      let fields = index.fields;

      if (!fields) {
        fields = this.getColumnNames(Array.isArray(indexName) ? indexName : [ indexName ]);
        indexName = `idx_${this.getTableName()}_${fields.join('_').toLowerCase()}`;
      } else {
        fields = this.getColumnNames(fields);
      }

      const indexes = this.mapping.fetchOrPut(`index.${indexName}`, new ArrayCollection);

      indexes.add(...fields);
    });

    this.mapping.remove(`unprocessed_indexes`);

    return this;
  }

  /**
   * Process unprocessed constraints.
   *
   * @returns {Mapping}
   */
  private processUniqueConstraints(): this {
    const unprocessed = this.mapping.fetch(`unprocessed_uniques`);

    if (!unprocessed) {
      return;
    }

    unprocessed.forEach(constraint => {
      let constraintName = constraint.constraintName;
      let fields = constraint.fields;

      if (!fields) {
        fields = this.getColumnNames(Array.isArray(constraintName) ? constraintName : [ constraintName ]);
        constraintName = `${this.getTableName()}_${fields.join('_').toLowerCase()}_unique`;
      } else {
        fields = this.getColumnNames(fields);
      }

      const constraints = this.mapping.fetchOrPut(`unique.${constraintName}`, new ArrayCollection);

      constraints.add(...fields);
    });

    this.mapping.remove(`unprocessed_uniques`);

    return this;
  }

  /**
   * Sets the default cascades if no cascade options exist
   *
   * @param {string} property
   *
   * @returns {Mapping}
   */
  private setDefaultCascades(property: string): this {
    if (!this.entityManager) {
      return;
    }

    const field = this.getField(property, true);

    if (field && typeof field.cascades === 'undefined') {
      this.cascade(property, this.entityManager.getConfig().fetch('mapping.defaults.cascades', []));
    }

    return this;
  }
}

/**
 * Convenience class for chaining field definitions.
 */
export class Field {
  /**
   * @type {string}
   */
  private property: string;

  /**
   * @type {Mapping}
   */
  private mapping: Mapping<EntityInterface>;

  /**
   * Construct convenience class to map property.
   *
   * @param {string}  property
   * @param {Mapping} mapping
   */
  constructor(property: string, mapping: Mapping<EntityInterface>) {
    this.property = property;
    this.mapping = mapping;
  }

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
  public field(options: FieldOptions): this {
    this.mapping.field(this.property, options);

    return this;
  }

  /**
   * Map to be the primary key.
   *
   * @return {Field}
   */
  public primary(): this {
    this.mapping.primary(this.property);

    return this;
  }

  /**
   * Generate a PK field id
   *
   * @return {Field}
   */
  public autoPK() {
    this.mapping.autoPK();

    return this;
  }

  /**
   * Generate a createdAt field
   *
   * @return {Field}
   */
  public autoCreatedAt() {
    this.mapping.autoCreatedAt();

    return this;
  }

  /**
   * Generate an updatedAt field
   *
   * @return {Field}
   */
  public autoUpdatedAt() {
    this.mapping.autoUpdatedAt();

    return this;
  }

  /**
   * Generate a PK, createdAt and updatedAt field
   *
   * @return {Field}
   */
  public autoFields() {
    this.mapping.autoFields();

    return this;
  }

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
  public generatedValue(type: string): this {
    this.mapping.generatedValue(this.property, type);

    return this;
  }

  /**
   * Set cascade values.
   *
   * @param {string[]}  cascades
   *
   * @returns {Field}
   */
  public cascade(cascades: Array<string>): this {
    this.mapping.cascade(this.property, cascades);

    return this;
  }

  /**
   * Convenience method for auto incrementing values.
   *
   * @returns {Field}
   */
  public increments(): this {
    this.mapping.increments(this.property);

    return this;
  }

  /**
   * Map a relationship.
   *
   * @param {Relationship} options
   *
   * @returns {Field}
   */
  public oneToOne(options: Relationship): this {
    this.mapping.oneToOne(this.property, options);

    return this;
  }

  /**
   * Map a relationship.
   *
   * @param {Relationship} options
   *
   * @returns {Field}
   */
  public oneToMany(options: Relationship): this {
    this.mapping.oneToMany(this.property, options);

    return this;
  }

  /**
   * Map a relationship.
   *
   * @param {Relationship} options
   *
   * @returns {Field}
   */
  public manyToOne(options: Relationship): this {
    this.mapping.manyToOne(this.property, options);

    return this;
  }

  /**
   * Map a relationship.
   *
   * @param {Relationship} options
   *
   * @returns {Field}
   */
  public manyToMany(options: Relationship): this {
    this.mapping.manyToMany(this.property, options);

    return this;
  }

  /**
   * Register a join table.
   *
   * @param {JoinTable} options
   *
   * @returns {Field}
   */
  public joinTable(options: JoinTable): this {
    this.mapping.joinTable(this.property, options);

    return this;
  }

  /**
   * Register a join column.
   *
   * @param {JoinTable} options
   *
   * @returns {Field}
   */
  public joinColumn(options: JoinColumn): this {
    this.mapping.joinColumn(this.property, options);

    return this;
  }
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
  defaultTo?: any | Object;
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
  complete?: boolean;
  joinColumns?: Array<JoinColumn>;
  inverseJoinColumns?: Array<JoinColumn>;
}

export interface JoinColumn {
  referencedColumnName?: string;
  name?: string;
  type?: string;
  size?: number;
  indexName?: string;
  onDelete?: string;
  onUpdate?: string;
  unique?: boolean;
  nullable?: boolean;
}

export interface Relationship {
  targetEntity: string | EntityCtor<EntityInterface>;
  type?: string;
  inversedBy?: string;
  mappedBy?: string;
}
