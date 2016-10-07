/// <reference types="chai" />
import { EntityRepository } from "../EntityRepository";
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
export declare function field(options: {
    type: string;
    size?: number;
    [key: string]: any;
}): (target: Object, property: string) => void;
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
export declare function entity(options?: {
    repository?: typeof EntityRepository;
    name?: string;
    [key: string]: any;
}): (target: Object) => void;
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
export declare function index(indexName: string | Array<string>, fields?: string | Array<string>): (target: Object) => void;
/**
 * Decorate a property to be the primary key. Example:
 *
 *  @primary('id')
 *  public id: number;
 *
 * @return {Mapping}
 */
export declare function primary(): (target: Object, property: string) => void;
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
export declare function generatedValue(type: string): (target: Object, property: string) => void;
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
export declare function uniqueConstraint(constraintName: string | Array<string>, fields?: string | Array<string>): (target: Object) => void;
