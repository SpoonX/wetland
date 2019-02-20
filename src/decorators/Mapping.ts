import { FieldOptions, JoinColumn, JoinTable, Mapping, Relationship } from '../Mapping';
import { EntityRepository } from '../EntityRepository';

/**
 * Decorate an entity. Examples:
 *
 *  - Default name and repository
 *    @entity()
 *    class Foo {}
 *
 *  - Custom name and repository
 *    @entity({repository: MyRepository, name: 'custom'})
 *    class Foo {}
 *
 * @param {{}} [options]
 *
 * @return {Mapping}
 */
export function entity(options?: { repository?: typeof EntityRepository, name?: string, [key: string]: any }) {
  return (target: Object) => {
    Mapping.forEntity(target).entity(options);
  };
}

/**
 * Decorate autoFields (id, createdAt, updatedAt) for an entity.
 *
 * @return {Mapping}
 */
export function autoFields() {
  return (target: Object) => {
    Mapping.forEntity(target).autoFields();
  };
}

/**
 * Decorate your entity with an index. Examples:
 *
 *  - Compound
 *    @index('idx_something', ['property1', 'property2'])
 *
 *  - Single
 *    @index('idx_something', ['property'])
 *    @index('idx_something', 'property')
 *
 *  - Generated index name "idx_property"
 *    @index('property')
 *    @index(['property1', 'property2'])
 *
 * @param {Array|string} indexName
 * @param {Array|string} [fields]
 *
 * @return {Mapping}
 */
export function index(indexName: string | Array<string>, fields?: string | Array<string>) {
  return (target: Object) => {
    Mapping.forEntity(target).index(indexName, fields);
  };
}

/**
 * Decorate your entity with a uniqueConstraint
 *
 *  - Compound:
 *    @uniqueConstraint('something_unique', ['property1', 'property2'])
 *
 *  - Single:
 *    @uniqueConstraint('something_unique', ['property'])
 *    @uniqueConstraint('something_unique', 'property')
 *
 *  - Generated uniqueConstraint name:
 *    @uniqueConstraint('property')
 *    @uniqueConstraint(['property1', 'property2'])
 *
 * @param {Array|string} constraintName
 * @param {Array|string} [fields]
 *
 * @return {Function}
 */
export function uniqueConstraint(constraintName: string | Array<string>, fields?: string | Array<string>) {
  return (target: Object) => {
    Mapping.forEntity(target).uniqueConstraint(constraintName, fields);
  };
}

/**
 * Decorate a property as a field. Examples:
 *
 *  - Default (property) name
 *    @field('username', {type: 'string', length: 255})
 *    username: string;
 *
 *  - Custom name
 *    @field('password', {type: 'string', name: 'passwd'})
 *    password: string;
 *
 * @param {{}} options
 *
 * @return {Mapping}
 */
export function field(options: FieldOptions) {
  return (target: Object, property: string) => {
    Mapping.forEntity(target).field(property, options);
  };
}

/**
 * Map to be the primary key.
 *
 * @return {Field}
 */
export function primary() {
  return (target: Object, property: string) => {
    Mapping.forEntity(target).primary(property);
  };
}

/**
 * Convenience method that automatically sets a PK id.
 *
 * @returns {Mapping}
 */
export function autoPK() {
  return (target: Object) => {
    Mapping.forEntity(target).autoPK();
  };
}

/**
 * Convenience method that automatically sets a createdAt.
 *
 * @returns {Mapping}
 */
export function autoCreatedAt() {
  return (target: Object) => {
    Mapping.forEntity(target).autoCreatedAt();
  };
}

/**
 * Convenience method that automatically sets an updatedAt.
 *
 * @returns {Mapping}
 */
export function autoUpdatedAt() {
  return (target: Object) => {
    Mapping.forEntity(target).autoUpdatedAt();
  };
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
export function generatedValue(type: string) {
  return (target: Object, property: string) => {
    Mapping.forEntity(target).generatedValue(property, type);
  };
}

/**
 * Set cascade values.
 *
 * @param {string[]}  cascades
 *
 * @returns {Field}
 */
export function cascade(cascades: Array<string>) {
  return (target: Object, property: string) => {
    Mapping.forEntity(target).cascade(property, cascades);
  };
}

/**
 * Convenience method for auto incrementing values.
 *
 * @returns {Field}
 */
export function increments() {
  return (target: Object, property: string) => {
    Mapping.forEntity(target).increments(property);
  };
}

/**
 * Map a relationship.
 *
 * @param {Relationship} options
 *
 * @returns {Field}
 */
export function oneToOne(options: Relationship) {
  return (target: Object, property: string) => {
    Mapping.forEntity(target).oneToOne(property, options);
  };
}

/**
 * Map a relationship.
 *
 * @param {Relationship} options
 *
 * @returns {Field}
 */
export function oneToMany(options: Relationship) {
  return (target: Object, property: string) => {
    Mapping.forEntity(target).oneToMany(property, options);
  };
}

/**
 * Map a relationship.
 *
 * @param {Relationship} options
 *
 * @returns {Field}
 */
export function manyToOne(options: Relationship) {
  return (target: Object, property: string) => {
    Mapping.forEntity(target).manyToOne(property, options);
  };
}

/**
 * Map a relationship.
 *
 * @param {Relationship} options
 *
 * @returns {Field}
 */
export function manyToMany(options: Relationship) {
  return (target: Object, property: string) => {
    Mapping.forEntity(target).manyToMany(property, options);
  };
}

/**
 * Register a join table.
 *
 * @param {JoinTable} options
 *
 * @returns {Field}
 */
export function joinTable(options: JoinTable) {
  return (target: Object, property: string) => {
    Mapping.forEntity(target).joinTable(property, options);
  };
}

/**
 * Register a join column.
 *
 * @param {JoinTable} options
 *
 * @returns {Field}
 */
export function joinColumn(options: JoinColumn) {
  return (target: Object, property: string) => {
    Mapping.forEntity(target).joinColumn(property, options);
  };
}
