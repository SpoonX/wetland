import {Mapping} from "../Mapping";
import {EntityRepository} from "../EntityRepository";

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
export function field(options: {type: string, size?: number, [key: string]: any}) {
  return (target: Object, property: string) => {
    Mapping.forEntity(target).field(property, options);
  };
}

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
export function entity(options?: {repository?: typeof EntityRepository, name?: string, [key: string]: any}) {
  return (target: Object) => {
    Mapping.forEntity(target).entity(options);
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
 * Decorate a property to be the primary key. Example:
 *
 *  @primary('id')
 *  public id: number;
 *
 * @return {Mapping}
 */
export function primary() {
  return (target: Object, property: string) => {
    Mapping.forEntity(target).primary(property);
  };
}

/**
 * Decorate your property with generatedValues. Example:
 *
 *  @generatedValue('autoIncrement')
 *  public id: number;
 *
 * @param {string} type
 *
 * @return {Mapping}
 */
export function generatedValue(type: string) {
  return (target: Object, property: string) => {
    Mapping.forEntity(target).generatedValue(property, type);
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
